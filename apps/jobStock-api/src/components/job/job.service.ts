import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import * as moment from 'moment';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Job, Jobs } from '../../libs/dto/job/job';
import {
	AllJobsInquiry,
	EmployerJobsInquiry,
	JobInput,
	JobsInquiry,
	OrdinaryInquiry,
} from '../../libs/dto/job/job.input';
import { JobStatus } from '../../libs/enums/job.enum';
import { JobUpdate } from '../../libs/dto/job/job.update';

@Injectable()
export class JobService {
	constructor(
		@InjectModel('Job') private readonly jobModel: Model<Job>,
		private memberService: MemberService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async createJob(input: JobInput): Promise<Job> {
		try {
			const result = await this.jobModel.create(input);
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberProperties', modifier: 1 });
			return result;
		} catch (err) {
			console.log('Error, Service.model: ', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getJob(memberId: ObjectId, jobId: ObjectId): Promise<Job> {
		const search: T = {
			_id: jobId,
			jobStatus: JobStatus.ACTIVE,
		};

		const targetJob: Job = await this.jobModel.findOne(search).lean().exec();
		if (!targetJob) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: jobId, viewGroup: ViewGroup.JOB };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.jobStatsEditor({ _id: jobId, targetKey: 'jobViews', modifier: 1 });
				targetJob.jobViews++;
			}
			// meLiked
			const likeInput: LikeInput = { memberId: memberId, likeRefId: jobId, likeGroup: LikeGroup.JOB };
			targetJob.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		targetJob.memberData = await this.memberService.getMember(null, targetJob.memberId);
		return targetJob;
	}

	public async updateJob(memberId: ObjectId, input: JobUpdate): Promise<Job> {
		let { jobStatus, closedAt, deletedAt } = input;
		const search: T = {
			_id: input._id,
			memberId: memberId,
			jobStatus: JobStatus.ACTIVE,
		};

		if (jobStatus === JobStatus.CLOSED) closedAt = moment().toDate();
		else if (jobStatus === JobStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.jobModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (closedAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberProperties',
				modifier: -1,
			});
		}
		return result;
	}

	public async getJobs(memberId: ObjectId, input: JobsInquiry): Promise<Jobs> {
		const match: T = { jobStatus: JobStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);
		console.log('match', match);

		const result = await this.jobModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
							lookupAuthMemberLiked(memberId),
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	private shapeMatchQuery(match: T, input: JobsInquiry): void {
		const {
			memberId,
			locationList,
			typeList,
			categoryList,
			salaryTypeList,
			skillsList,
			salaryRange,
			experienceRange,
			deadlineRange,
			options,
			text,
		} = input.search;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (locationList && locationList.length) match.jobLocation = { $in: locationList };
		if (skillsList && skillsList.length) match.jobSkills = { $in: skillsList };
		if (typeList && typeList.length) match.jobType = { $in: typeList };
		if (categoryList && categoryList.length) match.jobCategory = { $in: categoryList };
		if (salaryTypeList && salaryTypeList.length) match.salaryType = { $in: salaryTypeList };

		if (salaryRange) match.jobSalary = { $gte: salaryRange.start, $lte: salaryRange.end };
		if (experienceRange) match.jobExperience = { $gte: experienceRange.start, $lte: experienceRange.end };
		if (deadlineRange) match.jobApplicationDeadline = { $gte: deadlineRange.start, $lte: deadlineRange.end };

		if (text) match.jobTitle = { $regex: new RegExp(text, 'i') };
		if (options && options.length) {
			match['$or'] = options.map((ele) => {
				return { [ele]: true };
			});
		}
	}

	public async getFavorities(memberId: ObjectId, input: OrdinaryInquiry): Promise<Jobs> {
		return await this.likeService.getFavoriteJobs(memberId, input);
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Jobs> {
		return await this.viewService.getVisitedJobs(memberId, input);
	}

	public async getEmployerJobs(memberId: ObjectId, input: EmployerJobsInquiry): Promise<Jobs> {
		const { jobStatus } = input.search;
		if (jobStatus === JobStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

		const match: T = {
			memberId: memberId,
			jobStatus: jobStatus ?? { $ne: JobStatus.DELETE },
		};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.jobModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetJob(memberId: ObjectId, likeRefId: ObjectId): Promise<Job> {
		const target: Job = await this.jobModel
			.findOne({ _id: likeRefId, jobStatus: JobStatus.ACTIVE }) //
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.JOB,
		};

		// LIKE TOGGLE
		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.jobStatsEditor({ _id: likeRefId, targetKey: 'jobLikes', modifier: modifier });

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	// ADMIN

	public async getAllJobsByAdmin(input: AllJobsInquiry): Promise<Jobs> {
		const { jobStatus, jobLocationList, jobTypeList, jobCategoryList } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (jobStatus) match.jobStatus = jobStatus;
		if (jobLocationList) match.jobLocationList = { $in: jobLocationList };
		if (jobTypeList) match.jobTypeList = { $in: jobTypeList };
		if (jobCategoryList) match.jobCategory = { $in: jobCategoryList };

		const result = await this.jobModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updateJobByAdmin(input: JobUpdate): Promise<Job> {
		let { jobStatus, closedAt, deletedAt } = input;
		const search: T = {
			_id: input._id,
			jobStatus: JobStatus.ACTIVE,
		};

		if (jobStatus === JobStatus.CLOSED) closedAt = moment().toDate();
		else if (jobStatus === JobStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.jobModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (closedAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProperties',
				modifier: -1,
			});
		}

		return result;
	}

	public async removeJobByAdmin(jobId: ObjectId): Promise<Job> {
		const search: T = { _id: jobId, jobStatus: JobStatus.DELETE };
		const result = await this.jobModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async jobStatsEditor(input: StatisticModifier): Promise<Job> {
		const { _id, targetKey, modifier } = input;
		return await this.jobModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec();
	}
}

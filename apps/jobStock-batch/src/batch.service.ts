import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/jobStock-api/src/libs/dto/member/member';
import { Job } from 'apps/jobStock-api/src/libs/dto/job/job';
import { MemberStatus, MemberType } from 'apps/jobStock-api/src/libs/enums/member.enum';
import { JobStatus } from 'apps/jobStock-api/src/libs/enums/job.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Job') private readonly jobModel: Model<Job>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.jobModel.updateMany({ jobStatus: JobStatus.ACTIVE }, { jobRank: 0 }).exec();
		await this.memberModel
			.updateMany({ memberStatus: MemberStatus.ACTIVE, memberType: MemberType.RECRUITER }, { memberRank: 0 })
			.exec();
	}

	public async batchTopJobs(): Promise<void> {
		const jobs: Job[] = await this.jobModel
			.find({
				jobStatus: JobStatus.ACTIVE,
				jobRank: 0,
			})
			.exec();

		const promisedList = jobs.map(async (ele: Job) => {
			const { _id, jobLikes, jobViews } = ele;
			const rank = jobLikes * 2 + jobViews * 1;
			return await this.jobModel.findByIdAndUpdate(_id, { jobRank: rank });
		});
		await Promise.all(promisedList);
	}

	public async batchTopRecruiters(): Promise<void> {
		const recruiters: Member[] = await this.memberModel
			.find({
				memberType: MemberType.RECRUITER,
				memberStatus: MemberStatus.ACTIVE,
				memberRank: 0,
			})
			.exec();

		const promisedList = recruiters.map(async (ele: Member) => {
			const { _id, memberProperties, memberLikes, memberArticles, memberViews } = ele;
			const rank = memberProperties * 5 + memberArticles * 3 + memberLikes * 2 + memberViews * 1;
			return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
		});
		await Promise.all(promisedList);
	}

	public getHello(): string {
		return 'Welcome to JobStock Batch Server!';
	}
}

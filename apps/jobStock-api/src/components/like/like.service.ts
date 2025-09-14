import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupFavorite } from '../../libs/config';
import { NotificationService } from '../notification/notification.service';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { OrdinaryInquiry } from '../../libs/dto/job/job.input';
import { Jobs } from '../../libs/dto/job/job';

@Injectable()
export class LikeService {
	constructor(
		@InjectModel('Like') private readonly likeModel: Model<Like>,
		private readonly notificationService: NotificationService,
		@InjectModel('Job') private readonly jobModel: Model<any>,
		@InjectModel('BoardArticle') private readonly boardArticleModel: Model<any>,
		@InjectModel('Member') private readonly memberModel: Model<any>,
	) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
			exist = await this.likeModel.findOne(search).exec();
		let modifier: number = 1;

		if (exist) {
			await this.likeModel.findOneAndDelete(input).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input);

				// Get the correct receiverId and content info based on the like group
				let receiverId = input.likeRefId.toString();
				let notificationDesc = '';

				// Get the liker's name
				const liker = await this.memberModel.findById(input.memberId).exec();
				const likerName = liker ? liker.memberNick : 'Someone';

				if (input.likeGroup === LikeGroup.JOB) {
					const job = await this.jobModel.findById(input.likeRefId).exec();
					if (job) {
						receiverId = job.memberId.toString();
						notificationDesc = `${likerName} liked your job "${job.jobTitle}"`;
					}
				} else if (input.likeGroup === LikeGroup.ARTICLE) {
					const article = await this.boardArticleModel.findById(input.likeRefId).exec();
					if (article) {
						receiverId = article.memberId.toString();
						notificationDesc = `${likerName} liked your article "${article.articleTitle}"`;
					}
				} else if (input.likeGroup === LikeGroup.MEMBER) {
					notificationDesc = `${likerName} liked your profile`;
				}

				await this.notificationService.createNotification({
					notificationType: NotificationType.LIKE,
					notificationGroup: this.mapLikeGroupToNotificationGroup(input.likeGroup),
					notificationTitle: 'New Like',
					notificationDesc: notificationDesc,
					authorId: input.memberId.toString(),
					receiverId: receiverId,
				});
			} catch (err) {
				console.log('Error, likeService:', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}

		console.log(` - Like modifier '${modifier}' - `);
		return modifier;
	}

	private mapLikeGroupToNotificationGroup(likeGroup: LikeGroup): NotificationGroup {
		switch (likeGroup) {
			case LikeGroup.JOB:
				return NotificationGroup.JOB;
			case LikeGroup.ARTICLE:
				return NotificationGroup.ARTICLE;
			case LikeGroup.MEMBER:
				return NotificationGroup.MEMBER;
			default:
				return NotificationGroup.MEMBER;
		}
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId } = input;
		const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	public async getFavoriteJobs(memberId: ObjectId, input: OrdinaryInquiry): Promise<Jobs> {
		const { page, limit } = input;
		const match: T = { likeGroup: LikeGroup.JOB, memberId: memberId };

		const data = await this.likeModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'jobs',
						foreignField: '_id',
						localField: 'likeRefId',
						as: 'favoriteJob',
					},
				},
				{ $unwind: '$favoriteJob' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite,
							{ $unwind: '$favoriteJob.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		const result: Jobs = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.favoriteJob);
		console.log('result', result);

		return result;
	}
}

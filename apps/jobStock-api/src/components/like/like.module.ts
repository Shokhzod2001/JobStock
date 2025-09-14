import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { MongooseModule } from '@nestjs/mongoose';
import LikeSchema from '../../schemas/Like.model';
import { NotificationModule } from '../notification/notification.module';
import BoardArticleSchema from '../../schemas/BoardArticle.model';
import MemberSchema from '../../schemas/Member.model';
import JobSchema from '../../schemas/Job.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Like', schema: LikeSchema },
			{ name: 'Job', schema: JobSchema },
			{ name: 'BoardArticle', schema: BoardArticleSchema },
			{ name: 'Member', schema: MemberSchema },
		]),
		NotificationModule,
	],
	providers: [LikeService],
	exports: [LikeService],
})
export class LikeModule {}

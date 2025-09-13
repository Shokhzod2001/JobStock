import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';
import JobSchema from '../../schemas/Job.model';
import { JobResolver } from './job.resolver';
import { JobService } from './job.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Job', schema: JobSchema }]),
		AuthModule,
		ViewModule,
		MemberModule,
		LikeModule,
	],
	providers: [JobResolver, JobService],
	exports: [JobService],
})
export class JobModule {}

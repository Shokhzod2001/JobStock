import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { JobType, JobStatus, JobLocation, JobCategory } from '../../enums/job.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Job {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => JobType)
	jobType: JobType;

	@Field(() => JobCategory)
	jobCategory: JobCategory;

	@Field(() => JobStatus)
	jobStatus: JobStatus;

	@Field(() => JobLocation)
	jobLocation: JobLocation;

	@Field(() => String)
	jobAddress: string;

	@Field(() => String)
	jobTitle: string;

	@Field(() => Number)
	jobSalary: number;

	@Field(() => Int)
	jobExperience: number;

	@Field(() => [String])
	jobSkills: string[];

	@Field(() => String)
	jobRequirements: string;

	@Field(() => [String])
	jobBenefits: string[];

	@Field(() => Date)
	jobApplicationDeadline: Date;

	@Field(() => Int)
	jobViews: number;

	@Field(() => Int)
	jobLikes: number;

	@Field(() => Int)
	jobApplications: number;

	@Field(() => Int)
	jobComments: number;

	@Field(() => Int)
	jobRank: number;

	@Field(() => [String])
	jobImages: string[];

	@Field(() => String, { nullable: true })
	jobDesc?: string;

	@Field(() => Boolean)
	jobRemote: boolean;

	@Field(() => Boolean)
	jobVisaSponsor: boolean;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => Date, { nullable: true })
	closedAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	postedAt?: Date;

	// from aggregation
	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}

@ObjectType()
export class Jobs {
	@Field(() => [Job])
	list: Job[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

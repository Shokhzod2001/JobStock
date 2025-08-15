import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { JobLocation, JobStatus, JobType } from '../../enums/job.enum';

@InputType()
export class JobUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => JobType, { nullable: true })
	jobType?: JobType;

	@IsOptional()
	@Field(() => JobStatus, { nullable: true })
	jobStatus?: JobStatus;

	@IsOptional()
	@Field(() => JobLocation, { nullable: true })
	jobLocation?: JobLocation;

	@IsOptional()
	@Length(3, 200)
	@Field(() => String, { nullable: true })
	jobAddress?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	jobTitle?: string;

	@IsOptional()
	@Min(0)
	@Field(() => Number, { nullable: true })
	jobSalary?: number;

	@IsOptional()
	@Min(0)
	@Field(() => Number, { nullable: true })
	jobExperience?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	jobSkills?: string[];

	@IsOptional()
	@Length(10, 2000)
	@Field(() => String, { nullable: true })
	jobRequirements?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	jobBenefits?: string[];

	@IsOptional()
	@Field(() => Date, { nullable: true })
	jobApplicationDeadline?: Date;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	jobImages?: string[];

	@IsOptional()
	@Length(5, 5000)
	@Field(() => String, { nullable: true })
	jobDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	jobRemote?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	jobVisaSponsor?: boolean;

	closedAt?: Date;

	deletedAt?: Date;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	postedAt?: Date;
}

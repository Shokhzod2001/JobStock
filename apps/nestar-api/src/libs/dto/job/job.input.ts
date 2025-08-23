import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { Direction } from '../../enums/common.enum';
import { JobCategory, JobLocation, JobStatus, JobType, SalaryType } from '../../enums/job.enum';
import { availableJobSorts, availableOptions } from '../../config';

@InputType()
export class JobInput {
	@IsNotEmpty()
	@Field(() => JobType)
	jobType: JobType;

	@IsNotEmpty()
	@Field(() => JobCategory)
	jobCategory: JobCategory;

	@IsNotEmpty()
	@Field(() => JobLocation)
	jobLocation: JobLocation;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	jobAddress: string;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	jobTitle: string;

	@IsNotEmpty()
	@Min(0)
	@Field(() => Number)
	jobSalary: number;

	@IsNotEmpty()
	@Field(() => SalaryType)
	salaryType: SalaryType;

	@IsNotEmpty()
	@Min(0)
	@Field(() => Number)
	jobExperience: number;

	@IsNotEmpty()
	@Field(() => [String])
	jobSkills: string[];

	@IsNotEmpty()
	@Length(10, 500)
	@Field(() => String)
	jobRequirements: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	jobBenefits?: string[];

	@IsNotEmpty()
	@Field(() => Date)
	jobApplicationDeadline: Date;

	@IsNotEmpty()
	@Length(2, 100)
	@Field(() => String)
	companyName: string;

	@IsNotEmpty()
	@Field(() => [String])
	jobImages: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	jobDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	jobRemote?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	jobVisaSponsor?: boolean;

	memberId?: ObjectId;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	postedAt?: Date;
}

@InputType()
export class SalaryRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class ExperienceRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class DeadlineRange {
	@Field(() => Date)
	start: Date;

	@Field(() => Date)
	end: Date;
}

@InputType()
class JISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

	@IsOptional()
	@Field(() => [JobLocation], { nullable: true })
	locationList?: JobLocation[];

	@IsOptional()
	@Field(() => [JobType], { nullable: true })
	typeList?: JobType[];

	@IsOptional()
	@Field(() => [JobCategory], { nullable: true })
	categoryList?: JobCategory[];

	@IsOptional()
	@Field(() => [SalaryType], { nullable: true })
	salaryTypeList?: SalaryType[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	skillsList?: string[];

	@IsOptional()
	@Field(() => SalaryRange, { nullable: true })
	salaryRange?: SalaryRange;

	@IsOptional()
	@Field(() => ExperienceRange, { nullable: true })
	experienceRange?: ExperienceRange;

	@IsOptional()
	@Field(() => DeadlineRange, { nullable: true })
	deadlineRange?: DeadlineRange;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	companyName?: string;

	@IsOptional()
	@IsIn(availableOptions, { each: true })
	@Field(() => [String], { nullable: true })
	options?: string[];
}

@InputType()
export class JobsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableJobSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => JISearch)
	search: JISearch;
}

@InputType()
class EJISearch {
	@IsOptional()
	@Field(() => JobStatus, { nullable: true })
	jobStatus?: JobStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	companyName?: string;
}

@InputType()
export class EmployerJobsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableJobSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => EJISearch)
	search: EJISearch;
}

@InputType()
class AllJISearch {
	@IsOptional()
	@Field(() => JobStatus, { nullable: true })
	jobStatus?: JobStatus;

	@IsOptional()
	@Field(() => [JobLocation], { nullable: true })
	jobLocationList?: JobLocation[];

	@IsOptional()
	@Field(() => [JobType], { nullable: true })
	jobTypeList?: JobType[];

	@IsOptional()
	@Field(() => [JobCategory], { nullable: true })
	jobCategoryList?: JobCategory[];

	@IsOptional()
	@Field(() => [SalaryType], { nullable: true })
	salaryTypeList?: SalaryType[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	companyName?: string;
}

@InputType()
export class AllJobsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableJobSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => AllJISearch)
	search: AllJISearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;
}

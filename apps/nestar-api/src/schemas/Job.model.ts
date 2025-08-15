import { Schema } from 'mongoose';
import { JobLocation, JobStatus, JobType } from '../libs/enums/job.enum';

const JobSchema = new Schema(
	{
		jobType: {
			type: String,
			enum: JobType,
			required: true,
		},

		jobStatus: {
			type: String,
			enum: JobStatus,
			default: JobStatus.ACTIVE,
		},

		jobLocation: {
			type: String,
			enum: JobLocation,
			required: true,
		},

		jobAddress: {
			type: String,
			required: true,
		},

		jobTitle: {
			type: String,
			required: true,
		},

		jobSalary: {
			type: Number,
			required: true,
		},

		jobExperience: {
			type: Number,
			required: true,
		},

		jobSkills: {
			type: [String],
			required: true,
		},

		jobRequirements: {
			type: String,
			required: true,
		},

		jobBenefits: {
			type: [String],
			default: [],
		},

		jobApplicationDeadline: {
			type: Date,
			required: true,
		},

		jobViews: {
			type: Number,
			default: 0,
		},

		jobLikes: {
			type: Number,
			default: 0,
		},

		jobApplications: {
			type: Number,
			default: 0,
		},

		jobComments: {
			type: Number,
			default: 0,
		},

		jobRank: {
			type: Number,
			default: 0,
		},

		jobImages: {
			type: [String],
			required: true,
		},

		jobDesc: {
			type: String,
		},

		jobRemote: {
			type: Boolean,
			default: false,
		},

		jobVisaSponsor: {
			type: Boolean,
			default: false,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		closedAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		postedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true, collection: 'jobs' },
);

JobSchema.index({ jobType: 1, jobLocation: 1, jobTitle: 1, jobSalary: 1 }, { unique: true });

export default JobSchema;

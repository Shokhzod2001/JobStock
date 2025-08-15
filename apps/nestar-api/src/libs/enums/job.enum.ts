import { registerEnumType } from '@nestjs/graphql';

export enum JobType {
	FULL_TIME = 'FULL_TIME',
	PART_TIME = 'PART_TIME',
	CONTRACT = 'CONTRACT',
	INTERNSHIP = 'INTERNSHIP',
	TEMPORARY = 'TEMPORARY',
}
registerEnumType(JobType, {
	name: 'JobType',
});

export enum JobStatus {
	ACTIVE = 'ACTIVE',
	CLOSED = 'CLOSED',
	DELETE = 'DELETE',
}
registerEnumType(JobStatus, {
	name: 'JobStatus',
});

export enum JobLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
	REMOTE = 'REMOTE',
}
registerEnumType(JobLocation, {
	name: 'JobLocation',
});

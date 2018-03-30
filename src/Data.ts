export type UserId = string;
export type Url = string;
export type WorldId = string;

export interface Image {
	url: Url;
	thumbnail: Url;
}

export interface InstanceId {
	world: WorldId;
	instance: string;
}

export interface World {
	id: WorldId;
	name: string;
	description: string;
	featured: boolean;
	authorId: UserId;
	authorName: string;
	capacity: number;
	tags: string[];
	image: Image;
	instances: Map<InstanceId, number>;
}

export enum InstaceAccessTag {
	Public,
	FriendsPlus,
	Friends,
	Invite,
	InvitePlus
}

export interface Instance {
	id: InstanceId;
	users: User[];
	nonce?: string;
	access: InstaceAccessTag;
}

export interface User {
	id: UserId;
	userName: string;
	displayName: string;
	avatar: Image;
	location: InstanceId | null;
}

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

export interface Instance {
	id: InstanceId;
	users: User[];
	private: boolean;
	friends: boolean;
	nonce?: string;
}

export interface User {
	id: UserId;
	userName: string;
	displayName: string;
	avatar: Image;
	location: InstanceId | null;
}

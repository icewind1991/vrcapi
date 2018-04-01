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

export interface WorldInfo {
    id: WorldId;
    name: string;
    description: string;
    featured: boolean;
    authorId: UserId;
    authorName: string;
    capacity: number;
    tags: string[];
    image: Image;
}

export interface World extends WorldInfo {
    instances: Map<InstanceId, number>;
}

export enum InstanceAccessTag {
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
    access: InstanceAccessTag;
}

export interface User {
    id: UserId;
    userName: string;
    displayName: string;
    avatar: Image;
    location: InstanceId | null;
}

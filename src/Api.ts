import { InstanceAccessTag, Instance, InstanceId, User, World, WorldId, WorldInfo } from './Data';
import {
    AuthUserResponse, ConfigResponse, InstanceResponse, BaseUserResponse, UserResponse,
    WorldResponse, FriendsResponse, NotificationType, NotificationResponse, CurrentUserResponse
} from './ApiReponses';

function hasLocation(data: UserResponse | BaseUserResponse): data is UserResponse {
    return data.hasOwnProperty('location');
}

function formatUserResponse(data: UserResponse | BaseUserResponse, location?: InstanceId | null): User {
    if (!location) {
        location = (hasLocation(data) && data.instanceId) ? {
            world: data.worldId,
            instance: data.instanceId
        } : null;
    }
    return {
        id: data.id,
        userName: data.username,
        displayName: data.displayName,
        avatar: {
            url: data.currentAvatarImageUrl,
            thumbnail: data.currentAvatarThumbnailImageUrl
        },
        location
    };
}

export type CorsProxyHandler = (url: string) => string;

export interface Credentials {
    username: string;
    password: string;
}

const nullCorsProxy = url => url;

export class Api {
    constructor(credentials: Credentials, proxyHandler: CorsProxyHandler = nullCorsProxy) {
        this.credentials = credentials;
        this.proxyHandler = proxyHandler;
    }

    private apiKey: string = '';
    private proxyHandler: CorsProxyHandler;
    private credentials: Credentials = {
        username: '',
        password: ''
    };

    private cachedCurrentUser: Promise<User> | null = null;
    private cachedWorldInfo: Map<WorldId, Promise<WorldInfo>> = new Map();

    request(url: string, method: string = 'GET', body?: any): Promise<any> {
        return this.ensureApiKey().then(() => this.baseRequest(url, method, body));
    }

    baseRequest(url: string, method: string = 'GET', body?: any): Promise<any> {
        if (!this.credentials.username || !this.credentials.password) {
            throw new Error('No credentials set');
        }
        url += `${(url.indexOf('?') !== -1) ? '&' : '?'}apiKey=${this.apiKey}`;
        return fetch(this.proxyHandler(url), {
            mode: 'cors',
            method,
            body: body ? JSON.stringify(body) : null,
            headers: {
                'content-type': 'application/json',
                'authorization': `Basic ${btoa(`${this.credentials.username}:${this.credentials.password}`)}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data['error']) {
                    throw new Error(`${JSON.stringify(data['error'])} (url: ${url})`);
                } else {
                    return data;
                }
            });
    }

    private ensureApiKey(): Promise<void> {
        return this.apiKey ?
            Promise.resolve() :
            this.baseRequest(`https://vrchat.com/api/1/config`)
                .then((data: ConfigResponse) => {
                    this.apiKey = data.clientApiKey;
                });
    }

    getUserByName(name: string): Promise<User> {
        return this.request(`https://vrchat.com/api/1/users/${name}/name`)
            .then(formatUserResponse);
    }

    private parseInstanceAccessTag(data: InstanceResponse): InstanceAccessTag {
        if (data.hidden && !data.friends && !data.private) {
            return InstanceAccessTag.FriendsPlus;
        }
        if (data.friends && !data.private) {
            return InstanceAccessTag.Friends;
        }
        if (data.private && !data.canRequestInvite) {
            return InstanceAccessTag.Invite;
        }
        if (data.private && data.canRequestInvite) {
            return InstanceAccessTag.InvitePlus;
        }
        return InstanceAccessTag.Public;
    }

    getInstanceById(id: InstanceId): Promise<Instance> {
        return this.request(`https://vrchat.com/api/1/worlds/${id.world}/${id.instance}`)
            .then((data: InstanceResponse) => {
                return {
                    id,
                    users: data.users.map(user => formatUserResponse(user, id)),
                    access: this.parseInstanceAccessTag(data),
                    nonce: data.nonce
                };
            });
    }

    getWorldById(id: WorldId): Promise<World> {
        return this.request(`https://vrchat.com/api/1/worlds/${id}`)
            .then((data: WorldResponse) => {
                return {
                    id,
                    name: data.name,
                    description: data.description,
                    featured: data.featured,
                    authorId: data.authorId,
                    authorName: data.authorName,
                    capacity: data.capacity,
                    tags: data.tags,
                    image: {
                        url: data.imageUrl,
                        thumbnail: data.thumbnailImageUrl
                    },
                    instances: new Map(data.instances.map(instanceData => {
                        return [
                            {
                                world: id,
                                instance: instanceData[0]
                            },
                            instanceData[1]
                        ] as [InstanceId, number];
                    }))
                };
            });
    }

    getWorldInfoById(id: WorldId): Promise<WorldInfo> {
        const cached = this.cachedWorldInfo.get(id);
        if (cached) {
            return cached;
        }
        const promise = this.request(`https://vrchat.com/api/1/worlds/${id}`)
            .then((data: WorldResponse) => {
                return {
                    id,
                    name: data.name,
                    description: data.description,
                    featured: data.featured,
                    authorId: data.authorId,
                    authorName: data.authorName,
                    capacity: data.capacity,
                    tags: data.tags,
                    image: {
                        url: data.imageUrl,
                        thumbnail: data.thumbnailImageUrl
                    }
                };
            });
        this.cachedWorldInfo.set(id, promise);
        return promise;
    }

    private parseLocation(location: string): InstanceId | null {
        return (location.indexOf(':') === -1) ?
            null :
            {
                world: location.split(':')[0],
                instance: location.split(':')[1]
            };
    }

    getCurrentUser(): Promise<User> {
        if (this.cachedCurrentUser) {
            return this.cachedCurrentUser;
        }
        this.cachedCurrentUser = this.request('https://vrchat.com/api/1/auth/user')
            .then(formatUserResponse);
        return this.cachedCurrentUser;
    }

    getFriends(): Promise<User[]> {
        return this.request('https://vrchat.com/api/1/auth/user/friends')
            .then((data: FriendsResponse) => data.map(entry => formatUserResponse(entry, this.parseLocation(entry.location))));
    }

    inviteUser(userId: string, instance: InstanceId, message: string) {
        return this.sendNotification(userId, 'invite', message, {
            worldId: `${instance.world}:${instance.instance}`
        });
    }

    sendNotification(userId, type: NotificationType, message: string, details?: any) {
        const body = {
            type,
            details: details ? JSON.stringify(details) : null,
            message
        };
        return this.request(`https://vrchat.com/api/1/user/${userId}/notification`, 'POST', body);
    }

    sendFriendRequest(userId: string) {
        return this.request(`https://vrchat.com/api/1/user/${userId}/friendRequest`, 'POST');
    }

    acceptFriendRequest(notificationId: string) {
        return this.request(`https://vrchat.com/api/1/auth/user/notifications/${notificationId}/accept`, 'PUT');
    }

    deleteNotification(notificationId: string) {
        return this.request(`https://vrchat.com/api/1/auth/user/notifications/${notificationId}/hide`, 'PUT');
    }

    markNotificationAsRead(notificationId: string): Promise<NotificationResponse & { seen: true }> {
        return this.request(`https://vrchat.com/api/1/auth/user/notifications/${notificationId}/see`, 'PUT');
    }

    getNotifications(type?: NotificationType): Promise<NotificationResponse[]> {
        return this.request(`https://vrchat.com/api/1/auth/user/notifications?type=${type}`);
    }

    acceptAllFriendRequests(): Promise<number> {
        return this.getNotifications('friendrequest')
            .then(notifications => notifications.filter(notification => notification.type === 'friendrequest'))
            .then(friendRequests => Promise.all(friendRequests.map(friendRequest => this.acceptFriendRequest(friendRequest.id))))
            .then(acceptedRequests => acceptedRequests.length);
    }
}


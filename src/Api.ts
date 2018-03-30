import {InstaceAccessTag, Instance, InstanceId, User, World, WorldId} from './Data';
import {
	AuthUserResponse, ConfigResponse, InstanceResponse, BaseUserResponse, UserResponse,
	WorldResponse, FriendsResponse
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

export interface Credentails {
	username: string;
	password: string;
}

const nullCorsProxy = url => url;

export class Api {
	constructor(credentials: Credentails, proxyHandler: CorsProxyHandler = nullCorsProxy) {
		this.credentials = credentials;
		this.proxyHandler = proxyHandler;
	}

	private apiKey: string = '';
	private proxyHandler: CorsProxyHandler;
	private credentials: Credentails = {
		username: '',
		password: ''
	};

	getRequest(url: string): Promise<any> {
		return this.ensureApiKey().then(() => this.baseRequest(url));
	}

	baseRequest(url: string): Promise<any> {
		if (!this.credentials.username || !this.credentials.password) {
			throw new Error('No credentials set');
		}
		return fetch(this.proxyHandler(url), {
			mode: 'cors',
			headers: {
				'cookie': `apiKey=${this.apiKey}`,
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
			this.baseRequest(`https://api.vrchat.cloud/api/1/config`)
				.then((data: ConfigResponse) => {
					this.apiKey = data.clientApiKey;
				});
	}

	getUserByName(name: string): Promise<User> {
		return this.getRequest(`https://vrchat.com/api/1/users/${name}/name`)
			.then(formatUserResponse);
	}

	private parseInstanceAccessTag(data: InstanceResponse): InstaceAccessTag {
		if (data.hidden && !data.friends && !data.private) {
			return InstaceAccessTag.FriendsPlus;
		}
		if (data.friends && !data.private) {
			return InstaceAccessTag.Friends;
		}
		if (data.private && !data.canRequestInvite) {
			return InstaceAccessTag.Invite;
		}
		if (data.private && data.canRequestInvite) {
			return InstaceAccessTag.InvitePlus;
		}
		return InstaceAccessTag.Public;
	}

	getInstanceById(id: InstanceId): Promise<Instance> {
		return this.getRequest(`https://vrchat.com/api/1/worlds/${id.world}/${id.instance}`)
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
		return this.getRequest(`https://vrchat.com/api/1/worlds/${id}`)
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

	private parseLocation(location: string): InstanceId | null {
		return (location.indexOf(':') !== -1) ?
			null :
			{
				world: location.split(':')[0],
				instance: location.split(':')[1]
			};
	}

	getFriends(): Promise<User[]> {
		return this.getRequest('https://vrchat.com/api/1/auth/user/friends')
			.then((data: FriendsResponse) => data.map(entry => formatUserResponse(entry, this.parseLocation(entry.location))));
	}
}

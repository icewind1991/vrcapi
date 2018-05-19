export type DeveloperType = 'none' | 'trusted' | 'internal' | 'moderator';

export interface BaseUserResponse {
    id: string;
    username: string;
    displayName: string;
    currentAvatarImageUrl: string;
    currentAvatarThumbnailImageUrl: string;
    developerType: DeveloperType;
    tags: string[];
}

export interface PastDisplayName {
    displayName: string;
    updated_at: string;
}

export interface UserResponse extends BaseUserResponse {
    pastDisplayNames: PastDisplayName[];
    worldId: string;
    instanceId: string;
    location: string;
}

export interface WorldResponse {
    id: string;
    name: string;
    description: string;
    featured: boolean;
    authorId: string;
    authorName: string
    totalLikes: number;
    totalVisits: number;
    capacity: number;
    tags: string[];
    releaseStatus: string;
    imageUrl: string;
    thumbnailImageUrl: string;
    assetUrl: string;
    pluginUrl: string;
    unityPackageUrl: string;
    namespace: string;
    unityPackageUpdated: boolean;
    unityPackages: {
        id: string;
        assetUrl: string
        pluginUrl: string;
        unityVersion: string;
        unitySortNumber: number;
        assetVersion: number;
        platform: string;
        created_at: string;
    }[];
    isSecure: boolean;
    isLockdown: boolean;
    version: number;
    organization: string;
    instances: [string, number][];
}

export interface InstanceResponse {
    id: string;
    private: boolean;
    friends: boolean;
    users: BaseUserResponse[];
    name: string;
    hidden?: string;
    canRequestInvite?: string;
    nonce?: string;
}

export interface ConfigResponse {
    messageOfTheDay: string;
    timeOutWorld: string;
    gearDemoRoomId: string;
    releaseServerVersionStandalone: string;
    downloadLinkWindows: string;
    releaseAppVersionStandalone: string;
    devAppVersionStandalone: string;
    devServerVersionStandalone: string;
    devDownloadLinkWindow: string;
    currentTOSVersion: number;
    releaseSdkUrl: string;
    releaseSdkVersion: string;
    whiteListedAssertUrls: string;
    clientApiKey: string;
    viveWindowsUrl: string;
    sdkUnityVersion: string;
    hubWorldId: string;
    homeWorldId: string;
    tutorialWorldId: string;
    disableEventStream: boolean;
    registrationShitList: string;
    address: string;
    contactEmail: string;
    supportEmail: string;
    jobsEmail: string;
    copyrightEmail: string
    moderationEmail: string;
    appName: string;
    serverName: string;
    deploymentGroup: string;
    buildVersionTag: string;
    apiKey: string;
}

export interface AuthUserResponse {
    id: string;
    username: string;
    displayName: string;
    pastDisplayNames: PastDisplayName[];
    hasEmail: boolean;
    obfuscatedEmail: string;
    emailVerified: boolean;
    hasBirthday: string;
    unsubscribe: string;
    friends: string[];
    blueprints: any;
    currentAvatarBluePrints: any;
    events: string[];
    currentAvatar: string;
    currentAvatarImageUrl: string;
    currentAvatarAssetUrl: string;
    currentAvatarThumbnailImageUrl: string;
    acceptedTOSVersion: number;
    steamDetails: {};
    hasLoggedInFromClient: boolean;
    tags: string[];
    developerType: DeveloperType;
    authToken: string;
}

export interface LocationUserResponse extends BaseUserResponse {
    location: string;
}

export type FriendsResponse = LocationUserResponse[];

export type NotificationType = 'all' | 'message' | 'friendrequest' | 'invite' | 'votetokick' | 'halp' | 'hidden' | 'requestinvite';

export interface NotificationResponse {
    id: string;
    senderUserId: string;
    senderUserName: string;
    type: NotificationType;
    message: string;
    details: string;
    seen: boolean;
    created_at: string;
}

export interface CurrentUserResponse extends BaseUserResponse {
    pastDisplayNames: PastDisplayName[];
    hasEmail: boolean;
    obfuscatedEmail: string;
    emailVerified: boolean;
    hasBirthday: boolean;
    unsubscribe: boolean;
    friends: string[]
    bluePrints: {};
    currentAvatarBluePrint: {};
    events: any[];
    currentAvatar: string;
    currentAvatarAssetUrl: string;
    acceptedTOSVersion: string;
    steamDetails: {};
    hasLoggedInFromClient: boolean;
    homeLocation: string;
    authToken: string;
}

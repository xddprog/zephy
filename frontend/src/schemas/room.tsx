import type { BaseUserModel } from "./user";

export interface CreateStreamInterface {
    name: string;
}


export interface CreateTokenInterface {
    streamId?: string;
}


export interface StreamInfo {
    id: string;
    name: string;
    streamerInfo: BaseUserModel;
    description: string;
    createdAt: Date;
    isLive: boolean;
    isStreamer: boolean;
}

export interface StreamMessage {
    id: number;
    createdAt: Date;
    userId: number;
    username: string;
    message: string;
}

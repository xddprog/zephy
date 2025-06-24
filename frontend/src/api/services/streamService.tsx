import type { AxiosInstance, AxiosResponse } from "axios";
import type { CreateStreamInterface, CreateTokenInterface, StreamInfo, StreamMessage} from "../../schemas/room";


export class StreamService {
    axiosInstance: AxiosInstance;

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance = axiosInstance;
    }

    public BASE_URL = "/stream";

    public async createStream(roomData: CreateStreamInterface): Promise<AxiosResponse> {
        return this.axiosInstance.post(`${this.BASE_URL}`, roomData);
    }

    public async createToken(data: CreateTokenInterface): Promise<AxiosResponse> {
        return this.axiosInstance.post(`${this.BASE_URL}/token`, data);
    }

    public async getStreamInfo(roomId?: string): Promise<AxiosResponse<StreamInfo>> {
        return this.axiosInstance.get(`${this.BASE_URL}/${roomId}`);
    }
    
    public async getMessages(roomId: string): Promise<AxiosResponse<StreamMessage[]>> {
        return this.axiosInstance.get(`${this.BASE_URL}/${roomId}/messages`);
    }
}
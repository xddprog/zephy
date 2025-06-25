// src/components/StreamVideo.jsx
import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import type { StreamInfo } from '../../schemas/room';
import { VideoConference } from './VideoConference';


interface StreamVideoProps {
    streamInfo: StreamInfo;
    token: string;
}

function StreamVideo({ streamInfo, token }: StreamVideoProps) {
    return streamInfo && token && (
        <div className="flex items-center justify-center bg-zinc-800 w-screen h-[500px]">
            <LiveKitRoom
                serverUrl={import.meta.env.VITE_LIVEKIT_SERVER_URL}
                token={token}
                connect={true}
                video={streamInfo?.isStreamer}
                audio={streamInfo?.isStreamer}
                className="w-full h-full flex-1"
            >
                <VideoConference streamInfo={streamInfo} />
            </LiveKitRoom>
        </div>
    );
}

export default StreamVideo;
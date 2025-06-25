import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosClientWithAuth } from '../../api/client/axiosClient';
import { StreamService } from '../../api/services/streamService';
import StreamsMenu from '../../components/stream/StreamsMenu';
import StreamVideo from '../../components/stream/StreamVideo';
import type { StreamInfo, TokenData } from '../../schemas/room';


function StreamPage() {
    const { streamId } = useParams()
    const [streamInfo, setStreamInfo] = useState<StreamInfo>()
    const [tokenData, setTokenData] = useState<TokenData>()
    const service = new StreamService(axiosClientWithAuth)
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        service.getStreamInfo(streamId).then(res => {
            if (res.status === 200) {
                setStreamInfo(res.data)
            } else {
                messageApi.error('Failed to get stream info');
            }
        })
        service.createToken({ streamId: streamId }).then(res => {
            if (res.status === 200) {
                setTokenData(res.data);
            } else {
                messageApi.error('Failed to get token for the room');
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [streamId])
    return (
        <>
            {contextHolder}
            {streamId && streamInfo && tokenData && (
                <div className='flex justify-between'>
                    <StreamsMenu />
                    <StreamVideo
                        streamInfo={streamInfo}
                        token={tokenData.token}
                    />
                </div>
            )}
        </>
    )
}

export default StreamPage;
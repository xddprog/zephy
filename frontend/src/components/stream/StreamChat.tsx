import { MenuFoldOutlined, MenuUnfoldOutlined, SendOutlined } from '@ant-design/icons';
import { useChat } from '@livekit/components-react/hooks';
import { Button, message } from "antd";
import { useEffect, useState } from "react";
import { axiosClientWithAuth } from "../../api/client/axiosClient";
import { StreamService } from "../../api/services/streamService";
import type { StreamMessage } from '../../schemas/room';
import InputWithEmoji from '../ui/InputWithEmoji';
interface ChatProps {
    streamId: string;
}

function StreamChat({ streamId }: ChatProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [messages, setMessages] = useState<StreamMessage[]>([]);
    const roomService = new StreamService(axiosClientWithAuth);
    const [messageApi, contextHolder] = message.useMessage();
    const [inputMessage, setInputMessage] = useState<string>('');

    const { chatMessages, send, isSending } = useChat()

    useEffect(() => {
        roomService.getMessages(streamId).then((res) => {
            if (res.status == 200) {
                setMessages(res.data);
            } else {
                messageApi.error('Ошибка при получении сообщений');
            }
        })
    })

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className={`flex flex-col ${collapsed ? 'w-20' : 'w-[330px]'} bg-[#17191b] text-white h-screen flex-shrink-0`}>
            {contextHolder}
            <div className={`flex ${collapsed ? 'justify-center' : 'justify-between pl-6'} items-center pt-2`}>
                {!collapsed && <p className="text-white font-light text-m">
                    Чат стрима
                </p>}
                <Button type="text" onClick={toggleCollapsed}>
                    {collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                </Button>
                <div className='flex gap-2 justify-between'>
                    <InputWithEmoji fieldValue={inputMessage} setFieldValue={setInputMessage} />
                    <Button type="primary">
                        <SendOutlined />
                    </Button>
                </div>
            </div>
        </div>
    );
}


export default StreamChat;
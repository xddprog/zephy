import { MenuFoldOutlined, MenuUnfoldOutlined, SendOutlined } from '@ant-design/icons';
import { useChat, useDataChannel } from '@livekit/components-react/hooks';
import { Button, message } from "antd";
import { useEffect, useState } from "react";
import { axiosClientWithAuth } from "../../api/client/axiosClient";
import { StreamService } from "../../api/services/streamService";
import type { StreamMessage } from '../../schemas/room';
import InputWithEmoji from '../ui/InputWithEmoji';
import { observer } from 'mobx-react-lite';
import { useUserStore } from '../../stores/hooks';

interface ChatProps {
    streamId: string;
}

const StreamChat = observer(({ streamId }: ChatProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const [messages, setMessages] = useState<StreamMessage[]>([]);
    const roomService = new StreamService(axiosClientWithAuth);
    const [messageApi, contextHolder] = message.useMessage();
    const [inputMessage, setInputMessage] = useState<string>('');
    const userStore = useUserStore()

    const { send } = useChat()

    useDataChannel(streamId, (msg) => {
        try {
            const parsed: StreamMessage = JSON.parse(new TextDecoder().decode(msg.payload));
            setMessages((prev) => {
                if (prev.find((m) => m.id === parsed.id)) {
                    return prev;
                }
                return [...prev, parsed];
            });
        } catch (err) {
            console.error('Failed to parse message:', err);
        }
    });

    useEffect(() => {
        roomService.getMessages(streamId).then((res) => {
            if (res.status == 200) {
                setMessages(res.data);
            } else {
                messageApi.error('Ошибка при получении сообщений');
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [streamId]);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const handleSendMessage = async () => {
        if (inputMessage.trim()) {
            send(JSON.stringify({
                message: inputMessage,
                userId: userStore.user?.id,
                username: userStore.user?.username
            }), { topic: streamId });
            setInputMessage('');
        }
    };

    return (
        <div className={`flex flex-col ${collapsed ? 'w-20' : 'w-[330px]'} bg-[#17191b] text-white flex-shrink-0 h-full`}>
            {contextHolder}

            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-4'} py-3 border-b border-gray-700`}>
                <Button type="text" onClick={toggleCollapsed} className="text-white">
                    {collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                </Button>
                {!collapsed && (
                    <h3 className="text-white font-light text-m m-0">
                        Чат стрима
                    </h3>
                )}
            </div>

            {!collapsed && (
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                        <p className="text-gray-400 text-center mt-4">Нет сообщений</p>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="mb-3">
                                <p className="text-white">{msg.username}: {msg.message}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!collapsed && (
                <div className="flex justify-between p-4 border-t border-gray-700">
                    <InputWithEmoji
                        fieldValue={inputMessage}
                        setFieldValue={setInputMessage}
                        enterHandler={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleSendMessage();
                            }
                        }}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                    />
                </div>
            )}
        </div>
    );
})

export default StreamChat;
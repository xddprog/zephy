import { Button, Input } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosClientWithAuth } from "../../api/client/axiosClient";
import { StreamService } from "../../api/services/streamService";

function CreateStream() {
    const service = new StreamService(axiosClientWithAuth)
    const [roomName, setStreamName] = useState<string>("");
    const navigate = useNavigate();

    async function handleCreateStream() {
        try {
            await service.createStream({ name: roomName }).then((res) => {
                navigate(`/stream/${res.data.id}`);
            });
        } catch (error) {
            console.error("Error creating room:", error);
        }
    }
    return (
        <div className="flex justify-center items-center h-screen w-full">
            <div className="flex flex-col w-64 gap-4">
                <Input value={roomName} onChange={(e) => setStreamName(e.target.value)} />
                <Button
                    className="bg-[#006eff]"
                    type="primary"
                    onClick={handleCreateStream}
                    disabled={!roomName.trim()}
                >
                    Create Stream
                </Button>
            </div>
        </div>
    );
}

export default CreateStream;
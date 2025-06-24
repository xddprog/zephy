import { SmileOutlined } from "@ant-design/icons";
import { Input, Popover } from "antd";
import type { TextAreaProps } from "antd/es/input/TextArea";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import React, { type Dispatch, type KeyboardEvent, type SetStateAction } from "react";

interface InputWithEmojiProps {
    fieldValue: string;
    setFieldValue: Dispatch<SetStateAction<string>>;
    minRows?: number;
    enterHandler?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
    maxLength?: number;
    placeholder?: string;
}

const InputWithEmoji: React.FC<InputWithEmojiProps> = ({
    fieldValue,
    setFieldValue,
    minRows = 1,
    enterHandler,
    maxLength = 500,
    placeholder = "Введите...",
}) => {
    const addEmojiToFieldValue = (emoji: EmojiClickData) => {
        setFieldValue(prev => prev + emoji.emoji);
    };

    const handleTextAreaChange: TextAreaProps["onChange"] = (e) => {
        setFieldValue(e.target.value);
    };

    return (
        <div className="flex justify-between">
            <Input.TextArea
                autoSize={{ minRows }}
                value={fieldValue}
                maxLength={maxLength}
                onChange={handleTextAreaChange}
                size="middle"
                placeholder={placeholder}
                onKeyDown={enterHandler}
            />
            <Popover
                content={<EmojiPicker onEmojiClick={addEmojiToFieldValue} />}
                trigger="click"
                placement="topRight"
            >
                <SmileOutlined className="cursor-pointer ml-[10px] text-[20px] hover:text-gray-300 text-gray-500" />
            </Popover>
        </div>
    );
};

export default InputWithEmoji;
import { FontAwesome6 } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Message } from "@/types/ai-agent";

type MessageBubbleProps = {
    message: Message;
};

const MessageBubble = ({ message }: MessageBubbleProps) => {
    const isUser = message.role === "user";

    return (
        <View
            className={`mb-3 flex-row ${isUser ? "justify-end" : "justify-start"}`}
        >
            {!isUser && (
                <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <FontAwesome6 name="wand-magic-sparkles" size={14} color="#ffffff" />
                </View>
            )}

            <View
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isUser
                        ? "bg-primary"
                        : "bg-card border border-border"
                }`}
            >
                <Text
                    className={`text-base leading-5 ${
                        isUser ? "text-primary-foreground" : "text-foreground"
                    }`}
                >
                    {message.content}
                </Text>
                <Text
                    className={`mt-1 text-xs ${
                        isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                >
                    {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            </View>

            {isUser && (
                <View className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    <FontAwesome6 name="user" size={14} color="#486856" />
                </View>
            )}
        </View>
    );
};

export default MessageBubble;

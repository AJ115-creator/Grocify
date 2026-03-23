import 'react-native-get-random-values'; // Must be first import for uuid
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionModule,
} from "@jamsch/expo-speech-recognition";
import { v4 as uuidv4 } from 'uuid';
import { Message, AgentAction } from "@/types/ai-agent";
import MessageBubble from "./MessageBubble";
import { useGroceryStore } from "@/store/grocery-store";
import { sendAgentMessage } from "@/services/ai-agent-api";

type AIAgentModalProps = {
    visible: boolean;
    onClose: () => void;
};

const INITIAL_MESSAGE: Message = {
    id: "initial",
    content: "How can I help you with your groceries?",
    role: "agent",
    timestamp: new Date(),
};

const AIAgentModal = ({ visible, onClose }: AIAgentModalProps) => {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => uuidv4()); // Persistent session ID
    const [isRecording, setIsRecording] = useState(false);
    const [recordingError, setRecordingError] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    // Animation value for pulsing mic button
    const micScale = useSharedValue(1);

    // Get safe area insets to avoid Android navigation bar
    const insets = useSafeAreaInsets();

    const { items, addItem, removeItem } = useGroceryStore();

    // Reset messages when modal closes
    useEffect(() => {
        if (!visible) {
            setMessages([INITIAL_MESSAGE]);
            setInputText("");
            setIsLoading(false);
        }
    }, [visible]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // Pulsing animation when recording
    useEffect(() => {
        if (isRecording) {
            micScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 600 }),
                    withTiming(1.0, { duration: 600 })
                ),
                -1, // Infinite repeat
                false
            );
        } else {
            micScale.value = withTiming(1.0, { duration: 200 });
        }
    }, [isRecording]);

    const micAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: micScale.value }],
    }));

    // Handle speech recognition results
    useSpeechRecognitionEvent("result", (event) => {
        if (event.results && event.results.length > 0) {
            const transcript = event.results[0]?.transcript;
            if (transcript) {
                setInputText(transcript);
                setRecordingError(null);
            }
        }
    });

    // Handle speech recognition end
    useSpeechRecognitionEvent("end", () => {
        setIsRecording(false);
    });

    // Handle speech recognition errors
    useSpeechRecognitionEvent("error", (event) => {
        console.error("Speech recognition error:", event.error);

        // User-friendly error messages
        let errorMessage = "Voice recognition failed";
        if (event.error === "not-allowed" || event.error === "permission-denied") {
            errorMessage = "Microphone permission denied";
        } else if (event.error === "no-speech") {
            errorMessage = "No speech detected. Try again.";
        } else if (event.error === "network") {
            errorMessage = "Network error. Check connection.";
        }

        setRecordingError(errorMessage);
        setIsRecording(false);
    });

    const executeActions = async (actions: AgentAction[]) => {
        for (const action of actions) {
            try {
                if (action.type === "add_item") {
                    const { name, quantity, category, priority } = action.payload;
                    await addItem({ name, quantity, category, priority });
                } else if (action.type === "remove_item") {
                    const { item_id } = action.payload;
                    if (item_id) {
                        await removeItem(item_id);
                    }
                }
            } catch (error) {
                console.error(`Failed to execute action ${action.type}:`, error);
            }
        }
    };

    const handleMicPress = async () => {
        // Toggle: stop if already recording
        if (isRecording) {
            ExpoSpeechRecognitionModule.stop();
            setIsRecording(false);
            return;
        }

        try {
            setRecordingError(null);

            // Request microphone permissions
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

            if (!result.granted) {
                setRecordingError("Microphone permission required");
                return;
            }

            // Start speech recognition
            ExpoSpeechRecognitionModule.start({
                lang: "en-US",              // Language code (can be made configurable)
                interimResults: true,       // Show results while speaking
                maxAlternatives: 1,         // Single best result
                continuous: false,          // Stop after pause
                requiresOnDeviceRecognition: false, // Use cloud for better accuracy
            });

            setIsRecording(true);
        } catch (error: any) {
            console.error("Failed to start speech recognition:", error);
            setRecordingError("Failed to start recording");
            setIsRecording(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputText.trim(),
            role: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            // Call backend API
            const result = await sendAgentMessage(
                userMessage.content,
                sessionId,
                items
            );

            // Execute actions returned by backend
            if (result.actions && result.actions.length > 0) {
                await executeActions(result.actions);
            }

            // Add agent response to chat
            const agentMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: result.response,
                role: "agent",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, agentMessage]);
        } catch (error: any) {
            console.error("AI Agent error:", error);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: error?.message?.includes("Backend")
                    ? "Sorry, I couldn't connect to the AI service. Please check if the backend is running."
                    : "Sorry, I encountered an error. Please try again.",
                role: "agent",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                className="flex-1 bg-background"
            >
                {/* Header */}
                <View className="border-b border-border bg-card px-5 py-4 pt-12">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary">
                                <FontAwesome6 name="wand-magic-sparkles" size={18} color="#ffffff" />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-foreground">
                                    Grocery Assistant
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                    Powered by Llama 3.3 70B
                                </Text>
                            </View>
                        </View>
                        <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center">
                            <FontAwesome6 name="xmark" size={20} color="#5b7567" />
                        </Pressable>
                    </View>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <MessageBubble message={item} />}
                    contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                    ListFooterComponent={
                        isLoading ? (
                            <View className="mb-3 flex-row justify-start">
                                <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-primary">
                                    <FontAwesome6 name="wand-magic-sparkles" size={14} color="#ffffff" />
                                </View>
                                <View className="rounded-2xl border border-border bg-card px-4 py-3">
                                    <ActivityIndicator size="small" color="#00897b" />
                                </View>
                            </View>
                        ) : null
                    }
                />

                {/* Input */}
                <View
                    className="border-t border-border bg-card px-4 py-3"
                    style={{ paddingBottom: Math.max(insets.bottom, 12) }}
                >
                    {/* Error Banner */}
                    {recordingError && (
                        <View className="mb-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                            <Text className="text-xs text-destructive">
                                {recordingError}
                            </Text>
                        </View>
                    )}

                    <View className="flex-row items-center gap-2">
                        {/* Microphone Button */}
                        <Animated.View style={micAnimatedStyle}>
                            <Pressable
                                onPress={handleMicPress}
                                disabled={isLoading}
                                className={`h-12 w-12 items-center justify-center rounded-full ${
                                    isRecording
                                        ? "bg-destructive"
                                        : isLoading
                                        ? "bg-muted"
                                        : "bg-primary/20 border-2 border-primary"
                                }`}
                            >
                                <FontAwesome6
                                    name={isRecording ? "stop" : "microphone"}
                                    size={18}
                                    color={
                                        isRecording
                                            ? "#ffffff"
                                            : isLoading
                                            ? "hsl(170, 10%, 70%)"
                                            : "hsl(171, 90%, 50%)"
                                    }
                                />
                            </Pressable>
                        </Animated.View>

                        {/* Text Input */}
                        <View className="flex-1 flex-row items-center rounded-2xl border border-border bg-muted px-4 py-2">
                            <TextInput
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder={isRecording ? "Listening..." : "Type or speak your message..."}
                                placeholderTextColor="hsl(180, 15%, 45%)"
                                className="flex-1 text-base text-foreground"
                                multiline
                                maxLength={500}
                                editable={!isLoading && !isRecording}
                                onSubmitEditing={handleSend}
                                blurOnSubmit={false}
                            />
                        </View>

                        {/* Send Button */}
                        <Pressable
                            onPress={handleSend}
                            disabled={!inputText.trim() || isLoading || isRecording}
                            className={`h-12 w-12 items-center justify-center rounded-full ${
                                inputText.trim() && !isLoading && !isRecording
                                    ? "bg-primary"
                                    : "bg-muted"
                            }`}
                        >
                            <FontAwesome6
                                name="paper-plane"
                                size={18}
                                color={
                                    inputText.trim() && !isLoading && !isRecording
                                        ? "#ffffff"
                                        : "hsl(180, 15%, 45%)"
                                }
                            />
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default AIAgentModal;

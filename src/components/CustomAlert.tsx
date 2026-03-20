import { Modal, Pressable, Text, View } from "react-native";

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onSecondaryAction?: () => void;
}

const CustomAlert = ({ 
    visible, 
    title, 
    message, 
    onClose,
    primaryButtonText = "Got it",
    secondaryButtonText,
    onSecondaryAction
}: CustomAlertProps) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View className="flex-1 items-center justify-center bg-black/50 px-4">
                <View className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-lg">
                    <Text className="text-xl font-bold text-foreground">{title}</Text>
                    <Text className="mt-2 text-base text-muted-foreground">{message}</Text>
                    
                    <View className="mt-6 flex-row justify-end space-x-3 gap-3">
                        {secondaryButtonText && onSecondaryAction && (
                            <Pressable 
                                onPress={onSecondaryAction}
                                className="rounded-xl px-4 py-3 bg-secondary"
                            >
                                <Text className="font-semibold text-secondary-foreground">{secondaryButtonText}</Text>
                            </Pressable>
                        )}
                        <Pressable 
                            onPress={onClose}
                            className="rounded-xl bg-primary px-5 py-3"
                        >
                            <Text className="font-semibold text-primary-foreground">{primaryButtonText}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlert;

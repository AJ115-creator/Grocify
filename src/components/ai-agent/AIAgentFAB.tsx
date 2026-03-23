import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

type AIAgentFABProps = {
    onPress: () => void;
};

const AIAgentFAB = ({ onPress }: AIAgentFABProps) => {
    return (
        <Pressable
            onPress={onPress}
            style={styles.fab}
            className="items-center justify-center rounded-full bg-primary shadow-lg"
        >
            <FontAwesome6 name="wand-magic-sparkles" size={24} color="#ffffff" />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});

export default AIAgentFAB;

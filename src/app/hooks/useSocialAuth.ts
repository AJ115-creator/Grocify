import { useSSO } from "@clerk/expo";
import { useState } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";

const useSocialAuth = () => {
    const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
    const { startSSOFlow } = useSSO();

    const handleSocialAuth = async (strategy: "oauth_google" | "oauth_github" | "oauth_apple") => {
        if (loadingStrategy) return; // guard against concurrent flows of login
        setLoadingStrategy(strategy)
        try {
            const { createdSessionId, setActive } = await startSSOFlow({ 
                strategy,
                redirectUrl: Linking.createURL('/')
            });
            if (!createdSessionId || !setActive) {
                Alert.alert("Sign-in incomplete", "Sign-in did not complete. Please try again.");
                return
            }
            await setActive({ session: createdSessionId })
        } catch (error) {
            console.log("Error in social auth:", error);
            Alert.alert("Error", "Failed to sign-in. Please Try again.")
        } finally {
            setLoadingStrategy(null)
        }
    }
    return { handleSocialAuth, loadingStrategy };
}
export default useSocialAuth;
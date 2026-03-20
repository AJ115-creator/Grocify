import { useSSO } from "@clerk/expo";
import { useState } from "react";
import * as Linking from "expo-linking";

const useSocialAuth = () => {
    const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "" });
    const { startSSOFlow } = useSSO();

    const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

    const handleSocialAuth = async (strategy: "oauth_google" | "oauth_github" | "oauth_apple") => {
        if (loadingStrategy) return; // guard against concurrent flows of login
        setLoadingStrategy(strategy)
        try {
            const { createdSessionId, setActive } = await startSSOFlow({ 
                strategy,
                redirectUrl: Linking.createURL('/')
            });
            if (!createdSessionId || !setActive) {
                setAlertConfig({ visible: true, title: "Sign-in incomplete", message: "Sign-in did not complete. Please try again." });
                return
            }
            await setActive({ session: createdSessionId })
        } catch (error) {
            console.log("Error in social auth:", error);
            setAlertConfig({ visible: true, title: "Error", message: "Failed to sign-in. Please Try again." });
        } finally {
            setLoadingStrategy(null)
        }
    }
    return { handleSocialAuth, loadingStrategy, alertConfig, closeAlert };
}
export default useSocialAuth;
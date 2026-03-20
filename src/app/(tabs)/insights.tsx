import ClearCompletedButton from "@/components/insights/ClearCompletedButton";
import InsightsCategorySection from "@/components/insights/InsightCategorySection";
import InsightsPrioritySection from "@/components/insights/InsightPrioritySection";
import InsightsStatsSection from "@/components/insights/InsightStatsSection";
import SentryFeebackButton from "@/components/insights/SentryFeebackButton";

import UserProfile from "@/components/insights/UserProfile";
import TabScreenBackground from "@/components/TabScreenBackground";
import { ScrollView } from "react-native";

const InsightsScreen = () => {
    return (
        <>
            <ScrollView
                className="flex-1 bg-background py-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, gap: 14 }}
                contentInsetAdjustmentBehavior="automatic"
            >
                <TabScreenBackground />

                <UserProfile />
                <InsightsStatsSection />
                <InsightsCategorySection />
                <InsightsPrioritySection />
                <ClearCompletedButton />
            </ScrollView>

            <SentryFeebackButton />
        </>
    );
};

export default InsightsScreen;
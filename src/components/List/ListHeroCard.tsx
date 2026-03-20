import { useGroceryStore } from "@/store/grocery-store";
import { Text, View } from "react-native";

const ListHeroCard = () => {
    const { items } = useGroceryStore();

    const completedCount = items.filter((item) => item.purchased).length;
    const pendingCount = items.length - completedCount;
    const completionRate = items.length ? Math.round((completedCount / items.length) * 100) : 0;

    return (
        <View className="rounded-3xl bg-primary/90 p-5">
            <Text className="text-sm font-bold uppercase tracking-[1px] text-primary-foreground/90">
                Today
            </Text>

            <Text className="mt-1 text-3xl font-extrabold text-primary-foreground">
                Your Grocery Board
            </Text>

            <Text className="mt-1 text-sm font-bold text-primary-foreground/80">
                {pendingCount} pending · {completedCount} completed
            </Text>

            <View className="mt-4 overflow-hidden rounded-full bg-white/50">
                <View className="h-2 rounded-full bg-secondary" style={{ width: `${completionRate}%` }} />
            </View>
        </View>
    );
};

export default ListHeroCard;
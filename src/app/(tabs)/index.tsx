
import { useGroceryStore } from "@/store/grocery-store";
import { FlatList, Text, View } from "react-native";

import ListHeroCard from "@/components/List/ListHeroCard";
import TabScreenBackground from "@/components/TabScreenBackground";
import PendingItemCard from "@/components/List/PendingItemCard";
import CompletedItems from "@/components/List/CompletedItems";

export default function ListScreen() {
    const { items } = useGroceryStore();

    const pendingItems = items.filter((item) => !item.purchased);

    return (
        <FlatList
            className="flex-1 bg-secondary py-4 "
            data={pendingItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PendingItemCard item={item} />}
            contentContainerStyle={{ padding: 20, gap: 14 }}
            contentInsetAdjustmentBehavior="automatic"
            ListHeaderComponent={
                <View style={{ gap: 14, paddingTop: 20 }}>
                    <TabScreenBackground />
                    <ListHeroCard />
                    <View className="flex-row items-center justify-between px-1">
                        <Text className="text-sm font-semibold uppercase tracking-[1px] text-muted-foreground">
                            Shopping items
                        </Text>
                        <Text className="text-sm font-semibold text-muted-foreground">{pendingItems.length} active</Text>
                    </View>
                </View>
            }
            ListFooterComponent={<CompletedItems />}
        />
    );
}
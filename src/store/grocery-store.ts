import { create } from "zustand";
import { schedulePendingItemsReminder, cancelPendingItemsReminder } from "@/lib/notifications";
import * as groceryApi from "@/services/grocery-api";

export type GroceryCategory = "Produce" | "Dairy" | "Bakery" | "Pantry" | "Snacks";
export type GroceryPriority = "low" | "medium" | "high";

export type GroceryItem = {
    id: string;
    name: string;
    category: GroceryCategory;
    quantity: number;
    purchased: boolean;
    priority: GroceryPriority;
};

export type CreateItemInput = {
    name: string;
    category: GroceryCategory;
    quantity: number;
    priority: GroceryPriority;
};

type ItemsResponse = { items: GroceryItem[] };
type ItemResponse = { item: GroceryItem };

type GroceryStore = {
    items: GroceryItem[];
    isLoading: boolean;
    error: string | null;
    loadItems: () => Promise<void>;
    addItem: (input: CreateItemInput) => Promise<GroceryItem | void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    togglePurchased: (id: string) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    clearPurchased: () => Promise<void>;
};

export const useGroceryStore = create<GroceryStore>((set, get) => ({
    items: [],
    isLoading: false,
    error: null,

    loadItems: async () => {
        set({ isLoading: true, error: null });
        try {
            const items = await groceryApi.fetchGroceryItems();
            set({ items });
            if (items.some(i => !i.purchased)) {
                schedulePendingItemsReminder();
            } else {
                cancelPendingItemsReminder();
            }
        } catch (error) {
            console.error("Error loading items:", error);
            set({ error: "Something went wrong" });
        } finally {
            set({ isLoading: false });
        }
    },

    addItem: async (input) => {
        set({ error: null });
        try {
            const item = await groceryApi.createGroceryItem(input);
            set((state) => ({ items: [item, ...state.items] }));
            schedulePendingItemsReminder();
            return item;
        } catch (error) {
            console.error("Error adding item:", error);
            set({ error: "Something went wrong" });
        }
    },
    updateQuantity: async (id, quantity) => {
        const nextQuantity = Math.max(1, quantity);
        set({ error: null });

        try {
            const updatedItem = await groceryApi.updateGroceryQuantity(id, nextQuantity);
            set((state) => ({
                items: state.items.map((item) => (item.id === id ? updatedItem : item)),
            }));
        } catch (error) {
            console.error("Error updating quantity:", error);
            set({ error: "Something went wrong" });
        }
    },

    togglePurchased: async (id) => {
        const currentItem = get().items.find((item) => item.id === id);
        if (!currentItem) return;

        const nextPurchased = !currentItem.purchased;
        set({ error: null });
        try {
            const updatedItem = await groceryApi.updateGroceryPurchased(id, nextPurchased);
            set((state) => ({
                items: state.items.map((item) => (item.id === id ? updatedItem : item)),
            }));
            if (get().items.some(i => !i.purchased)) {
                schedulePendingItemsReminder();
            } else {
                cancelPendingItemsReminder();
            }
        } catch (error) {
            console.error("Error toggling purchased:", error);
            set({ error: "Something went wrong" });
        }
    },

    removeItem: async (id) => {
        set({ error: null });
        try {
            await groceryApi.deleteGroceryItem(id);
            set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
            if (get().items.some(i => !i.purchased)) {
                schedulePendingItemsReminder();
            } else {
                cancelPendingItemsReminder();
            }
        } catch (error) {
            console.error("Error removing item:", error);
            set({ error: "Something went wrong" });
        }
    },

    clearPurchased: async () => {
        set({ error: null });
        try {
            await groceryApi.clearPurchasedItems();
            const items = get().items.filter((item) => !item.purchased);
            set({ items });
            if (items.some(i => !i.purchased)) {
                schedulePendingItemsReminder();
            } else {
                cancelPendingItemsReminder();
            }
        } catch (error) {
            console.error("Error clearing purchased:", error);
            set({ error: "Something went wrong" });
        }
    },
}));
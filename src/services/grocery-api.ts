import { GroceryItem, CreateItemInput } from "@/store/grocery-store";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function fetchGroceryItems(): Promise<GroceryItem[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/items`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to fetch items: ${response.status}`);
        }

        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Grocery API fetch error:', error);
        throw error;
    }
}

export async function createGroceryItem(input: CreateItemInput): Promise<GroceryItem> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: input.name,
                category: input.category,
                quantity: Math.max(1, input.quantity),
                priority: input.priority,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to create item: ${response.status}`);
        }

        const data = await response.json();
        return data.item;
    } catch (error) {
        console.error('Grocery API create error:', error);
        throw error;
    }
}

export async function updateGroceryQuantity(id: string, quantity: number): Promise<GroceryItem> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/items/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: Math.max(1, quantity) })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to update quantity: ${response.status}`);
        }

        const data = await response.json();
        return data.item;
    } catch (error) {
        console.error('Grocery API update quantity error:', error);
        throw error;
    }
}

export async function updateGroceryPurchased(id: string, purchased: boolean): Promise<GroceryItem> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/items/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ purchased })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to update purchased status: ${response.status}`);
        }

        const data = await response.json();
        return data.item;
    } catch (error) {
        console.error('Grocery API update purchased error:', error);
        throw error;
    }
}

export async function deleteGroceryItem(id: string): Promise<void> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to delete item: ${response.status}`);
        }
    } catch (error) {
        console.error('Grocery API delete error:', error);
        throw error;
    }
}

export async function clearPurchasedItems(): Promise<void> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/items/clear-purchased`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to clear purchased items: ${response.status}`);
        }
    } catch (error) {
        console.error('Grocery API clear purchased error:', error);
        throw error;
    }
}

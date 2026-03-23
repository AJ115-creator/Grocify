import { GroceryItem } from "@/store/grocery-store";
import { ChatResponse } from "@/types/ai-agent";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function sendAgentMessage(
    message: string,
    sessionId: string,
    groceryItems: GroceryItem[]
): Promise<ChatResponse> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/agent/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                session_id: sessionId,
                grocery_items: groceryItems
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Backend request failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('AI Agent API error:', error);
        throw error;
    }
}

export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        if (!response.ok) return false;

        const data = await response.json();
        return data.status === 'ok';
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
}

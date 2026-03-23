from pydantic import BaseModel
from typing import List, Literal, Optional, Any

# Grocery Item Models
class GroceryItem(BaseModel):
    id: str
    name: str
    category: Literal["Produce", "Dairy", "Bakery", "Pantry", "Snacks"]
    quantity: int
    purchased: bool
    priority: Literal["low", "medium", "high"]


# Agent Chat Models
class ChatRequest(BaseModel):
    message: str
    session_id: str
    grocery_items: List[GroceryItem]


class AgentAction(BaseModel):
    type: Literal["add_item", "remove_item", "none"]
    payload: dict


class ChatResponse(BaseModel):
    response: str
    actions: List[AgentAction]

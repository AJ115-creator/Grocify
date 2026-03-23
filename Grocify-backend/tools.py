from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from typing import Literal, List
from contextvars import ContextVar
from models import GroceryItem, AgentAction


# Request-scoped actions store (thread-safe)
_actions_store: ContextVar[List[AgentAction]] = ContextVar('actions_store', default=[])


# Tool input schemas
class AddItemInput(BaseModel):
    name: str = Field(description="Name of the grocery item")
    quantity: int = Field(description="Quantity of the item (must be positive integer)")
    category: Literal["Produce", "Dairy", "Bakery", "Pantry", "Snacks"] = Field(
        description="Category: Produce (fruits/vegetables), Dairy (milk/cheese/eggs), Bakery (bread/rolls), Pantry (rice/pasta/canned), Snacks (chips/cookies)"
    )
    priority: Literal["low", "medium", "high"] = Field(
        description="Priority: low (can wait), medium (normal), high (urgent/important)"
    )


class RemoveItemInput(BaseModel):
    name: str = Field(description="Name of the item to remove")


class GetStatsInput(BaseModel):
    filter_type: Literal["all", "high", "medium", "low", "pending", "completed", "by_category"] = Field(
        description="Filter type: all (total items), high/medium/low (by priority), pending (not purchased), completed (purchased), by_category (group by category)"
    )


def add_grocery_item_func(name: str, quantity: int, category: str, priority: str) -> str:
    """Add a grocery item to the list."""
    actions = _actions_store.get()
    action = AgentAction(
        type="add_item",
        payload={
            "name": name,
            "quantity": max(1, quantity),
            "category": category,
            "priority": priority
        }
    )
    actions.append(action)
    _actions_store.set(actions)

    return f"Added {quantity} {name} to list under {category} ({priority} priority)"


def remove_grocery_item_func(name: str, grocery_items: List[GroceryItem]) -> str:
    """Remove a grocery item from the list by name (first match)."""
    actions = _actions_store.get()
    normalized_name = name.lower().strip()
    item = next(
        (item for item in grocery_items
         if item.name.lower().strip() == normalized_name and not item.purchased),
        None
    )

    if not item:
        return f'Item "{name}" not found in list'

    action = AgentAction(
        type="remove_item",
        payload={"item_id": item.id, "name": item.name}
    )
    actions.append(action)
    _actions_store.set(actions)

    return f"Removed {item.name} from list"


def get_list_stats_func(filter_type: str, grocery_items: List[GroceryItem]) -> str:
    """Get statistics about the grocery list."""
    pending_items = [item for item in grocery_items if not item.purchased]

    if filter_type == "all":
        total = len(grocery_items)
        pending = len(pending_items)
        completed = total - pending
        return f"Total items: {total} ({pending} pending, {completed} completed)"

    elif filter_type in ["high", "medium", "low"]:
        count = len([item for item in pending_items if item.priority == filter_type])
        return f"{count} {filter_type} priority items"

    elif filter_type == "pending":
        names = [item.name for item in pending_items]
        count = len(pending_items)
        if count > 0:
            return f"{count} pending items: {', '.join(names)}"
        return "0 pending items"

    elif filter_type == "completed":
        completed_items = [item for item in grocery_items if item.purchased]
        names = [item.name for item in completed_items]
        count = len(completed_items)
        if count > 0:
            return f"{count} completed items: {', '.join(names)}"
        return "0 completed items"

    elif filter_type == "by_category":
        by_category = {}
        for item in pending_items:
            by_category[item.category] = by_category.get(item.category, 0) + 1

        if not by_category:
            return "No items by category"

        stats = ", ".join([f"{cat}: {count}" for cat, count in by_category.items()])
        return stats

    return "Unknown filter type"


def create_tools(grocery_items: List[GroceryItem]) -> List[StructuredTool]:
    """Create LangChain tools with grocery context."""

    add_tool = StructuredTool.from_function(
        func=add_grocery_item_func,
        name="add_grocery_item",
        description="Add item to grocery list with name, quantity, category, and priority. Use this when user wants to add items.",
        args_schema=AddItemInput
    )

    # Curry the functions with grocery_items context
    def remove_with_context(name: str) -> str:
        return remove_grocery_item_func(name, grocery_items)

    def stats_with_context(filter_type: str) -> str:
        return get_list_stats_func(filter_type, grocery_items)

    remove_tool = StructuredTool.from_function(
        func=remove_with_context,
        name="remove_grocery_item",
        description="Remove item from grocery list by name (removes first match). Use this when user wants to delete/remove items.",
        args_schema=RemoveItemInput
    )

    stats_tool = StructuredTool.from_function(
        func=stats_with_context,
        name="get_list_stats",
        description="Get statistics about grocery list. Use this when user asks questions about their list (how many items, what items, counts by priority/category).",
        args_schema=GetStatsInput
    )

    return [add_tool, remove_tool, stats_tool]


def get_and_clear_actions() -> List[AgentAction]:
    """Get accumulated actions and clear the store."""
    actions = _actions_store.get().copy()
    _actions_store.set([])
    return actions


def init_actions_store():
    """Initialize actions store for new request."""
    _actions_store.set([])

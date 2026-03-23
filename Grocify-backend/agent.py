import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from typing import List, Dict
from models import GroceryItem, AgentAction
from tools import create_tools, get_and_clear_actions, init_actions_store
from redis_session import get_chat_history, save_chat_history

# Load environment variables
load_dotenv()


SYSTEM_INSTRUCTION = """You are a grocery list assistant. You can ONLY help with:
1. Adding items to the grocery list
2. Removing items from the grocery list
3. Answering questions about the grocery list (counts, items, priorities, categories)

For ANY other request unrelated to grocery list management, respond with: "I cannot help you with that."

When adding items:
- Extract the quantity and item name from the user's message
- Intelligently infer the correct category based on the item:
  * Produce: fruits, vegetables (e.g., apples, bananas, lettuce, tomatoes, carrots)
  * Dairy: milk, cheese, yogurt, butter, cream, eggs
  * Bakery: bread, rolls, bagels, croissants, muffins
  * Pantry: rice, pasta, flour, sugar, oil, spices, canned goods, cereal
  * Snacks: chips, cookies, candy, nuts, crackers, popcorn
- Default to "medium" priority unless user specifies:
  * "urgent", "important", "ASAP", "need now" → high priority
  * "later", "whenever", "not urgent", "can wait" → low priority

Be conversational and helpful. Confirm actions after completing them."""


class GroceryAIAgent:
    def __init__(self):
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",  # Groq's best Llama 3.3 model with tool support
            temperature=0.1,  # Very low for precise tool invocation
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

    def process_message(
        self,
        message: str,
        session_id: str,
        grocery_items: List[GroceryItem]
    ) -> tuple[str, List[AgentAction]]:
        """
        Process a user message and return response + actions.

        Args:
            message: User's message
            session_id: Unique session identifier for chat history
            grocery_items: Current grocery items (for context in tools)

        Returns:
            Tuple of (agent_response, list_of_actions)
        """
        # Initialize request-scoped actions store
        init_actions_store()

        # Create tools with current grocery context
        tools = create_tools(grocery_items)

        # Bind tools to LLM
        llm_with_tools = self.llm.bind_tools(tools)

        # Load chat history from Redis
        history_data = get_chat_history(session_id)
        messages = [SystemMessage(content=SYSTEM_INSTRUCTION)]

        # Add chat history
        for msg in history_data:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "agent":
                messages.append(AIMessage(content=msg["content"]))

        # Add current user message
        messages.append(HumanMessage(content=message))

        try:
            # Helper to extract text from content (handles both string and list format)
            def extract_text(content):
                if isinstance(content, str):
                    return content
                elif isinstance(content, list) and content:
                    # Content is list of blocks [{'type': 'text', 'text': '...'}]
                    text_parts = [block.get('text', '') for block in content if isinstance(block, dict) and block.get('type') == 'text']
                    return ' '.join(text_parts) if text_parts else "Done"
                return "I cannot help you with that."

            # Get response from LLM
            response = llm_with_tools.invoke(messages)

            # Check if there are tool calls
            if hasattr(response, 'tool_calls') and response.tool_calls:
                # Execute tool calls and collect results
                tool_results = []
                for tool_call in response.tool_calls:
                    tool = next((t for t in tools if t.name == tool_call['name']), None)
                    if tool:
                        try:
                            result = tool.invoke(tool_call['args'])
                            tool_results.append(str(result))
                        except Exception as e:
                            print(f"Tool execution error: {e}")
                            tool_results.append(f"Error: {str(e)}")

                # Use tool results directly as response (more reliable than asking LLM)
                response_text = " ".join(tool_results) if tool_results else "Done"
            else:
                response_text = extract_text(response.content)

            # Update chat history in Redis
            history_data.append({"role": "user", "content": message})
            history_data.append({"role": "agent", "content": response_text})
            save_chat_history(session_id, history_data)

            # Get actions accumulated during tool execution
            actions = get_and_clear_actions()

            return response_text, actions

        except Exception as e:
            error_msg = f"Agent error: {type(e).__name__}: {str(e)}"
            print(error_msg, flush=True)
            import traceback
            traceback.print_exc()
            # Return specific error for debugging
            return f"{error_msg[:200]}", []


# Singleton instance
agent_instance = GroceryAIAgent()


def get_agent() -> GroceryAIAgent:
    """Get the singleton agent instance."""
    return agent_instance

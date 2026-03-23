from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from models import ChatRequest, ChatResponse, AgentAction, GroceryItem
from agent import get_agent
from redis_session import health_check as redis_health_check
from database import get_db
import crud
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Grocery AI Agent API",
    description="Backend API for AI-powered grocery list assistant using LangChain + Gemini 3 Flash",
    version="1.0.0"
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Grocery AI Agent API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "chat": "POST /api/agent/chat",
            "items": "GET/POST /api/items",
            "item": "PATCH/DELETE /api/items/{id}",
            "clear": "POST /api/items/clear-purchased",
            "health": "GET /health",
            "docs": "GET /docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    redis_ok = redis_health_check()

    return {
        "status": "ok" if redis_ok else "degraded",
        "redis": "connected" if redis_ok else "disconnected",
        "agent": "ready"
    }


@app.post("/api/agent/chat", response_model=ChatResponse)
async def agent_chat(request: ChatRequest):
    """
    Chat with the AI agent.

    Args:
        request: ChatRequest with message, session_id, and grocery_items

    Returns:
        ChatResponse with agent response and list of actions to execute
    """
    try:
        print(f"[AGENT] Received message: {request.message[:50]}...", flush=True)

        # Validate request
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        if not request.session_id:
            raise HTTPException(status_code=400, detail="Session ID is required")

        # Get agent instance
        agent = get_agent()
        print(f"[AGENT] Processing with Groq...", flush=True)

        # Process message
        response, actions = agent.process_message(
            message=request.message,
            session_id=request.session_id,
            grocery_items=request.grocery_items
        )

        print(f"[AGENT] Response: {response[:100]}...", flush=True)
        return ChatResponse(
            response=response,
            actions=actions
        )

    except HTTPException:
        raise
    except Exception as e:
        error_detail = f"{type(e).__name__}: {str(e)}"
        print(f"[AGENT] Error in agent_chat: {error_detail}", flush=True)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_detail)


# Grocery CRUD Endpoints

@app.get("/api/items")
async def list_items(db: AsyncSession = Depends(get_db)):
    """List all grocery items sorted by updated_at DESC."""
    try:
        items = await crud.list_grocery_items(db)
        return {
            "items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "category": item.category,
                    "quantity": item.quantity,
                    "purchased": item.purchased,
                    "priority": item.priority,
                }
                for item in items
            ]
        }
    except Exception as e:
        print(f"Error listing items: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch items")


@app.post("/api/items", status_code=201)
async def create_item(
    item_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Create a new grocery item."""
    try:
        name = item_data.get("name")
        category = item_data.get("category")
        quantity = item_data.get("quantity", 1)
        priority = item_data.get("priority")

        if not name or not category or not priority:
            raise HTTPException(
                status_code=400,
                detail="Please provide all required fields"
            )

        item = await crud.create_grocery_item(
            db=db,
            name=name,
            category=category,
            quantity=quantity,
            priority=priority
        )

        return {
            "item": {
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "quantity": item.quantity,
                "purchased": item.purchased,
                "priority": item.priority,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating item: {e}")
        raise HTTPException(status_code=500, detail="Failed to create item")


@app.patch("/api/items/{item_id}")
async def update_item(
    item_id: str,
    update_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Update item quantity or purchased status."""
    try:
        if "quantity" in update_data:
            item = await crud.update_item_quantity(
                db=db,
                item_id=item_id,
                quantity=update_data["quantity"]
            )
        elif "purchased" in update_data:
            item = await crud.update_item_purchased(
                db=db,
                item_id=item_id,
                purchased=update_data["purchased"]
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Provide either quantity or purchased field"
            )

        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        return {
            "item": {
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "quantity": item.quantity,
                "purchased": item.purchased,
                "priority": item.priority,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating item: {e}")
        raise HTTPException(status_code=500, detail="Failed to update item")


@app.delete("/api/items/{item_id}")
async def delete_item(
    item_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a grocery item."""
    try:
        await crud.delete_grocery_item(db=db, item_id=item_id)
        return {"ok": True}
    except Exception as e:
        print(f"Error deleting item: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete item")


@app.post("/api/items/clear-purchased")
async def clear_purchased(db: AsyncSession = Depends(get_db)):
    """Clear all purchased items."""
    try:
        await crud.clear_purchased_items(db=db)
        return {"ok": True}
    except Exception as e:
        print(f"Error clearing purchased items: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear purchased items")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )

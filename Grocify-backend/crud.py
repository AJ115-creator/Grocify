from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from db_models import GroceryItemDB
import uuid
import time
import math

async def list_grocery_items(db: AsyncSession) -> list[GroceryItemDB]:
    """List all grocery items sorted by updated_at DESC"""
    result = await db.execute(
        select(GroceryItemDB).order_by(GroceryItemDB.updated_at.desc())
    )
    return list(result.scalars().all())

async def create_grocery_item(
    db: AsyncSession,
    name: str,
    category: str,
    quantity: int,
    priority: str
) -> GroceryItemDB:
    """Create a new grocery item with normalized quantity"""
    item = GroceryItemDB(
        id=str(uuid.uuid4()),
        name=name,
        category=category,
        quantity=max(1, quantity),  # Normalize quantity to minimum 1
        purchased=False,
        priority=priority,
        updated_at=int(time.time() * 1000)  # Milliseconds timestamp
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

async def update_item_quantity(
    db: AsyncSession,
    item_id: str,
    quantity: int
) -> GroceryItemDB | None:
    """Update item quantity with normalization"""
    result = await db.execute(
        select(GroceryItemDB).where(GroceryItemDB.id == item_id)
    )
    item = result.scalar_one_or_none()

    if not item:
        return None

    item.quantity = max(1, math.floor(quantity))  # Normalize and floor
    item.updated_at = int(time.time() * 1000)
    await db.commit()
    await db.refresh(item)
    return item

async def update_item_purchased(
    db: AsyncSession,
    item_id: str,
    purchased: bool
) -> GroceryItemDB | None:
    """Toggle item purchased status"""
    result = await db.execute(
        select(GroceryItemDB).where(GroceryItemDB.id == item_id)
    )
    item = result.scalar_one_or_none()

    if not item:
        return None

    item.purchased = purchased
    item.updated_at = int(time.time() * 1000)
    await db.commit()
    await db.refresh(item)
    return item

async def delete_grocery_item(db: AsyncSession, item_id: str) -> None:
    """Delete a single grocery item"""
    await db.execute(
        delete(GroceryItemDB).where(GroceryItemDB.id == item_id)
    )
    await db.commit()

async def clear_purchased_items(db: AsyncSession) -> None:
    """Bulk delete all purchased items"""
    await db.execute(
        delete(GroceryItemDB).where(GroceryItemDB.purchased == True)
    )
    await db.commit()

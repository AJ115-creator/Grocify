from sqlalchemy import Column, String, Integer, Boolean, BigInteger
from database import Base

class GroceryItemDB(Base):
    __tablename__ = "grocery_items"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    purchased = Column(Boolean, nullable=False, default=False)
    priority = Column(String, nullable=False, default="medium")
    updated_at = Column(BigInteger, nullable=False)  # Milliseconds timestamp

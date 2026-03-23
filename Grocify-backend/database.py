from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Convert postgres:// to postgresql+asyncpg:// for asyncpg driver
DATABASE_URL = os.getenv("DATABASE_URL", "").replace(
    "postgresql://", "postgresql+asyncpg://"
).split("?")[0]  # Remove Neon SSL params (asyncpg handles differently)

# Async engine with connection pooling
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=3,  # Small pool for serverless Neon
    max_overflow=5,
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

# FastAPI dependency injection
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

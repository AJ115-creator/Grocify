import redis
import json
import os
from typing import List, Dict, Optional

# Redis client initialization
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD") or None,
    decode_responses=True,
    socket_connect_timeout=5
)

# Session TTL: 30 minutes
SESSION_TTL = 1800


def get_chat_history(session_id: str) -> List[Dict]:
    """Retrieve chat history for a session from Redis."""
    key = f"session:{session_id}"
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else []
    except redis.RedisError as e:
        print(f"Redis error getting session {session_id}: {e}")
        return []


def save_chat_history(session_id: str, messages: List[Dict]) -> bool:
    """Save chat history for a session to Redis with TTL."""
    key = f"session:{session_id}"
    try:
        redis_client.setex(key, SESSION_TTL, json.dumps(messages))
        return True
    except redis.RedisError as e:
        print(f"Redis error saving session {session_id}: {e}")
        return False


def delete_session(session_id: str) -> bool:
    """Delete a session from Redis."""
    key = f"session:{session_id}"
    try:
        redis_client.delete(key)
        return True
    except redis.RedisError as e:
        print(f"Redis error deleting session {session_id}: {e}")
        return False


def health_check() -> bool:
    """Check if Redis is available."""
    try:
        return redis_client.ping()
    except redis.RedisError:
        return False

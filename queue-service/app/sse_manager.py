from typing import List
from fastapi import Request
import asyncio

class SSEManager:
    def __init__(self):
        self.connections: List = []

    async def push(self, data: str):
        for conn in self.connections:
            await conn.put(data)

    async def listen(self):
        queue = asyncio.Queue()
        self.connections.append(queue)
        return queue

sse_manager = SSEManager()

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class BaseConsumer(AsyncWebsocketConsumer):
    group_name = None

    async def connect(self):
        if not self.group_name:
            raise ValueError("group_name phải được set")
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def broadcast(self, event):
        await self.send(text_data=json.dumps(event["data"]))

    async def send_update(self, data):
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "broadcast",
                "data": data,
            }
        )

class ProductConsumer(BaseConsumer):
    group_name = "products"

class CategoryConsumer(BaseConsumer):
    group_name = "categories"
    
class ImageConsumer(BaseConsumer):
    group_name = "images"
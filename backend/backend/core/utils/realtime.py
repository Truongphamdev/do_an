from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def broadcast_utils(group_name, data):
    layer = get_channel_layer()
    if layer is None:
        raise RuntimeError("Channel layer chưa được cấu hình")

    async_to_sync(layer.group_send)(
        group_name,
        {
            "type": "broadcast",
            "data": data,
        }
    )
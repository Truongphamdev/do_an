import { useEffect, useRef } from "react";

type Listener = (data: any) => void;

const sockets: Record<string, WebSocket> = {};
// Danh sách các function sẽ được gọi khi nhận message
const listenersMap: Record<string, Set<Listener>> = {};

// Hàm kết nối WebSocket
const connect = (url: string) => {
    // Nếu đã kết nối cho Url đó thì không kết nối lại
    if (sockets[url] && sockets[url]?.readyState === WebSocket.OPEN || sockets[url]?.readyState === WebSocket.CONNECTING) return;

    // Tạo socket mới là lưu vào sockets
    const socket = new WebSocket(url);
    sockets[url] = socket;

    // Tạo mới nếu url không có tập listener dành riêng cho url đó
    listenersMap[url] = listenersMap[url] || new Set();

    socket.onopen = () => {
        console.log("✅ WebSocket Connected", url);
    };

    // Nhận message từ server
    socket.onmessage = (event) => {
        try {
            // Chuyển chuỗi JSON -> object
            const data = JSON.parse(event.data);
            // Gọi từng listener
            listenersMap[url].forEach((listener) => listener(data));
        } catch (error) {
            console.log("JSON parse error:", error);
        }
    };

    // Nếu WebSocket bị đóng -> kết nối lại sau 2s
    socket.onclose = () => {
        console.log("❌ WebSocket Closed → reconnecting in 2 seconds...", url);
        
        // Chỉ reconnect nếu còn listener
        if (listenersMap[url] && listenersMap[url].size > 0) {
            setTimeout(() => connect(url), 2000);
        }
    }
}

// Hook sử dụng trong các screen React Native
export const useWebSocket = (callback: Listener, url: string) => {
    
    // Dùng Ref để luôn gọi phiên bản mới nhất của callback
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {

        const wrapper = (data: any) => {
            callbackRef.current(data);
        };

        if (!listenersMap[url]) {
            listenersMap[url] = new Set();
        }

        listenersMap[url].add(wrapper);

        connect(url);

        // Cleanup khi component unmount
        return () => {
            listenersMap[url].delete(wrapper);

            // Nếu không còn listener -> tự đóng socket
            if (listenersMap[url].size === 0) {
                console.log("🛑 Closing socket because no listeners:", url);
                sockets[url]?.close();
                delete sockets[url];
            }
        };
    }, []);
}
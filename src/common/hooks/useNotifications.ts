import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { notification as antdNotification } from "antd";
import { getReaderId, isReaderLoggedIn } from "@/apis/readers.api";
import { getReaderNotifications, markNotificationAsRead } from "@/apis/notifications.api";
import type { Notification } from "@/apis/notifications.api";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const readerId = getReaderId();

  // Load notifications from API
  const fetchNotifications = async () => {
    if (!readerId || !isReaderLoggedIn()) return;
    setLoading(true);
    try {
      const data = await getReaderNotifications(Number(readerId));
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Yêu cầu quyền thông báo của trình duyệt
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (window.Notification.permission === "default") {
        window.Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [readerId]);

  // Connect WebSocket
  useEffect(() => {
    if (!readerId || !isReaderLoggedIn()) return;

    const socket: Socket = io("/notifications", {
      query: { readerId },
      transports: ["polling", "websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 30000,
    });

    socket.on("connect", () => {
      console.log("WebSocket connected to notifications namespace");
    });

    socket.on("notification", (newNotif: Notification) => {
      console.log("Nhận thông báo mới:", newNotif);
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Hiển thị Browser Push Notification
      if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted") {
        try {
          new window.Notification(newNotif.title, {
            body: newNotif.content,
            icon: "/image-logo.png",
          });
        } catch (err) {
          console.error("Lỗi bắn Browser Notification:", err);
        }
      }

      // Hiển thị Antd Notification (Toast) sinh động
      antdNotification.info({
        message: newNotif.title,
        description: newNotif.content,
        placement: "topRight",
        duration: 5,
        style: {
          backgroundColor: "#F7EAD3",
          border: "1px solid rgba(45,37,30,0.2)",
          borderRadius: "12px",
          color: "#2D251E",
        },
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [readerId]);

  const handleRead = async (id: number) => {
    if (!readerId) return;
    try {
      await markNotificationAsRead(Number(readerId), id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Lỗi khi đánh dấu đã đọc:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    handleRead,
    refresh: fetchNotifications,
  };
}

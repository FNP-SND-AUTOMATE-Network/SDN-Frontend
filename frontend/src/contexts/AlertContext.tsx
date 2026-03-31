"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { AlertColor } from "@/hooks/useSnackbar";

export interface ZabbixAlert {
  event_id: string;
  status: string;
  severity: string;
  severity_label: string;
  host_name: string;
  host_ip: string;
  trigger_name: string;
  item_name: string;
  item_value: string;
  frontend_message?: string;
  event_time: string;
  tags: Record<string, string>;
  description: string;
  received_at: string;
  isRead?: boolean;
}

interface AlertContextType {
  alerts: ZabbixAlert[];
  unreadCount: number;
  isConnected: boolean;
  markAllAsRead: () => void;
  markAsRead: (eventId: string) => void;
  clearAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<ZabbixAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Snackbar popup state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
    title?: string;
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const hideSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const popAlert = useCallback((alert: ZabbixAlert) => {
    // Map Zabbix severity to MUI severity
    // 0: Normal/Not classified, 1: Info, 2: Warning, 3: Average, 4: High, 5: Disaster
    let severity: AlertColor = "info";
    if (["2", "3"].includes(alert.severity)) severity = "warning";
    if (["4", "5"].includes(alert.severity)) severity = "error";

    // If it's OK/RESOLVED status, we might show a success
    if (alert.status === "OK") severity = "success";

    setSnackbar({
      open: true,
      title: `${alert.severity_label} - ${alert.host_name}`,
      message: alert.frontend_message || alert.trigger_name,
      severity,
    });
  }, []);

  const connectWebSocket = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";
    
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("[AlertContext] WebSocket Connected");
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const newAlert: ZabbixAlert = JSON.parse(event.data);
        newAlert.isRead = false;
        
        // Append alert to array
        setAlerts((prev) => [newAlert, ...prev].slice(0, 100)); // Keep last 100 alerts
        
        // Trigger Popup
        popAlert(newAlert);
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    wsRef.current.onclose = () => {
      console.log("[AlertContext] WebSocket Disconnected. Reconnecting in 5s...");
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    };

    wsRef.current.onerror = () => {
      console.warn("[AlertContext] WebSocket connection issue. Retrying...");
      // Let onClose handle reconnects
    };
  }, [popAlert]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const markAsRead = (eventId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.event_id === eventId ? { ...a, isRead: true } : a))
    );
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <AlertContext.Provider
      value={{ alerts, unreadCount, isConnected, markAllAsRead, markAsRead, clearAlerts }}
    >
      {children}
      <MuiSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        title={snackbar.title}
        onClose={hideSnackbar}
      />
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};

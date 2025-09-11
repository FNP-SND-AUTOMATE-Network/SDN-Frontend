"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertItem {
  id: number;
  type: AlertType;
  message: string;
  title?: string;
  isRemoving?: boolean;
  animationType?: 'slide' | 'bounce';
}

export default function AlertsDemoPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = (type: AlertType, message: string, title?: string, animationType: 'slide' | 'bounce' = 'slide') => {
    const id = Date.now();
    const newAlert: AlertItem = { id, type, message, title, isRemoving: false, animationType };
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 5000);
  };

  const removeAlert = (id: number) => {
    // First set isRemoving to true for animation
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isRemoving: true } : alert
      )
    );
    
    // Then actually remove after animation completes
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 300); // Match animation duration
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-primary-50 to-secondary-100 font-sf-pro">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-primary-600 mb-8 font-sf-pro-display">
          🎉 Alert System Demo
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 font-sf-pro-display">
              ทดสอบ Alert Notifications 
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="success"
                  onClick={() => showAlert('success', 'บันทึกข้อมูลสำเร็จ!', 'สำเร็จ', 'slide')}
                  className="w-full"
                >
                  ✅ Success
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => showAlert('info', 'ข้อมูลถูกอัปเดตแล้ว', 'ข้อมูล', 'slide')}
                  className="w-full"
                >
                  ℹ️ Info
                </Button>
                
                <Button
                  variant="warning"
                  onClick={() => showAlert('warning', 'กรุณาตรวจสอบข้อมูลอีกครั้ง', 'คำเตือน', 'slide')}
                  className="w-full"
                >
                  ⚠️ Warning
                </Button>
                
                <Button
                  variant="danger"
                  onClick={() => showAlert('error', 'เกิดข้อผิดพลาดในการบันทึก', 'ข้อผิดพลาด', 'slide')}
                  className="w-full"
                >
                  ❌ Error
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2 font-sf-pro-text">🎪 Animation Styles:</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="success"
                    onClick={() => showAlert('success', 'แบบ Bounce สนุกสนาน!', '🎪 Bounce Animation', 'bounce')}
                    className="w-full"
                  >
                    🎪 Bounce Style
                  </Button>
                  
                  <Button
                    variant="primary"
                    onClick={() => showAlert('info', 'แบบ Slide เรียบง่าย', '✨ Slide Animation', 'slide')}
                    className="w-full"
                  >
                    ✨ Slide Style
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 font-sf-pro-display">
              สถานะการติดตั้ง
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-success-800 font-sf-pro-text">✅ Material-UI (@mui/material + @emotion/react + @emotion/styled)</p>
              </div>
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-success-800 font-sf-pro-text">✅ Font Awesome (@fortawesome/fontawesome-svg-core + react-fontawesome)</p>
              </div>
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-success-800 font-sf-pro-text">✅ SF Pro Font (Apple System Fonts)</p>
              </div>
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-primary-800 font-sf-pro-text">ℹ️ Alert System พร้อมใช้งาน (แบบ Snackbar style + Animations)</p>
              </div>
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <p className="text-warning-800 font-sf-pro-text">🎪 ✨ Smooth Animations: Slide-in และ Bounce-in + Slide-out</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 font-sf-pro-display">
              SF Pro Font Showcase
            </h2>
            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h1 className="text-3xl font-bold font-sf-pro-display">
                SF Pro Display - สำหรับหัวข้อใหญ่
              </h1>
              <p className="text-lg font-sf-pro-text">
                SF Pro Text - สำหรับเนื้อหาทั่วไป ทั้งภาษาไทยและภาษาอังกฤษ
              </p>
              <p className="text-sm text-gray-600 font-sf-pro-text">
                Secondary text - ข้อความรอง Beautiful rendering for both Thai and English
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Alert Container */}
      <div className="fixed bottom-4 right-4 space-y-2 max-w-sm z-50">
        {alerts.map((alert) => {
          const styles = {
            success: 'bg-success-50 border-success-200 text-success-800',
            error: 'bg-danger-50 border-danger-200 text-danger-800',
            warning: 'bg-warning-50 border-warning-200 text-warning-800',
            info: 'bg-primary-50 border-primary-200 text-primary-800'
          };

          const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
          };

          return (
            <div
              key={alert.id}
              className={`
                p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out transform
                ${styles[alert.type]}
                ${alert.isRemoving 
                  ? 'translate-x-full opacity-0 scale-95' 
                  : `translate-x-0 opacity-100 scale-100 ${
                      alert.animationType === 'bounce' ? 'animate-bounce-in' : 'animate-slide-in'
                    }`
                }
              `}
            >
              <div className="flex items-start">
                <span className="text-lg mr-2">{icons[alert.type]}</span>
                <div className="flex-1">
                  {alert.title && (
                    <h4 className="font-semibold font-sf-pro-display mb-1">
                      {alert.title}
                    </h4>
                  )}
                  <p className="text-sm font-sf-pro-text">{alert.message}</p>
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="ml-2 text-gray-500 hover:text-gray-700 font-bold text-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

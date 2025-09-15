"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { useState } from "react";
import ProfilePage from "./profile/page";
import { AccountContent } from "./account/page";
import { MFAContent as MFAContentComponent } from "./mfa/page";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";

// Components สำหรับแต่ละหน้า
const ProfileContent = () => (
    <ProfilePage />
);

const AccountContentWrapper = () => (
    <AccountContent />
);


const MFAContentWrapper = () => (
    <MFAContentComponent />
);

export default function SettingPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const { user } = useAuth();

    // Filter tabs based on user role
    const allTabs = [
        { id: "profile", label: "Profile" },
        { id: "account", label: "Account" },
        { id: "mfa", label: "MFA" }
    ];

    // Only show Account tab for ADMIN and OWNER
    const tabs = allTabs.filter(tab => {
        if (tab.id === "account") {
            return user && (user.role === "ADMIN" || user.role === "OWNER");
        }
        return true;
    });

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return <ProfileContent />;
            case "account":
                // Check if user has permission to access Account
                if (user && (user.role === "ADMIN" || user.role === "OWNER")) {
                    return <AccountContentWrapper />;
                } else {
                    return (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                            <div className="text-red-600 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2 font-sf-pro-display">
                                ไม่มีสิทธิ์เข้าถึง
                            </h3>
                            <p className="text-gray-600 font-sf-pro-text">
                                คุณไม่มีสิทธิ์เข้าถึงหน้านี้ ต้องมีบทบาท ADMIN หรือ OWNER เท่านั้น
                            </p>
                        </div>
                    );
                }
            case "mfa":
                return <MFAContentWrapper />;
            default:
                return <ProfileContent />;
        }
    };

    return (
        <ProtectedRoute>
            <PageLayout>
                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl font-bold text-gray-900 font-sf-pro-display">
                        Settings
                    </h1>
                
                {/* Sub Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? "border-primary-500 text-primary-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                    </div>

                {/* Content Area */}
                <div className="flex-1">
                    {renderContent()}
                </div>
                </div>
            </PageLayout>
        </ProtectedRoute>
    );
}

"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { useState } from "react";
import ProfilePage from "./profile/page";
import { AccountContent } from "./account/page";
import { MFAContent as MFAContentComponent } from "./mfa/page";
import { ProtectedRoute } from "@/components/auth/AuthGuard";

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

    const tabs = [
        { id: "profile", label: "Profile" },
        { id: "account", label: "Account" },
        { id: "mfa", label: "MFA" }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return <ProfileContent />;
            case "account":
                return <AccountContentWrapper />;
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

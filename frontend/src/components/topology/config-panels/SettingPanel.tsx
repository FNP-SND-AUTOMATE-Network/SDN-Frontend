"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faSpinner, faSave } from "@fortawesome/free-solid-svg-icons";
import { ConfigPanelProps } from "./types";

export function SettingPanel({ device, isPushing, handlePush }: ConfigPanelProps) {
    const [hostname, setHostname] = useState("");
    const [dnsServer, setDnsServer] = useState("");
    const [dnsDomain, setDnsDomain] = useState("");
    const [ntpServer, setNtpServer] = useState("");

    useEffect(() => {
        if (device) {
            setHostname(device.device_name || "");
        }
    }, [device]);

    return (
        <div className="space-y-5">
            {/* Hostname */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Hostname</h4>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={hostname}
                        onChange={(e) => setHostname(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Enter hostname"
                    />
                    <button
                        onClick={() => handlePush("system.set_hostname", { hostname })}
                        disabled={isPushing || !hostname}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                        Push
                    </button>
                </div>
            </div>

            {/* DNS */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">DNS Server</h4>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={dnsServer}
                        onChange={(e) => setDnsServer(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="DNS Server (e.g. 8.8.8.8)"
                    />
                    <input
                        type="text"
                        value={dnsDomain}
                        onChange={(e) => setDnsDomain(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Domain (optional)"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => handlePush("system.set_dns", { server: dnsServer, ...(dnsDomain && { domain: dnsDomain }) })}
                        disabled={isPushing || !dnsServer}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                        Push
                    </button>
                </div>
            </div>

            {/* NTP */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">NTP Server</h4>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={ntpServer}
                        onChange={(e) => setNtpServer(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="NTP Server (e.g. pool.ntp.org)"
                    />
                    <button
                        onClick={() => handlePush("system.set_ntp", { server: ntpServer })}
                        disabled={isPushing || !ntpServer}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                        Push
                    </button>
                </div>
            </div>

            {/* Save Config */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={() => handlePush("system.save_config", {})}
                    disabled={isPushing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    <FontAwesomeIcon icon={isPushing ? faSpinner : faSave} className={`w-4 h-4 ${isPushing ? "animate-spin" : ""}`} />
                    Save Configuration
                </button>
            </div>
        </div>
    );
}

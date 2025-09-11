"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function TestAPIPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult("");

    try {
      console.log("Testing login...");
      const response = await authApi.login({
        email: "purmme8@gmail.com",
        password: "Noppadol2546!"
      });
      
      setResult(`Login Success: ${JSON.stringify(response, null, 2)}`);
      console.log("Login response:", response);
    } catch (error) {
      setResult(`Login Error: ${JSON.stringify(error, null, 2)}`);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setLoading(true);
    setResult("");

    try {
      console.log("Testing health check...");
      const response = await authApi.healthCheck();
      setResult(`Health Check Success: ${JSON.stringify(response, null, 2)}`);
      console.log("Health check response:", response);
    } catch (error) {
      setResult(`Health Check Error: ${JSON.stringify(error, null, 2)}`);
      console.error("Health check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testFetch = async () => {
    setLoading(true);
    setResult("");

    try {
      console.log("Testing direct fetch...");
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: "purmme8@gmail.com",
          password: "Noppadol2546!"
        })
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);
      
      const data = await response.json();
      console.log("Response data:", data);
      
      setResult(`Direct Fetch: Status ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Direct Fetch Error: ${JSON.stringify(error, null, 2)}`);
      console.error("Direct fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-primary-600 mb-8">
          API Test Page
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={testHealthCheck}
              disabled={loading}
              variant="primary"
            >
              Test Health Check
            </Button>
            
            <Button 
              onClick={testLogin}
              disabled={loading}
              variant="success"
            >
              Test Login API
            </Button>
            
            <Button 
              onClick={testFetch}
              disabled={loading}
              variant="warning"
            >
              Test Direct Fetch
            </Button>
          </div>

          {loading && (
            <div className="text-center">
              <p>กำลังทดสอบ...</p>
            </div>
          )}

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">ผลลัพธ์:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                {result}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">วิธีดู Console:</h3>
            <p className="text-sm">
              1. เปิด Developer Tools (F12)<br/>
              2. ไปที่ Console tab<br/>
              3. กดปุ่มทดสอบแล้วดู logs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, memo, useRef } from "react";
import { UserProfile } from "@/services/userService";

interface UserDisplayProps {
  userId?: string;
  userCache: Record<string, UserProfile>;
  getCachedUserName: (userId: string) => string;
  getUserName: (userId: string) => Promise<string>;
}

const UserDisplay: React.FC<UserDisplayProps> = memo(
  ({ userId, userCache, getCachedUserName, getUserName }) => {
    const [displayName, setDisplayName] = useState<string>(userId || "System");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const fetchAttempted = useRef<boolean>(false);

    useEffect(() => {
      let isMounted = true;

      if (!userId) {
        setDisplayName("System");
        setIsLoading(false);
        setHasError(false);
        fetchAttempted.current = false;
        return;
      }

      // Check cache first
      if (userCache[userId]) {
        const user = userCache[userId];
        const cachedName =
          `${user.name || ""} ${user.surname || ""}`.trim() ||
          user.email ||
          userId;
        if (isMounted) {
          setDisplayName(cachedName);
          setIsLoading(false);
          setHasError(false);
          fetchAttempted.current = true;
        }
        return;
      }

      // If not in cache and haven't attempted to fetch yet
      if (!fetchAttempted.current) {
        const fetchUserName = async () => {
          if (!isMounted) return;

          setIsLoading(true);
          setHasError(false);
          fetchAttempted.current = true;

          try {
            const name = await getUserName(userId);
            if (isMounted) {
              setDisplayName(name);
              setIsLoading(false);
              setHasError(false);
            }
          } catch (error) {
            console.error("UserDisplay: Error fetching user name:", error);
            if (isMounted) {
              setDisplayName(userId); // Fallback to userId
              setIsLoading(false);
              setHasError(true);
            }
          }
        };

        fetchUserName();
      }

      // Cleanup function
      return () => {
        isMounted = false;
      };
    }, [userId, userCache, getUserName]);

    // Reset state when userId changes
    useEffect(() => {
      fetchAttempted.current = false;
      setHasError(false);
      setIsLoading(false);
    }, [userId]);

    if (isLoading) {
      return <span className="text-gray-400 animate-pulse">Loading...</span>;
    }

    if (hasError) {
      return <span className="text-gray-500 italic">{userId}</span>;
    }

    return <span>{displayName}</span>;
  }
);

UserDisplay.displayName = "UserDisplay";

export default UserDisplay;

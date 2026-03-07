import React from "react";
import { Typography, Skeleton } from "@mui/material";
import { $api } from "@/lib/apiv2/fetch";

export function UserNameResolver({ userId, fallback = "-" }: { userId: string | null | undefined; fallback?: string }) {
    // Basic UUID format check to prevent unnecessary requests or invalid UUID errors
    const isUUID = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    const { data: user, isLoading } = $api.useQuery(
        "get",
        "/users/{user_id}",
        { params: { path: { user_id: userId as string } } },
        { enabled: !!isUUID, staleTime: 5 * 60 * 1000 } // Cache for 5 mins
    );

    if (!userId) {
        return <Typography variant="body2" color="text.secondary">{fallback}</Typography>;
    }

    if (isLoading) {
        return <Skeleton width={80} height={20} />;
    }

    // If we successfully fetched the user, display their name. Otherwise, just show the fallback or the original ID.
    const displayName = user ? `${user.name || ""} ${user.surname || ""}`.trim() : (isUUID ? "Unknown User" : userId);

    return (
        <Typography variant="body2" color="text.secondary" noWrap title={isUUID && !user ? userId : displayName}>
            {displayName || fallback}
        </Typography>
    );
}

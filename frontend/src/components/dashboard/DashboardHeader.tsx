"use client";

import { Box, Typography, Chip, Stack } from "@mui/material";
import { AccessTime, FiberManualRecord } from "@mui/icons-material";
import { useEffect, useState } from "react";

export const DashboardHeader = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const greeting = (() => {
        const h = now.getHours();
        if (h < 12) return "Good Morning";
        if (h < 17) return "Good Afternoon";
        return "Good Evening";
    })();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
                pb: 2.5,
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            <Box>
                <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                        background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-0.02em",
                    }}
                >
                    {greeting}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Network Observability Dashboard — Real-time monitoring
                </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip
                    icon={<FiberManualRecord sx={{ fontSize: 10, color: "#4caf50 !important" }} />}
                    label="Live"
                    size="small"
                    sx={{
                        bgcolor: "rgba(76,175,80,0.08)",
                        color: "#2e7d32",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        "& .MuiChip-icon": { ml: 0.5 },
                    }}
                />
                <Chip
                    icon={<AccessTime sx={{ fontSize: 14 }} />}
                    label={now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.75rem", color: "text.secondary", borderColor: "divider" }}
                />
            </Stack>
        </Box>
    );
};

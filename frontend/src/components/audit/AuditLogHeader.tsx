"use client";

import { Box, Typography, Button } from "@mui/material";
import { Refresh } from "@mui/icons-material";

interface AuditLogHeaderProps {
  userRole?: string;
  onRefresh: () => void;
  totalLogs?: number;
  children?: React.ReactNode;
}

export default function AuditLogHeader({
  userRole,
  onRefresh,
  totalLogs,
  children,
}: AuditLogHeaderProps) {
  const description =
    userRole === "ADMIN" || userRole === "OWNER"
      ? "All activity logs in the system"
      : "Your activity logs";

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Audit Log
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description} {totalLogs !== undefined ? `(${totalLogs} records)` : ""}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={onRefresh}
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>{children}</Box>
    </Box>
  );
}

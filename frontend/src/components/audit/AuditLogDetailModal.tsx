"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { paths } from "@/lib/apiv2/schema";
import { UserProfile } from "@/services/userService";
import UserDisplay from "./UserDisplay";

type AuditLogResponse =
  paths["/audit/logs"]["get"]["responses"]["200"]["content"]["application/json"]["items"][number];

interface AuditLogDetailModalProps {
  selectedLog: AuditLogResponse | null;
  showDetailModal: boolean;
  userRole?: string;
  userCache: Record<string, UserProfile>;
  getCachedUserName: (userId: string) => string;
  getUserName: (userId: string) => Promise<string>;
  onClose: () => void;
}

const getActionBadge = (action: string) => {
  switch (action) {
    case "USER_LOGIN":
    case "USER_REGISTER":
      return { color: "success" as const };
    case "USER_DELETE":
      return { color: "error" as const };
    case "PASSWORD_CHANGE":
    case "PASSWORD_RESET":
      return { color: "warning" as const };
    case "USER_CREATE":
    case "USER_UPDATE":
      return { color: "info" as const };
    case "PROMOTE_ROLE":
    case "DEMOTE_ROLE":
      return { color: "secondary" as const };
    case "ENABLE_TOTP":
    case "DISABLE_TOTP":
    case "REGISTER_PASSKEY":
    case "REMOVE_PASSKEY":
      return { color: "primary" as const };
    default:
      return { color: "default" as const };
  }
};

const formatActionText = (action: string) => {
  const actionMap: Record<string, string> = {
    USER_REGISTER: "Register",
    USER_LOGIN: "Login",
    USER_LOGOUT: "Logout",
    USER_CREATE: "Create User",
    USER_UPDATE: "Update User",
    USER_DELETE: "Delete User",
    ENABLE_TOTP: "Enable TOTP",
    DISABLE_TOTP: "Disable TOTP",
    REGISTER_PASSKEY: "Register Passkey",
    REMOVE_PASSKEY: "Remove Passkey",
    PROMOTE_ROLE: "Promote Role",
    DEMOTE_ROLE: "Demote Role",
    PASSWORD_CHANGE: "Password Change",
    PASSWORD_RESET: "Password Reset",
  };
  return actionMap[action] || action;
};

const formatDetails = (details: Record<string, any> | null): string => {
  if (!details || Object.keys(details).length === 0) return "No additional details";

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Success" : "Failed";
    if (Array.isArray(value)) return value.map(formatValue).join(", ");
    if (typeof value === "object") {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${formatValue(v)}`)
        .join(", ");
    }
    return String(value);
  };

  const formattedDetails: string[] = [];
  Object.entries(details).forEach(([key, value]) => {
    formattedDetails.push(`${key}: ${formatValue(value)}`);
  });

  return formattedDetails.join("\n");
};

export default function AuditLogDetailModal({
  selectedLog,
  showDetailModal,
  userRole,
  userCache,
  getCachedUserName,
  getUserName,
  onClose,
}: AuditLogDetailModalProps) {
  if (!selectedLog) return null;

  const isAdminOrOwner = userRole === "ADMIN" || userRole === "OWNER";
  const badge = getActionBadge(selectedLog.action);

  return (
    <Dialog open={showDetailModal} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography component="div" variant="h6" fontWeight="bold">
          Audit Log Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={0.5}
              >
                Time
              </Typography>
              <Typography variant="body2">
                {new Date(selectedLog.created_at).toLocaleString("th-TH")}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={0.5}
              >
                Action
              </Typography>
              <Chip
                label={formatActionText(selectedLog.action)}
                color={badge.color}
                size="small"
                variant="filled"
              />
            </Grid>
          </Grid>
        </Box>

        {isAdminOrOwner && (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={0.5}
                >
                  Actor
                </Typography>
                <Typography variant="body2" component="div">
                  {selectedLog.actor_user_id ? (
                    <UserDisplay
                      userId={selectedLog.actor_user_id}
                      userCache={userCache}
                      getCachedUserName={getCachedUserName}
                      getUserName={getUserName}
                    />
                  ) : (
                    "-"
                  )}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={0.5}
                >
                  Target
                </Typography>
                <Typography variant="body2" component="div">
                  {(() => {
                    const tgt = selectedLog as any;
                    if (tgt.target_user_id) {
                      return <UserDisplay
                               userId={tgt.target_user_id}
                               userCache={userCache}
                               getCachedUserName={getCachedUserName}
                               getUserName={getUserName}
                             />;
                    }

                    const getField = (field: string) => tgt[field] || tgt.details?.[field];

                    const deviceName = getField('target_device_name') || getField('device_name');
                    if (deviceName) return `Device: ${deviceName}`;

                    const osName = getField('target_os_name') || getField('os_name');
                    if (osName) return `OS: ${osName}`;

                    const backupName = getField('target_backup_name') || getField('backup_name');
                    if (backupName) return `Backup: ${backupName}`;

                    const templateName = getField('target_template_name') || getField('template_name');
                    if (templateName) return `Template: ${templateName}`;

                    const siteName = getField('target_site_name') || getField('site_name');
                    if (siteName) return `Site: ${siteName}`;

                    const interfaceName = getField('target_interface_name') || getField('interface_name');
                    if (interfaceName) return `Interface: ${interfaceName}`;

                    const tagName = getField('target_tag_name') || getField('tag_name');
                    if (tagName) return `Tag: ${tagName}`;

                    return "-";
                  })()}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mb={1}
          >
            Additional Details
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.875rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {formatDetails(selectedLog.details || null)}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

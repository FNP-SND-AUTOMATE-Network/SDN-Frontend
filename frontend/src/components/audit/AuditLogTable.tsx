"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { UserProfile } from "@/services/userService";
import UserDisplay from "./UserDisplay";
import { paths } from "@/lib/apiv2/schema";

type AuditLogResponse =
  paths["/audit/logs"]["get"]["responses"]["200"]["content"]["application/json"]["items"][number];

interface AuditLogTableProps {
  auditLogs: AuditLogResponse[];
  userRole?: string;
  userCache: Record<string, UserProfile>;
  getCachedUserName: (userId: string) => string;
  getUserName: (userId: string) => Promise<string>;
  onShowDetail: (log: AuditLogResponse) => void;
}

const getActionBadge = (action: string) => {
  switch (action) {
    case "USER_LOGIN":
    case "USER_REGISTER":
      return { color: "success" as const, label: action };
    case "USER_LOGOUT":
      return { color: "default" as const, label: action };
    case "USER_CREATE":
    case "USER_UPDATE":
      return { color: "info" as const, label: action };
    case "USER_DELETE":
      return { color: "error" as const, label: action };
    case "PASSWORD_CHANGE":
    case "PASSWORD_RESET":
      return { color: "warning" as const, label: action };
    case "PROMOTE_ROLE":
    case "DEMOTE_ROLE":
      return { color: "secondary" as const, label: action };
    case "ENABLE_TOTP":
    case "DISABLE_TOTP":
    case "REGISTER_PASSKEY":
    case "REMOVE_PASSKEY":
      return { color: "primary" as const, label: action };
    
    // Device Management
    case "DEVICE_CREATE":
    case "DEVICE_UPDATE":
    case "DEVICE_MOUNT":
      return { color: "success" as const, label: action };
    case "DEVICE_UNMOUNT":
      return { color: "warning" as const, label: action };
    case "DEVICE_DELETE":
      return { color: "error" as const, label: action };

    // Backup Management
    case "BACKUP_PROFILE_CREATE":
    case "BACKUP_PROFILE_UPDATE":
    case "BACKUP_PROFILE_RESUME":
      return { color: "info" as const, label: action };
    case "BACKUP_PROFILE_PAUSE":
      return { color: "warning" as const, label: action };
    case "BACKUP_PROFILE_DELETE":
      return { color: "error" as const, label: action };
    case "BACKUP_TRIGGER_MANUAL":
      return { color: "secondary" as const, label: action };

    // Configuration & Deployment
    case "TEMPLATE_CREATE":
    case "TEMPLATE_UPDATE":
      return { color: "info" as const, label: action };
    case "TEMPLATE_DELETE":
      return { color: "error" as const, label: action };
    case "DEPLOYMENT_START":
      return { color: "primary" as const, label: action };

    // OS Management
    case "OS_FILE_UPLOAD":
      return { color: "success" as const, label: action };
    case "OS_FILE_DELETE":
      return { color: "error" as const, label: action };

    // Master Data & Interfaces
    case "INTERFACE_UPDATE":
    case "SITE_CREATE":
    case "SITE_UPDATE":
    case "TAG_CREATE":
    case "TAG_UPDATE":
      return { color: "info" as const, label: action };
    case "SITE_DELETE":
    case "TAG_DELETE":
      return { color: "error" as const, label: action };

    default:
      return { color: "default" as const, label: action };
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

    DEVICE_CREATE: "Create Device",
    DEVICE_UPDATE: "Update Device",
    DEVICE_DELETE: "Delete Device",
    DEVICE_MOUNT: "Mount Device",
    DEVICE_UNMOUNT: "Unmount Device",

    BACKUP_PROFILE_CREATE: "Create Backup Profile",
    BACKUP_PROFILE_UPDATE: "Update Backup Profile",
    BACKUP_PROFILE_DELETE: "Delete Backup Profile",
    BACKUP_PROFILE_PAUSE: "Pause Backup Profile",
    BACKUP_PROFILE_RESUME: "Resume Backup Profile",
    BACKUP_TRIGGER_MANUAL: "Trigger Manual Backup",

    TEMPLATE_CREATE: "Create Template",
    TEMPLATE_UPDATE: "Update Template",
    TEMPLATE_DELETE: "Delete Template",
    DEPLOYMENT_START: "Start Deployment",

    OS_FILE_UPLOAD: "Upload OS File",
    OS_FILE_DELETE: "Delete OS File",

    INTERFACE_UPDATE: "Update Interface",
    SITE_CREATE: "Create Site",
    SITE_UPDATE: "Update Site",
    SITE_DELETE: "Delete Site",
    TAG_CREATE: "Create Tag",
    TAG_UPDATE: "Update Tag",
    TAG_DELETE: "Delete Tag",
  };
  return actionMap[action] || action;
};

const formatDetails = (details: Record<string, any> | null): string => {
  if (!details || Object.keys(details).length === 0) return "-";

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

  return formattedDetails.join(", ");
};

export default function AuditLogTable({
  auditLogs,
  userRole,
  userCache,
  getCachedUserName,
  getUserName,
  onShowDetail,
}: AuditLogTableProps) {
  const isAdminOrOwner = userRole === "ADMIN" || userRole === "OWNER";

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="audit log table">
        <TableHead sx={{ bgcolor: "grey.50" }}>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "text.secondary",
                textTransform: "uppercase",
                fontSize: "0.75rem",
              }}
            >
              Time
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "text.secondary",
                textTransform: "uppercase",
                fontSize: "0.75rem",
              }}
            >
              Action
            </TableCell>
            {isAdminOrOwner && (
              <>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                  }}
                >
                  Actor
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                  }}
                >
                  Target
                </TableCell>
              </>
            )}
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "text.secondary",
                textTransform: "uppercase",
                fontSize: "0.75rem",
              }}
            >
              Details
            </TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {auditLogs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isAdminOrOwner ? 6 : 4}
                align="center"
                sx={{ py: 8 }}
              >
                <Typography color="text.secondary">
                  No audit logs found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            auditLogs.map((log) => {
              const badge = getActionBadge(log.action);
              return (
                <TableRow key={log.id} hover>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString("th-TH")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatActionText(log.action)}
                      color={badge.color}
                      size="small"
                      variant="filled"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  {isAdminOrOwner && (
                    <>
                      <TableCell>
                        {log.actor_user_id ? (
                          <UserDisplay
                            userId={log.actor_user_id}
                            userCache={userCache}
                            getCachedUserName={getCachedUserName}
                            getUserName={getUserName}
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                           const tgt = log as any;
                           if (tgt.target_user_id) {
                             return <UserDisplay
                                      userId={tgt.target_user_id}
                                      userCache={userCache}
                                      getCachedUserName={getCachedUserName}
                                      getUserName={getUserName}
                                    />;
                           }
                           
                           // Try mapping from root or from details JSON
                           const getField = (field: string) => tgt[field] || tgt.details?.[field];
                           
                           const deviceName = getField('target_device_name') || getField('device_name');
                           if (deviceName) return <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>Device: {deviceName}</Typography>;
                           
                           const osName = getField('target_os_name') || getField('os_name');
                           if (osName) return <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>OS: {osName}</Typography>;
                           
                           const backupName = getField('target_backup_name') || getField('backup_name');
                           if (backupName) return <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>Backup: {backupName}</Typography>;
                           
                           const templateName = getField('target_template_name') || getField('template_name');
                           if (templateName) return <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>Template: {templateName}</Typography>;
                           
                           const siteName = getField('target_site_name') || getField('site_name');
                           if (siteName) return <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>Site: {siteName}</Typography>;
                           
                           const interfaceName = getField('target_interface_name') || getField('interface_name');
                           if (interfaceName) return <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>Interface: {interfaceName}</Typography>;
                           
                           const tagName = getField('target_tag_name') || getField('tag_name');
                           if (tagName) return <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>Tag: {tagName}</Typography>;
                           
                           return "-";
                        })()}
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    {log.details ? (
                      <Box
                        sx={{
                          maxWidth: 250,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {formatDetails(log.details as Record<string, any>)}
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => onShowDetail(log)}>
                      <Visibility fontSize="small" color="primary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

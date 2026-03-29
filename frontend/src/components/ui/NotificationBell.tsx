"use client";

import React, { useState } from "react";
import { useAlerts } from "@/contexts/AlertContext";
import { formatDistanceToNow } from "date-fns";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  InfoOutlined as InfoIcon,
  Check as CheckIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";

export const NotificationBell: React.FC = () => {
  const { alerts, unreadCount, markAllAsRead, markAsRead } = useAlerts();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  const getIconForSeverity = (severity: string) => {
    if (["4", "5"].includes(severity)) return <ErrorIcon color="error" />;
    if (["2", "3"].includes(severity)) return <WarningIcon color="warning" />;
    return <InfoIcon color="info" />;
  };

  return (
    <>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        color="inherit"
        sx={{ color: "text.secondary", ml: 1, mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 500,
              display: "flex",
              flexDirection: "column",
              mt: 1.5,
              borderRadius: 2,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<CheckIcon />}
              onClick={markAllAsRead}
              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600 }}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        <List sx={{ p: 0, flexGrow: 1, overflowY: "auto", maxHeight: 360 }}>
          {alerts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No notifications yet.
              </Typography>
            </Box>
          ) : (
            alerts.map((alert) => (
              <React.Fragment key={`${alert.event_id}-${alert.received_at}`}>
                <ListItemButton
                  alignItems="flex-start"
                  onClick={() => markAsRead(alert.event_id)}
                  sx={{
                    bgcolor: !alert.isRead ? "action.hover" : "transparent",
                    "&:hover": {
                      bgcolor: "action.selected",
                    },
                    py: 1.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    {getIconForSeverity(alert.severity)}
                  </ListItemIcon>
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography variant="body2" component="div" fontWeight={!alert.isRead ? 600 : 500} noWrap>
                        {alert.host_name} - {alert.severity_label}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography
                          variant="caption"
                          component="div"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.4,
                          }}
                        >
                          {alert.frontend_message || alert.trigger_name}
                        </Typography>
                        <Typography variant="caption" component="div" color="text.disabled" sx={{ mt: 0.5 }}>
                          {(() => {
                            let dateStr = alert.received_at || "";
                            // If timestamp is missing timezone indicator, append "Z" for UTC
                            if (dateStr && !dateStr.endsWith("Z") && !dateStr.includes("+") && !dateStr.includes("-", 10)) {
                              dateStr += "Z";
                            }
                            const d = new Date(dateStr);
                            return !isNaN(d.getTime()) 
                              ? formatDistanceToNow(d, { addSuffix: true }) 
                              : "Just now";
                          })()}
                        </Typography>
                      </Box>
                    }
                  />
                  {!alert.isRead && (
                    <Box sx={{ display: "flex", alignItems: "center", ml: 1, mt: 1 }}>
                      <CircleIcon sx={{ fontSize: 10, color: "primary.main" }} />
                    </Box>
                  )}
                </ListItemButton>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

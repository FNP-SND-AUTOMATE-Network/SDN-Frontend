"use client";

import Link from "next/link";
import { Breadcrumbs, Typography, Link as MuiLink } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

interface DeviceDetailBreadcrumbProps {
  deviceName: string;
}

export default function DeviceDetailBreadcrumb({
  deviceName,
}: DeviceDetailBreadcrumbProps) {
  return (
    <Breadcrumbs
      separator={<NavigateNext fontSize="small" />}
      sx={{ mb: 2 }}
    >
      <MuiLink
        component={Link}
        href="/device/device-list"
        underline="hover"
        color="primary"
        fontSize={14}
      >
        Devices
      </MuiLink>
      <Typography fontSize={14} color="text.primary" fontWeight={500}>
        {deviceName}
      </Typography>
    </Breadcrumbs>
  );
}

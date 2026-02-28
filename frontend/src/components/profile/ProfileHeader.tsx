"use client";

import { Box, Typography } from "@mui/material";

interface ProfileHeaderProps {
  title: string;
  description: string;
}

export default function ProfileHeader({ title, description }: ProfileHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" component="h2" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {description}
      </Typography>
    </Box>
  );
}

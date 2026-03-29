import { Box, Typography } from "@mui/material";

export const DashboardHeader = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ระบบจัดการหลัก
        </Typography>
      </Box>
    </Box>
  );
};

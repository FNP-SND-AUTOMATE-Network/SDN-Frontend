"use client";

import { Box, Paper, Skeleton, Stack, Grid } from "@mui/material";

export default function ProfileSkeleton() {
    return (
        <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
            {/* Header Skeleton */}
            <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={400} height={20} />
            </Box>

            {/* Personal Information Skeleton */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Skeleton variant="text" width={160} height={32} />
                    <Skeleton variant="rounded" width={80} height={36} />
                </Stack>

                <Grid container spacing={3}>
                    {/* First Name */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="rounded" width="100%" height={40} />
                    </Grid>

                    {/* Last Name */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="rounded" width="100%" height={40} />
                    </Grid>

                    {/* Email */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Skeleton variant="text" width={60} height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="rounded" width="100%" height={40} />
                    </Grid>

                    {/* Role */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Skeleton variant="text" width={40} height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="rounded" width="100%" height={40} />
                    </Grid>
                </Grid>
            </Paper>

            {/* Change Password Skeleton */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Skeleton variant="text" width={140} height={32} sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    {/* Current Password */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="rounded" width="100%" height={40} />
                    </Grid>

                    {/* New Password */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Skeleton variant="text" width={100} height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="rounded" width="100%" height={40} />
                    </Grid>

                    {/* Confirm Password */}
                    <Grid size={{ xs: 12 }}>
                        <Skeleton variant="text" width={160} height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="rounded" width="100%" height={40} />
                    </Grid>
                </Grid>

                <Box mt={3}>
                    <Skeleton variant="rounded" width={140} height={40} />
                </Box>
            </Paper>
        </Box>
    );
}

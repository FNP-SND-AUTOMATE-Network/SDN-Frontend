import { PageLayout } from "@/components/layout/PageLayout";
import { Box, Grid, Skeleton, Paper } from "@mui/material";

function SectionSkeleton() {
    return (
        <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" width={200} height={32} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={400} height={20} />
        </Box>
    );
}

export default function DashboardLoading() {
    return (
        <PageLayout>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {/* Header Skeleton */}
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Skeleton variant="text" width={250} height={40} />
                        <Skeleton variant="text" width={350} height={24} />
                    </Box>
                    <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
                </Box>

                {/* Section 1: Summary Cards Layout Skeleton */}
                <Box>
                    <SectionSkeleton />
                    <Grid container spacing={2}>
                        {[1, 2, 3, 4].map((item) => (
                            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item}>
                                <Paper sx={{ p: 3, borderRadius: 2, height: 130 }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                        <Skeleton variant="circular" width={48} height={48} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton variant="text" width="60%" height={24} />
                                        </Box>
                                    </Box>
                                    <Skeleton variant="text" width="80%" height={40} />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Section 2: Top Resource Consumers Layout Skeleton */}
                <Box>
                    <SectionSkeleton />
                    <Grid container spacing={2}>
                        {[1, 2, 3].map((item) => (
                            <Grid size={{ xs: 12, md: 4 }} key={item}>
                                <Paper sx={{ p: 3, borderRadius: 2, height: 320 }}>
                                    <Skeleton variant="text" width="50%" height={32} sx={{ mb: 3 }} />
                                    {/* Emulate chart bars */}
                                    {[1, 2, 3, 4, 5].map((bar) => (
                                        <Box key={bar} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Skeleton variant="text" width="40%" />
                                                <Skeleton variant="text" width="15%" />
                                            </Box>
                                            <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
                                        </Box>
                                    ))}
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Section 3: Problems & Hosts Layout Skeleton */}
                <Box>
                    <SectionSkeleton />
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
                                <Skeleton variant="text" width="40%" height={36} sx={{ mb: 3 }} />
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                                ))}
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
                                <Skeleton variant="text" width="40%" height={36} sx={{ mb: 3 }} />
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                                ))}
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </PageLayout>
    );
}

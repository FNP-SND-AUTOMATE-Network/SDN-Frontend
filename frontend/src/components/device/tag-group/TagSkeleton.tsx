import { Box, Stack, Skeleton } from "@mui/material";
import TagTableSkeleton from "./TagTableSkeleton";

export default function TagSkeleton() {
  return (
    <Box sx={{ animation: "pulse" }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Skeleton variant="text" width={150} height={40} />
            <Skeleton variant="text" width={250} height={20} />
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={40} sx={{ flex: 1, maxWidth: 400, borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
          <Box sx={{ flexGrow: 1 }} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ overflowX: 'hidden' }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={160} height={90} sx={{ borderRadius: 2, flexShrink: 0 }} />
          ))}
        </Stack>
      </Box>

      {/* Table Skeleton */}
      <TagTableSkeleton />
    </Box>
  );
}


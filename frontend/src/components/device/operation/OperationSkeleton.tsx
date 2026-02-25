"use client";

import { Box, Skeleton, Stack, Paper } from "@mui/material";

export default function OperationSkeleton() {
  return (
    <Stack spacing={3}>
      {/* Header skeleton */}
      <Box>
        <Skeleton variant="text" width={220} height={32} />
        <Skeleton variant="text" width={340} height={20} sx={{ mt: 0.5 }} />
      </Box>

      {/* Search + Filter bar skeleton */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="rounded" width={320} height={40} />
        <Skeleton variant="rounded" width={140} height={40} />
        <Box flex={1} />
        <Skeleton variant="rounded" width={100} height={40} />
      </Stack>

      {/* Status cards skeleton */}
      <Stack direction="row" spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper key={i} variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 0.5 }}>
            <Skeleton variant="text" width={80} height={16} />
            <Skeleton variant="text" width={48} height={28} sx={{ mt: 0.5 }} />
          </Paper>
        ))}
      </Stack>

      {/* Table skeleton */}
      <Paper variant="outlined" sx={{ borderRadius: 0.5, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "grey.50", px: 2, py: 1.5 }}>
          <Stack direction="row" spacing={2}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} variant="text" width={80} height={16} />
            ))}
          </Stack>
        </Box>
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <Box key={rowIndex} sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {Array.from({ length: 7 }).map((_, colIndex) => (
                <Skeleton key={colIndex} variant="text" width="100%" height={20} />
              ))}
            </Stack>
          </Box>
        ))}
      </Paper>
    </Stack>
  );
}

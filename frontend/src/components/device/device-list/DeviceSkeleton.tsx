"use client";

import {
  Box,
  Stack,
  Skeleton,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";

export default function DeviceSkeleton() {
  return (
    <Box>
      {/* Page Title */}
      <Box mb={2}>
        <Skeleton variant="text" width={120} height={36} />
        <Skeleton variant="text" width={280} height={20} />
      </Box>

      {/* Search + Filters Row */}
      <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
        <Skeleton variant="rounded" width={360} height={40} sx={{ borderRadius: 0.5 }} />
        <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 0.5 }} />
        <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 0.5 }} />
        <Box flex={1} />
        <Skeleton variant="rounded" width={120} height={40} sx={{ borderRadius: 0.5 }} />
      </Stack>

      {/* Status Cards */}
      <Stack direction="row" spacing={2} mb={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2, flex: 1, minWidth: 140, borderRadius: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Skeleton variant="circular" width={10} height={10} />
              <Skeleton variant="text" width={50} height={18} />
            </Stack>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Skeleton variant="text" width={30} height={32} />
              <Skeleton variant="text" width={28} height={18} />
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 0.5 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <TableCell key={i}>
                  <Skeleton variant="text" width={60} height={16} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 6 }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {/* Device Name */}
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                {/* Serial */}
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                {/* Type */}
                <TableCell><Skeleton variant="text" width={70} /></TableCell>
                {/* Model */}
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                {/* IP */}
                <TableCell><Skeleton variant="text" width={90} /></TableCell>
                {/* Vendor */}
                <TableCell><Skeleton variant="text" width={60} /></TableCell>
                {/* Site */}
                <TableCell><Skeleton variant="text" width={70} /></TableCell>
                {/* Status */}
                <TableCell><Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 3 }} /></TableCell>
                {/* Actions */}
                <TableCell align="right"><Skeleton variant="circular" width={28} height={28} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} mt={1} px={1}>
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="text" width={40} height={20} />
        <Skeleton variant="rounded" width={60} height={30} />
      </Stack>
    </Box>
  );
}

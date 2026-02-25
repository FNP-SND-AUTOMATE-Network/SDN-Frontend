import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box,
} from "@mui/material";

export default function TagTableSkeleton() {
  return (
    <Box sx={{ width: '100%', animation: 'pulse' }}>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell><Skeleton variant="text" width={60} height={20} /></TableCell>
              <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
              <TableCell><Skeleton variant="text" width={120} height={20} /></TableCell>
              <TableCell align="center"><Skeleton variant="text" width={40} height={20} sx={{ mx: 'auto' }} /></TableCell>
              <TableCell align="center"><Skeleton variant="text" width={40} height={20} sx={{ mx: 'auto' }} /></TableCell>
              <TableCell align="center"><Skeleton variant="text" width={60} height={20} sx={{ mx: 'auto' }} /></TableCell>
              <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
              <TableCell align="right"><Skeleton variant="circular" width={24} height={24} sx={{ ml: 'auto' }} /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Skeleton variant="circular" width={12} height={12} />
                    <Skeleton variant="text" width={100} height={24} />
                  </Box>
                </TableCell>
                <TableCell><Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 4 }} /></TableCell>
                <TableCell><Skeleton variant="text" width={180} height={20} /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={20} height={20} sx={{ mx: 'auto' }} /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={20} height={20} sx={{ mx: 'auto' }} /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={20} height={20} sx={{ mx: 'auto' }} /></TableCell>
                <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                <TableCell align="right"><Skeleton variant="circular" width={24} height={24} sx={{ ml: 'auto' }} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Skeleton */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={200} height={20} />
        <Skeleton variant="rectangular" width={300} height={32} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
}


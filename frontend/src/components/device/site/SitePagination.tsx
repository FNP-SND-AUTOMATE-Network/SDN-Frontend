"use client";

import { Box, Typography, Pagination, useMediaQuery, useTheme } from "@mui/material";

interface SitePaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function SitePagination({
  currentPage,
  pageSize,
  total,
  onPageChange,
}: SitePaginationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  const handlePaginationChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  if (total === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        py: 2,
        px: 3,
        bgcolor: "white",
        borderTop: 1,
        borderColor: "divider",
        minHeight: 64,
        gap: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing <Box component="span" fontWeight="medium">{startIndex}</Box> to{" "}
        <Box component="span" fontWeight="medium">{endIndex}</Box> of{" "}
        <Box component="span" fontWeight="medium">{total}</Box> results
      </Typography>

      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePaginationChange}
        color="primary"
        shape="rounded"
        size={isMobile ? "small" : "medium"}
        siblingCount={isMobile ? 0 : 1}
      />
    </Box>
  );
}


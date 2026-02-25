"use client";

import { Box, Typography, Pagination } from "@mui/material";

interface TagPaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function TagPagination({
  currentPage,
  pageSize,
  total,
  onPageChange,
}: TagPaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return (
    <Box
      sx={{
        mt: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing{" "}
        <Box component="span" fontWeight="medium" color="text.primary">
          {total === 0 ? 0 : startIndex}
        </Box>{" "}
        to{" "}
        <Box component="span" fontWeight="medium" color="text.primary">
          {endIndex}
        </Box>{" "}
        of{" "}
        <Box component="span" fontWeight="medium" color="text.primary">
          {total}
        </Box>{" "}
        results
      </Typography>

      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => onPageChange(page)}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}

"use client";

import { Alert, AlertTitle } from "@mui/material";

interface ErrorMessageProps {
  error: string | null;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <Alert severity="error" sx={{ mb: 3 }}>
      <AlertTitle>Error</AlertTitle>
      {error}
    </Alert>
  );
}

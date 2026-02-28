"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

interface ChangePasswordSectionProps {
  passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  };
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: () => Promise<void>;
  saving: boolean;
}

export default function ChangePasswordSection({
  passwordData,
  onPasswordChange,
  onChangePassword,
  saving,
}: ChangePasswordSectionProps) {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={500} mb={3}>
        Change Password
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Current Password"
            name="current_password"
            type={showPasswords.current ? "text" : "password"}
            value={passwordData.current_password}
            onChange={onPasswordChange}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility("current")}
                    edge="end"
                  >
                    <FontAwesomeIcon
                      icon={showPasswords.current ? faEye : faEyeSlash}
                      size="sm"
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="New Password"
            name="new_password"
            type={showPasswords.new ? "text" : "password"}
            value={passwordData.new_password}
            onChange={onPasswordChange}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility("new")}
                    edge="end"
                  >
                    <FontAwesomeIcon
                      icon={showPasswords.new ? faEye : faEyeSlash}
                      size="sm"
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirm_password"
            type={showPasswords.confirm ? "text" : "password"}
            value={passwordData.confirm_password}
            onChange={onPasswordChange}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility("confirm")}
                    edge="end"
                  >
                    <FontAwesomeIcon
                      icon={showPasswords.confirm ? faEye : faEyeSlash}
                      size="sm"
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={onChangePassword}
          disabled={saving}
        >
          {saving ? "Changing Password..." : "Change Password"}
        </Button>
      </Box>
    </Paper>
  );
}

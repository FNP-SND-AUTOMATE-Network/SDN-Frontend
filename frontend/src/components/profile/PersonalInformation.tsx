"use client";

import { UserProfile } from "@/services/userService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPen } from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

interface PersonalInformationProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  formData: {
    name: string;
    surname: string;
    email: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function PersonalInformation({
  userProfile,
  isEditing,
  setIsEditing,
  formData,
  onInputChange,
  onSave,
  onCancel,
  saving,
}: PersonalInformationProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6" fontWeight={500}>
          Personal Information
        </Typography>
        {!isEditing && (
          <Button
            startIcon={<FontAwesomeIcon icon={faUserPen} />}
            onClick={() => setIsEditing(true)}
            sx={{ textTransform: "none" }}
          >
            Edit
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          {isEditing ? (
            <TextField
              fullWidth
              label="First Name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              variant="outlined"
            />
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                First Name
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  p: 1.5,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "grey.300",
                }}
              >
                {userProfile?.name || "N/A"}
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {isEditing ? (
            <TextField
              fullWidth
              label="Last Name"
              name="surname"
              value={formData.surname}
              onChange={onInputChange}
              variant="outlined"
            />
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last Name
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  p: 1.5,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "grey.300",
                }}
              >
                {userProfile?.surname || "N/A"}
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {isEditing ? (
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onInputChange}
              variant="outlined"
            />
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  p: 1.5,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "grey.300",
                }}
              >
                {userProfile?.email || "N/A"}
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid size={{  xs: 12, md: 6 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Role
            </Typography>
            <Typography
              variant="body1"
              sx={{
                p: 1.5,
                bgcolor: "grey.50",
                borderRadius: 1,
                border: 1,
                borderColor: "grey.300",
              }}
            >
              {userProfile?.role || "N/A"}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {isEditing && (
        <Stack direction="row" spacing={2} mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outlined" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      )}
    </Paper>
  );
}

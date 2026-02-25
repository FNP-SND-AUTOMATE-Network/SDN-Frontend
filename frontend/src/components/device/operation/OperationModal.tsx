"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Chip,
  MenuItem,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { Close, Download, CloudUpload } from "@mui/icons-material";
import { components } from "@/lib/apiv2/schema";

type OperatingSystem = components["schemas"]["OperatingSystemResponse"];
type OperatingSystemCreateRequest = components["schemas"]["OperatingSystemCreate"];
type OperatingSystemUpdateRequest = components["schemas"]["OperatingSystemUpdate"];
type OsType = components["schemas"]["OsType"];
type OSFile = components["schemas"]["OSFileResponse"];
import { Tag } from "@/services/tagService";

interface OperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  os?: OperatingSystem | null;
  onSubmit: (params: {
    osData: OperatingSystemCreateRequest | OperatingSystemUpdateRequest;
    file?: File | null;
    version?: string | null;
    tagIds: string[];
  }) => Promise<void>;
  files?: OSFile[];
  isFilesLoading?: boolean;
  onDeleteFile?: (fileId: string) => void;
  allTags: Tag[];
  onDownloadFile?: (file: OSFile) => void;
}

interface FormErrors {
  os_type?: string;
  description?: string;
  file?: string;
  version?: string;
}

export default function OperationModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  os,
  onSubmit,
  files = [],
  isFilesLoading = false,
  onDeleteFile,
  allTags,
  onDownloadFile,
}: OperationModalProps) {
  const [formData, setFormData] = useState<OperatingSystemCreateRequest>({
    os_type: "CISCO_IOS_XE" as OsType,
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && os) {
        setFormData({
          os_type: os.os_type,
          description: os.description || "",
        });
        setSelectedTagIds(os.tags ? os.tags.map((t) => t.tag_id) : []);
      } else {
        setFormData({
          os_type: "CISCO_IOS_XE" as OsType,
          description: "",
        });
        setSelectedTagIds([]);
      }
      setFile(null);
      setVersion("");
      setErrors({});
    }
  }, [isOpen, mode, os]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (errors.file) setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (errors.file) setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await onSubmit({
        osData: formData,
        file,
        version: version || null,
        tagIds: selectedTagIds,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting operating system:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 1 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" component="span" fontWeight={600}>
          {mode === "add" ? "Add Operating System" : "Edit Operating System"}
        </Typography>
        <IconButton onClick={onClose} disabled={isLoading} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Basic Information
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <TextField
                select
                label="OS Type"
                name="os_type"
                value={formData.os_type || "OTHER"}
                onChange={handleChange}
                disabled={isLoading}
                size="small"
                fullWidth
              >
                <MenuItem value="CISCO_IOS_XE">Cisco IOS-XE</MenuItem>
                <MenuItem value="HUAWEI_VRP">Huawei VRP</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Box>
          </Box>

          {/* Description & Tags */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <Box>
              <TextField
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                disabled={isLoading}
                size="small"
                fullWidth
                multiline
                minRows={3}
                placeholder="Short description about this OS"
                error={!!errors.description}
                helperText={errors.description}
              />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 1 }}>
                Tags (optional)
              </Typography>
              {allTags.length === 0 ? (
                <Typography variant="caption" color="text.disabled">
                  No tags available. You can create tags in Tag/Group page.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {(["tag", "group", "other"] as const).map((typeKey) => {
                    const tagsOfType = allTags.filter((t) => t.type === typeKey);
                    if (tagsOfType.length === 0) return null;
                    const typeLabel = typeKey === "tag" ? "Tag" : typeKey === "group" ? "Group" : "Other";

                    return (
                      <Box key={typeKey}>
                        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                          {typeLabel}
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
                          {tagsOfType.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.tag_id);
                            return (
                              <Chip
                                key={tag.tag_id}
                                label={tag.tag_name}
                                size="small"
                                onClick={() => toggleTagSelection(tag.tag_id)}
                                variant={isSelected ? "filled" : "outlined"}
                                sx={{
                                  fontSize: 11,
                                  fontWeight: 500,
                                  ...(isSelected
                                    ? { bgcolor: "primary.100", color: "primary.dark", borderColor: "primary.main" }
                                    : { borderColor: "grey.300", "&:hover": { borderColor: "primary.light", bgcolor: "primary.50" } }),
                                }}
                                avatar={
                                  <Box
                                    component="span"
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      bgcolor: tag.color,
                                      ml: "4px !important",
                                    }}
                                  />
                                }
                              />
                            );
                          })}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Box>

          {/* File Upload */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              OS File (optional)
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 2, alignItems: "start" }}>
              <Box>
                <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 0.5 }}>
                  OS File
                </Typography>
                <Box
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={handleBrowseClick}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                    py: 4,
                    border: 2,
                    borderStyle: "dashed",
                    borderRadius: 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                    borderColor: isDragging ? "primary.main" : "grey.300",
                    bgcolor: isDragging ? "primary.50" : "grey.50",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "primary.50",
                    },
                  }}
                >
                  <CloudUpload sx={{ fontSize: 28, color: "action.active", mb: 1 }} />
                  <Typography variant="body2" fontWeight={500}>
                    Drag and drop OS file here
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Or click to browse (single file)
                  </Typography>
                  {file && (
                    <Box
                      sx={{
                        mt: 1.5,
                        px: 1.5,
                        py: 1,
                        borderRadius: 0.5,
                        bgcolor: "background.paper",
                        border: 1,
                        borderColor: "divider",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="caption" noWrap sx={{ maxWidth: 220 }}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap", ml: 1 }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                    </Box>
                  )}
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  style={{ display: "none" }}
                />
                {errors.file && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.file}
                  </Typography>
                )}
              </Box>
              <Box>
                <TextField
                  label="Version (optional)"
                  name="version"
                  value={version}
                  onChange={(e) => {
                    setVersion(e.target.value);
                    if (errors.version) setErrors((prev) => ({ ...prev, version: "" }));
                  }}
                  error={!!errors.version}
                  helperText={errors.version || "File will be uploaded after saving OS information."}
                  disabled={isLoading}
                  size="small"
                  fullWidth
                  placeholder="e.g. 17.3.1"
                />
              </Box>
            </Box>
          </Box>

          {/* Existing Files (Edit mode) */}
          {mode === "edit" && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Uploaded Files
              </Typography>
              {isFilesLoading ? (
                <Stack spacing={1}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" height={56} />
                  ))}
                </Stack>
              ) : files.length === 0 ? (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    border: 1,
                    borderStyle: "dashed",
                    borderColor: "grey.300",
                    borderRadius: 0.5,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No files uploaded for this operating system yet.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {files.map((f) => (
                    <Box
                      key={f.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.5,
                        bgcolor: "grey.50",
                        borderRadius: 0.5,
                        border: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {f.file_name}
                          </Typography>
                          {f.version && (
                            <Chip
                              label={`v${f.version}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: 11 }}
                            />
                          )}
                        </Stack>
                        <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {(f.file_size / (1024 * 1024)).toFixed(2)} MB
                          </Typography>
                          {f.file_type && (
                            <Typography variant="caption" color="text.secondary">
                              {f.file_type}
                            </Typography>
                          )}
                          {f.checksum && (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                              checksum: {f.checksum}
                            </Typography>
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: "block" }}>
                          Uploaded at{" "}
                          {new Date(f.created_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} sx={{ ml: 2 }}>
                        {onDownloadFile && (
                          <IconButton
                            size="small"
                            disabled={isLoading}
                            onClick={() => onDownloadFile(f)}
                            title="Download"
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        )}
                        {onDeleteFile && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={isLoading}
                            onClick={() => onDeleteFile(f.id)}
                            sx={{ fontSize: 11, minWidth: 0, px: 1.5 }}
                          >
                            Delete
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            {isLoading
              ? "Saving..."
              : mode === "add"
                ? "Add Operating System"
                : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

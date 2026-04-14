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
import { Close, Download } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faDesktop, faTags, faFileArchive, faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
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

const SectionHeader = ({ step, title, description, icon }: { step: number; title: string; description: string; icon: any }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, mt: step === 1 ? 0 : 4 }}>
        <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            bgcolor: "#eff6ff", color: "primary.main",
            display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2
        }}>
            <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />
        </Box>
        <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase" }}>
                STEP {step}
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.25, fontSize: "0.95rem" }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                {description}
            </Typography>
        </Box>
    </Box>
);

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
      onClose={!isLoading ? onClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: "primary.main", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FontAwesomeIcon icon={faDesktop} style={{ fontSize: 20 }} />
            </Box>
            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                    {mode === "add" ? "Add Operating System" : "Edit Operating System"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {mode === "add" ? "Register a new OS image to the system." : "Update information and files for this OS image."}
                </Typography>
            </Box>
        </Box>
        <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={isLoading}
            sx={{ color: "text.secondary", position: "absolute", right: 16, top: 16 }}
        >
            <FontAwesomeIcon icon={faTimes} style={{ width: 16 }} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DialogContent dividers sx={{ p: 4, bgcolor: "#f8fafc" }}>
          <Box sx={{ bgcolor: "white", p: 4, borderRadius: 2, border: "1px solid", borderColor: "grey.200", "& .MuiFormLabel-asterisk": { color: "error.main" } }}>
            {/* STEP 1: Basic Information */}
            <SectionHeader
              step={1}
              title="Basic Details"
              description="Identify the operating system type and description."
              icon={faDesktop}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 1 }}>
              <TextField
                select
                label="OS Type"
                name="os_type"
                value={formData.os_type || "OTHER"}
                onChange={handleChange}
                disabled={isLoading}
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              >
                <MenuItem value="CISCO_IOS_XE">Cisco IOS-XE</MenuItem>
                <MenuItem value="HUAWEI_VRP">Huawei VRP</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>

              <TextField
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                disabled={isLoading}
                fullWidth
                multiline
                minRows={1}
                maxRows={3}
                placeholder="Short description"
                error={!!errors.description}
                helperText={errors.description}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            {/* STEP 2: Tags Validation */}
            <SectionHeader
              step={2}
              title="Tags Grouping"
              description="Optionally attach tags to categorize this OS."
              icon={faTags}
            />
            <Box sx={{ mb: 1, p: 2, bgcolor: "grey.50", borderRadius: 1, border: "1px dashed", borderColor: "grey.300" }}>
              {allTags.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No tags available. You can create tags in Tag/Group page.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {(["tag", "group", "other"] as const).map((typeKey) => {
                    const tagsOfType = allTags.filter((t) => t.type === typeKey);
                    if (tagsOfType.length === 0) return null;
                    const typeLabel = typeKey === "tag" ? "Tag" : typeKey === "group" ? "Group" : "Other";

                    return (
                      <Box key={typeKey}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block", textTransform: "uppercase" }}>
                          {typeLabel}
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
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
                                  fontSize: 12,
                                  px: 0.5,
                                  fontWeight: 500,
                                  ...(isSelected
                                    ? { bgcolor: "primary.100", color: "primary.dark", borderColor: "primary.main" }
                                    : { borderColor: "grey.400", bgcolor: "white", "&:hover": { borderColor: "primary.light", bgcolor: "primary.50" } }),
                                }}
                                avatar={
                                  <Box
                                    component="span"
                                    sx={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      bgcolor: tag.color,
                                      ml: "6px !important",
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

            {/* STEP 3: File Upload */}
            <SectionHeader
              step={3}
              title="OS File Images"
              description="Upload the firmware or OS image file (optional)."
              icon={faFileArchive}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 3fr" }, gap: 3, alignItems: "start" }}>
              <Box>
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
                    py: 5,
                    border: 2,
                    borderStyle: "dashed",
                    borderRadius: 2,
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
                  <FontAwesomeIcon icon={faCloudUploadAlt} style={{ fontSize: 32, color: "#9ca3af", marginBottom: 8 }} />
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    Drag and drop OS file here
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                    Or click to browse (single file)
                  </Typography>
                  {file && (
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderRadius: 1,
                        bgcolor: "white",
                        border: 1,
                        borderColor: "primary.main",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                      }}
                    >
                      <Typography variant="body2" fontWeight={500} color="primary.main" noWrap sx={{ maxWidth: "70%" }}>
                        {file.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap", ml: 1 }}>
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
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
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
                  helperText={errors.version || "Ex: 17.3.1. Extracted internally."}
                  disabled={isLoading}
                  fullWidth
                  placeholder="e.g. 17.3.1"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
            </Box>

          {/* Existing Files (Edit mode) */}
          {mode === "edit" && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Previously Uploaded Files
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
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: "#f8fafc", borderTop: "1px solid", borderColor: "grey.200" }}>
          <Button variant="outlined" onClick={onClose} disabled={isLoading} color="inherit" sx={{ bgcolor: "white" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ boxShadow: "none", bgcolor: "primary.main" }}
          >
            {isLoading
              ? "Saving..."
              : mode === "add"
                ? "Add Operating System"
                : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

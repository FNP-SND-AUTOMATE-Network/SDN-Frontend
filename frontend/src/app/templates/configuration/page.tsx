"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import TemplateCard from "@/components/templates/TemplateCard";
import TemplateCardSkeleton from "@/components/templates/TemplateCardSkeleton";
import CreateTemplateModal from "@/components/templates/CreateTemplateModal";
import EditTemplateModal from "@/components/templates/EditTemplateModal";
import TemplateDetailModal from "@/components/templates/TemplateDetailModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  configurationTemplateService,
  ConfigurationTemplate
} from "@/services/configurationTemplateService";
import { useAuth } from "@/contexts/AuthContext";
import { $api } from "@/lib/apiv2/fetch";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Pagination as MuiPagination,
  Alert,
  IconButton,
  Stack
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";

export default function TemplatesConfigurationPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  // Search & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // to debounce or hold input before search
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<"upload" | "write">("write");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConfigurationTemplate | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ConfigurationTemplate | null>(null);

  // Queries
  const { data, isLoading, error } = $api.useQuery(
    "get",
    "/configuration-templates/",
    {
      params: {
        query: {
          page: currentPage,
          page_size: pageSize,
          search: searchQuery || undefined,
        }
      }
    },
    {
      enabled: isAuthenticated,
    }
  );

  const templates = (data?.templates || []) as unknown as ConfigurationTemplate[];
  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 1;

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      if (!isAuthenticated) throw new Error("Not authenticated");
      await configurationTemplateService.deleteTemplate(templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/configuration-templates/"] });
      handleCloseDetailModal();
      showSuccess("Template deleted successfully");
    },
    onError: (error: any) => {
      showError(error instanceof Error ? error.message : "Failed to delete template");
    }
  });

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    // Auto-search if cleared
    if (!e.target.value) {
      setSearchQuery("");
      setCurrentPage(1);
    }
  };

  const handleTemplateClick = async (template: ConfigurationTemplate) => {
    if (!isAuthenticated) return;

    setSelectedTemplate(template);
    setShowDetailModal(true);
    setIsFetchingDetail(true);

    try {
      const fullTemplate = await configurationTemplateService.getTemplate(template.id);
      setSelectedTemplate(fullTemplate);
    } catch (err) {
      console.error("Failed to fetch template detail:", err);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTemplate(null);
  };

  const handleEditTemplate = (template: ConfigurationTemplate) => {
    setEditTemplate(template);
    setShowEditModal(true);
    handleCloseDetailModal();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditTemplate(null);
  };

  const handleDeleteTemplate = async (template: ConfigurationTemplate) => {
    deleteMutation.mutateAsync(template.id);
  };

  const handleOpenNewTemplate = () => {
    setCreateModalMode("write");
    setShowCreateModal(true);
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            configuration templates
          </Typography>
        </Box>

        {/* Search + Add Button */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          sx={{ mb: 4 }}
          component="form"
          onSubmit={handleSearchSubmit}
        >
          {/* Search Bar */}
          <TextField
            size="small"
            placeholder="Search templates..."
            value={searchInput}
            onChange={handleSearchChange}
            sx={{ flex: 1, maxWidth: 360, "& .MuiOutlinedInput-root": { bgcolor: "white", borderRadius: 2 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <Box flex={1} />

          <Button
            variant="contained"
            color="success"
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={handleOpenNewTemplate}
            sx={{ textTransform: "none", boxShadow: "none", whiteSpace: "nowrap", borderRadius: 2 }}
          >
            New Template
          </Button>
        </Stack>

        {/* Content */}
        {isLoading ? (
          <TemplateCardSkeleton count={8} />
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error instanceof Error ? error.message : "Failed to load templates."}
          </Alert>
        ) : templates.length === 0 ? (
          <Box sx={{ bgcolor: "white", borderRadius: 2, p: 6, textAlign: "center", boxShadow: 1 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No templates found
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenNewTemplate}
              sx={{ textTransform: "none" }}
            >
              Create your first template
            </Button>
          </Box>
        ) : (
          <>
            {/* Templates Grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4
            }}>
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={handleTemplateClick}
                />
              ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                <MuiPagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Create Template Modal */}
        <CreateTemplateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            showSuccess("Template created successfully");
          }}
          defaultMode={createModalMode}
        />

        {/* Template Detail Modal */}
        <TemplateDetailModal
          isOpen={showDetailModal}
          template={selectedTemplate}
          onClose={handleCloseDetailModal}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          isDeleting={deleteMutation.isPending}
          isLoadingContent={isFetchingDetail}
        />

        <EditTemplateModal
          isOpen={showEditModal}
          template={editTemplate}
          onClose={handleCloseEditModal}
          onSuccess={() => {
            showSuccess("Template updated successfully");
          }}
        />

        <MuiSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          title={snackbar.title}
          onClose={hideSnackbar}
        />
      </PageLayout>
    </ProtectedRoute>
  );
}

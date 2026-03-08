"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { PolicyHeader } from "@/components/policies/PolicyHeader";
import { PolicyTable } from "@/components/policies/PolicyTable";
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, CircularProgress } from "@mui/material";
import { CreatePolicyModal } from "@/components/policies/CreatePolicyModal";
import { PolicyDetailsDrawer } from "@/components/policies/PolicyDetailsDrawer";
import { components } from "@/lib/apiv2/schema";

type FlowRuleItem = components["schemas"]["FlowRuleItem"];

export default function PoliciesPage() {
    const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<FlowRuleItem | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<{ id: string, node_id?: string } | null>(null);
    const [deleteMode, setDeleteMode] = useState<"soft" | "hard">("soft");
    const [isDeleting, setIsDeleting] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        status: 'ALL',
        flowType: 'ALL'
    });

    const queryParams: any = {
        skip: page * rowsPerPage,
        limit: rowsPerPage
    };

    if (filters.search) queryParams.node_id = filters.search;
    if (filters.status && filters.status !== 'ALL') queryParams.status = filters.status;
    if (filters.flowType && filters.flowType !== 'ALL') queryParams.flow_type = filters.flowType;

    const { data: responseData, isLoading, refetch } = $api.useQuery(
        "get",
        "/api/v1/nbi/flow-rules",
        { params: { query: queryParams } }
    );

    const { data: statsData } = $api.useQuery(
        "get",
        "/api/v1/nbi/flow-rules",
        { params: { query: { skip: 0, limit: 5000 } as any } }
    );

    const flowRules = responseData?.data || [];
    const totalCount = responseData?.total || 0;

    const allFlows = statsData?.data || [];
    const stats = {
        total: statsData?.total || 0,
        active: allFlows.filter((f) => f.status === 'ACTIVE').length,
        pending: allFlows.filter((f) => f.status === 'PENDING').length,
        failed: allFlows.filter((f) => f.status === 'FAILED').length,
    };

    const handleAddPolicy = () => {
        setIsModalOpen(true);
    };

    const handleSyncFlows = () => {
        // Prompt for node_id? For now just show a message.
        showError("Sync Flows requires a target Node ID. Please select one (Feature TBA).");
    };

    const handleResetTable = () => {
        setFilters({ search: '', status: 'ALL', flowType: 'ALL' });
        setPage(0);
    };

    const handleView = (rule: any) => {
        setSelectedRule(rule);
    };

    const handleRetry = async (ruleId: string) => {
        try {
            const { error } = await fetchClient.POST("/api/v1/nbi/flow-rules/{flow_rule_id}/retry", {
                params: { path: { flow_rule_id: ruleId } }
            });
            if (error) throw error;
            showSuccess("Flow retry triggered");
            refetch();
        } catch (err: any) {
            showError(err?.message || "Failed to retry flow");
        }
    };

    const handleReactivate = async (ruleId: string) => {
        try {
            const { error } = await fetchClient.POST("/api/v1/nbi/flow-rules/{flow_rule_id}/reactivate", {
                params: { path: { flow_rule_id: ruleId } }
            });
            if (error) throw error;
            showSuccess("Flow reactivated");
            refetch();
        } catch (err: any) {
            showError(err?.message || "Failed to reactivate flow");
        }
    };

    const handleDelete = async (ruleId: string) => {
        const rule: any = (flowRules as any[]).find((r) => r.id === ruleId);
        if (!rule || !rule.node_id) {
            showError("Node ID not found for this rule");
            return;
        }
        setDeleteTarget({ id: ruleId, node_id: rule.node_id });
        setDeleteMode("soft");
    };

    const handleHardDelete = async (ruleId: string) => {
        setDeleteTarget({ id: ruleId });
        setDeleteMode("hard");
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);

        try {
            if (deleteMode === "soft") {
                const { error } = await fetchClient.DELETE("/api/v1/nbi/devices/{node_id}/flows/{flow_id}", {
                    params: { path: { node_id: deleteTarget.node_id!, flow_id: deleteTarget.id } }
                });
                if (error) throw error;
                showSuccess("Flow deleted successfully");
            } else {
                const { error } = await fetchClient.DELETE("/api/v1/nbi/flow-rules/{flow_rule_id}", {
                    params: { path: { flow_rule_id: deleteTarget.id } }
                });
                if (error) throw error;
                showSuccess("Flow permanently deleted");
            }
            refetch();
        } catch (err: any) {
            showError(err?.message || `Failed to ${deleteMode === "hard" ? "permanently delete" : "delete"} flow`);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <ProtectedRoute>
            <PageLayout>
                <PolicyHeader
                    onSearch={(term) => { setFilters({ ...filters, search: term }); setPage(0); }}
                    onFilterChange={(newFilters) => { setFilters({ ...filters, ...newFilters }); setPage(0); }}
                    onAddPolicy={handleAddPolicy}
                    onSyncFlows={handleSyncFlows}
                    searchTerm={filters.search}
                    selectedFlowType={filters.flowType}
                    selectedStatus={filters.status}
                    stats={stats}
                />

                <PolicyTable
                    data={flowRules as any}
                    isLoading={isLoading}
                    onView={handleView}
                    onRetry={handleRetry}
                    onReactivate={handleReactivate}
                    onDelete={handleDelete}
                    onHardDelete={handleHardDelete}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={(size) => {
                        setRowsPerPage(size);
                        setPage(0);
                    }}
                    totalCount={totalCount}
                />
                <MuiSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    title={snackbar.title}
                    onClose={hideSnackbar}
                />

                <CreatePolicyModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        refetch();
                    }}
                />

                <PolicyDetailsDrawer
                    open={!!selectedRule}
                    onClose={() => setSelectedRule(null)}
                    rule={selectedRule}
                />

                <Dialog open={!!deleteTarget} onClose={() => !isDeleting && setDeleteTarget(null)}>
                    <DialogTitle>
                        {deleteMode === "hard" ? "Permanent Delete Policy" : "Delete Policy"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {deleteMode === "hard"
                                ? "Are you sure you want to permanently delete this flow rule from the database? This action cannot be undone."
                                : "Are you sure you want to delete this flow policy from the device? It's status will be marked as DELETED."}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting} color="inherit">
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            color="error"
                            variant="contained"
                            disabled={isDeleting}
                            sx={{ minWidth: 100 }}
                        >
                            {isDeleting ? <CircularProgress size={24} color="inherit" /> : "Delete"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </PageLayout>
        </ProtectedRoute>
    );
}

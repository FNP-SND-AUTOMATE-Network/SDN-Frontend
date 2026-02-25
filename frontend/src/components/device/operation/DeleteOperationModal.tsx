"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { operatingSystemService } from "@/services/operatingSystemService";
import { useAuth } from "@/contexts/AuthContext";

interface DeleteOperationModalProps {
    open: boolean;
    osId: string | null;
    osName: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteOperationModal({
    open,
    osId,
    osName,
    onClose,
    onSuccess,
}: DeleteOperationModalProps) {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    const { mutate: deleteOs, isPending } = useMutation({
        mutationFn: (id: string) => {
            if (!token) throw new Error("Not authenticated");
            return operatingSystemService.deleteOperatingSystem(token, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get", "/operating-systems/"] });
            onSuccess();
            onClose();
        },
        onError: (err: any) => {
            console.error("Failed to delete operating system:", err);
        },
    });

    const handleDelete = () => {
        if (osId) deleteOs(osId);
    };

    return (
        <ConfirmModal
            isOpen={open}
            title="Confirm Delete Operating System"
            message={`Are you sure you want to delete operating system "${osName}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            isLoading={isPending}
            onClose={onClose}
            onConfirm={handleDelete}
        />
    );
}

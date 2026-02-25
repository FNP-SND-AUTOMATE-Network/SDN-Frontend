"use client";

import { useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { $api } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";

type DeviceNetwork =
    paths["/device-networks/"]["get"]["responses"]["200"]["content"]["application/json"]["devices"][number];

interface DeleteDeviceModalProps {
    open: boolean;
    device: DeviceNetwork;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteDeviceModal({
    open,
    device,
    onClose,
    onConfirm,
}: DeleteDeviceModalProps) {
    const queryClient = useQueryClient();

    const { mutate: deleteDevice, isPending } = $api.useMutation(
        "delete",
        "/device-networks/{device_id}",
        {
            onSuccess: () => {
                // Invalidate device list cache so it auto-refetches
                queryClient.invalidateQueries({ queryKey: ["get", "/device-networks/"] });
                onConfirm();
            },
            onError: (error) => {
                console.error("Failed to delete device:", error);
            },
        }
    );

    const handleDelete = () => {
        deleteDevice({
            params: {
                path: {
                    device_id: device.id,
                },
            },
        });
    };

    return (
        <ConfirmModal
            isOpen={open}
            title="Confirm Delete Device"
            message={`Are you sure you want to delete device "${device.device_name}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            isLoading={isPending}
            onClose={onClose}
            onConfirm={handleDelete}
        />
    );
}
"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import OperationModal from "./OperationModal";
import { useAuth } from "@/contexts/AuthContext";
import { components } from "@/lib/apiv2/schema";
import { operatingSystemService } from "@/services/operatingSystemService";

type OperatingSystemCreateRequest = components["schemas"]["OperatingSystemCreate"];
type OperatingSystemUpdateRequest = components["schemas"]["OperatingSystemUpdate"];
import { Tag } from "@/services/tagService";

interface CreateOperationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    allTags: Tag[];
}

export default function CreateOperationModal({
    open,
    onClose,
    onSuccess,
    allTags,
}: CreateOperationModalProps) {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (params: {
            osData: OperatingSystemCreateRequest;
            file?: File | null;
            version?: string | null;
            tagIds: string[];
        }) => {
            if (!isAuthenticated) throw new Error("Not authenticated");
            const { osData, file, version, tagIds } = params;

            const response = await operatingSystemService.createOperatingSystem(osData);
            const createdOs = response.operating_system;

            if (file) {
                await operatingSystemService.uploadOsFile(createdOs.id, file, version || null);
            }
            if (tagIds && tagIds.length > 0) {
                await operatingSystemService.assignTagsToOs(createdOs.id, tagIds);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get", "/operating-systems/"] });
            onSuccess();
        },
        onError: (err: any) => {
            console.error("Failed to create operating system:", err);
        },
    });

    const handleSubmit = async (params: {
        osData: OperatingSystemCreateRequest | OperatingSystemUpdateRequest;
        file?: File | null;
        version?: string | null;
        tagIds: string[];
    }) => {
        await createMutation.mutateAsync({
            ...params,
            osData: params.osData as OperatingSystemCreateRequest,
        });
    };

    return (
        <OperationModal
            isOpen={open}
            onClose={onClose}
            onSuccess={onSuccess}
            mode="add"
            os={null}
            onSubmit={handleSubmit}
            allTags={allTags}
        />
    );
}

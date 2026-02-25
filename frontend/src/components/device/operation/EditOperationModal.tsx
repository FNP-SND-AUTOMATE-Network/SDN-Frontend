"use client";

import { useEffect, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import OperationModal from "./OperationModal";
import { useAuth } from "@/contexts/AuthContext";
import { components } from "@/lib/apiv2/schema";
import { operatingSystemService } from "@/services/operatingSystemService";

type OperatingSystem = components["schemas"]["OperatingSystemResponse"];
type OperatingSystemUpdateRequest = components["schemas"]["OperatingSystemUpdate"];
type OSFile = components["schemas"]["OSFileResponse"];
import { Tag } from "@/services/tagService";

interface EditOperationModalProps {
    open: boolean;
    os: OperatingSystem | null;
    onClose: () => void;
    onSuccess: () => void;
    allTags: Tag[];
}

export default function EditOperationModal({
    open,
    os,
    onClose,
    onSuccess,
    allTags,
}: EditOperationModalProps) {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    // --- OS Files state ---
    const [osFiles, setOsFiles] = useState<OSFile[]>([]);
    const [isFilesLoading, setIsFilesLoading] = useState(false);

    // Fetch files when modal opens with an OS
    useEffect(() => {
        if (open && os && token) {
            setIsFilesLoading(true);
            operatingSystemService
                .getOsFiles(token, os.id)
                .then((response) => setOsFiles(response.files as OSFile[]))
                .catch((err: any) => console.error("Unable to load OS files:", err))
                .finally(() => setIsFilesLoading(false));
        } else if (!open) {
            setOsFiles([]);
        }
    }, [open, os, token]);

    // --- Edit mutation ---
    const editMutation = useMutation({
        mutationFn: async (params: {
            osData: OperatingSystemUpdateRequest;
            file?: File | null;
            version?: string | null;
            tagIds: string[];
        }) => {
            if (!token || !os) throw new Error("Not authenticated or no OS selected");
            const { osData, file, version, tagIds } = params;

            await operatingSystemService.updateOperatingSystem(token, os.id, osData);

            if (file) {
                await operatingSystemService.uploadOsFile(token, os.id, file, version || null);
            }

            // Update tags: add new, remove old
            const existingTagIds = os.tags?.map((t) => t.tag_id) ?? [];
            const toAdd = tagIds.filter((id) => !existingTagIds.includes(id));
            const toRemove = existingTagIds.filter((id) => !tagIds.includes(id));

            if (toAdd.length > 0) {
                await operatingSystemService.assignTagsToOs(token, os.id, toAdd);
            }
            if (toRemove.length > 0) {
                await operatingSystemService.removeTagsFromOs(token, os.id, toRemove);
            }

            // Refresh files list
            const filesResponse = await operatingSystemService.getOsFiles(token, os.id);
            setOsFiles(filesResponse.files as OSFile[]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get", "/operating-systems/"] });
            onSuccess();
        },
        onError: (err: any) => {
            console.error("Failed to update operating system:", err);
        },
    });

    // --- Delete file mutation ---
    const deleteFileMutation = useMutation({
        mutationFn: async (fileId: string) => {
            if (!token || !os) throw new Error("Not authenticated");
            await operatingSystemService.deleteOsFile(token, os.id, fileId);
            const filesResponse = await operatingSystemService.getOsFiles(token, os.id);
            return filesResponse.files;
        },
        onSuccess: (files) => {
            setOsFiles(files as OSFile[]);
        },
        onError: (err: any) => {
            console.error("Failed to delete OS file:", err);
        },
    });

    // --- Download handler ---
    const handleDownloadFile = async (file: OSFile) => {
        if (!token || !os) return;
        try {
            const blob = await operatingSystemService.downloadOsFile(token, os.id, file.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.file_name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Unable to download OS file:", err);
        }
    };

    const handleSubmit = async (params: {
        osData: OperatingSystemUpdateRequest;
        file?: File | null;
        version?: string | null;
        tagIds: string[];
    }) => {
        await editMutation.mutateAsync(params);
    };

    return (
        <OperationModal
            isOpen={open}
            onClose={onClose}
            onSuccess={onSuccess}
            mode="edit"
            os={os}
            onSubmit={handleSubmit}
            files={osFiles}
            isFilesLoading={isFilesLoading}
            onDeleteFile={(fileId) => deleteFileMutation.mutate(fileId)}
            allTags={allTags}
            onDownloadFile={handleDownloadFile}
        />
    );
}

"use client";

import DeviceModal from "./DeviceModal";
import { Tag } from "@/services/tagService";
import { LocalSite } from "@/services/siteService";
import { OperatingSystem } from "@/services/operatingSystemService";

interface CreateDeviceModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    allTags?: Tag[];
    allSites?: LocalSite[];
    allOperatingSystems?: OperatingSystem[];
}

export default function CreateDeviceModal({
    open,
    onClose,
    onSuccess,
    allTags = [],
    allSites = [],
    allOperatingSystems = [],
}: CreateDeviceModalProps) {
    return (
        <DeviceModal
            isOpen={open}
            onClose={onClose}
            onSuccess={onSuccess}
            mode="add"
            device={null}
            allTags={allTags}
            allSites={allSites}
            allOperatingSystems={allOperatingSystems}
        />
    );
}
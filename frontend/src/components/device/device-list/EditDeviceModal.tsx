"use client";

import DeviceModal from "./DeviceModal";
import { paths } from "@/lib/apiv2/schema";
import { Tag } from "@/services/tagService";
import { LocalSite } from "@/services/siteService";
import { OperatingSystem } from "@/services/operatingSystemService";

type DeviceNetwork =
    paths["/device-networks/"]["get"]["responses"]["200"]["content"]["application/json"]["devices"][number];

interface EditDeviceModalProps {
    open: boolean;
    device: DeviceNetwork;
    onClose: () => void;
    onSuccess: () => void;
    allTags?: Tag[];
    allSites?: LocalSite[];
    allOperatingSystems?: OperatingSystem[];
}

export default function EditDeviceModal({
    open,
    device,
    onClose,
    onSuccess,
    allTags = [],
    allSites = [],
    allOperatingSystems = [],
}: EditDeviceModalProps) {
    return (
        <DeviceModal
            isOpen={open}
            onClose={onClose}
            onSuccess={onSuccess}
            mode="edit"
            device={device}
            allTags={allTags}
            allSites={allSites}
            allOperatingSystems={allOperatingSystems}
        />
    );
}

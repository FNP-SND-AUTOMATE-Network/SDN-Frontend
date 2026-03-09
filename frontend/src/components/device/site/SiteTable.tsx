"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  TableSortLabel,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPencil,
  faTrash,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { components } from "@/lib/apiv2/schema";

type LocalSiteResponse = components["schemas"]["LocalSiteResponse"];

interface SiteTableProps {
  sites: LocalSiteResponse[];
  onEditSite: (site: LocalSiteResponse) => void;
  onDeleteSite: (siteId: string, siteName: string) => void;
}

const getSiteTypeBadge = (siteType: string) => {
  const badges: Record<string, { label: string; color: "primary" | "success" | "default" }> = {
    DataCenter: { label: "Data Center", color: "primary" },
    BRANCH: { label: "Branch", color: "success" },
    OTHER: { label: "Other", color: "default" },
  };
  return badges[siteType] || badges.OTHER;
};

const formatLocation = (site: LocalSiteResponse) => {
  const parts = [];
  if (site.building_name) parts.push(site.building_name);
  if (site.floor_number !== null && site.floor_number !== undefined)
    parts.push(`Floor ${site.floor_number}`);
  if (site.rack_number !== null && site.rack_number !== undefined)
    parts.push(`Rack ${site.rack_number}`);
  return parts.length > 0 ? parts.join(", ") : "-";
};

const formatAddress = (site: LocalSiteResponse) => {
  const parts = [];
  if (site.address) parts.push(site.address);
  if (site.city) parts.push(site.city);
  if (site.country) parts.push(site.country);
  return parts.length > 0 ? parts.join(", ") : "-";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function SiteTable({
  sites,
  onEditSite,
  onDeleteSite,
}: SiteTableProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSiteId, setMenuSiteId] = useState<string | null>(null);

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof LocalSiteResponse>("site_name");

  const handleSort = (property: keyof LocalSiteResponse) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof LocalSiteResponse) => () => {
    handleSort(property);
  };

  const sortedSites = [...sites].sort((a, b) => {
    let aVal: any = a[orderBy] || "";
    let bVal: any = b[orderBy] || "";

    if (orderBy === "site_name") {
      aVal = a.site_name || a.site_code;
      bVal = b.site_name || b.site_code;
    }

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>, siteId: string) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuSiteId(siteId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuSiteId(null);
  };

  const handleEdit = () => {
    if (!menuSiteId) return;
    const site = sites.find((s) => s.site_code === menuSiteId);
    if (site) {
      onEditSite(site);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (!menuSiteId) return;
    const site = sites.find((s) => s.site_code === menuSiteId);
    if (site) {
      onDeleteSite(site.site_code, site.site_name || site.site_code); // Use site_code as ID
    }
    handleMenuClose();
  };

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="local sites table">
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'site_name'} direction={orderBy === 'site_name' ? order : 'asc'} onClick={createSortHandler('site_name')}>Name</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'site_type'} direction={orderBy === 'site_type' ? order : 'asc'} onClick={createSortHandler('site_type')}>Type</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Location</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Address</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'device_count'} direction={orderBy === 'device_count' ? order : 'asc'} onClick={createSortHandler('device_count')}>Devices</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'updated_at'} direction={orderBy === 'updated_at' ? order : 'asc'} onClick={createSortHandler('updated_at')}>Updated</TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Box sx={{ color: "text.secondary", textAlign: "center" }}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" style={{ opacity: 0.3, marginBottom: 16 }} />
                    <Typography variant="h6" fontWeight="medium" sx={{ mb: 1 }}>
                      No sites found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add a new site to get started
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              sortedSites.map((site) => {
                const typeBadge = getSiteTypeBadge(site.site_type);
                return (
                  <TableRow
                    key={site.site_code}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 }, "&:hover": { bgcolor: "action.hover" }, transition: "background-color 0.2s" }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        {site.site_name || site.site_code}
                      </Typography>
                      {site.site_name && (
                        <Typography variant="caption" color="text.secondary">
                          {site.site_code}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={typeBadge.label}
                        color={typeBadge.color}
                        size="small"
                        sx={{ fontSize: "0.75rem", height: 24, fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatLocation(site)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {formatAddress(site)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={500}>
                        {site.device_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(site.updated_at || new Date().toISOString())}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, site.site_code)}
                        sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} style={{ width: 16 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { minWidth: 150, borderRadius: 2, mt: 0.5 },
          },
        }}
      >
        <MenuItem onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faPencil} className="text-blue-600 w-4 h-4" />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ variant: "body2", color: "text.primary" }} />
        </MenuItem>
        <MenuItem onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faTrash} className="text-red-600 w-4 h-4" />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: "body2", color: "error.main" }} />
        </MenuItem>
      </Menu>
    </>
  );
}

"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPencil,
  faTrash,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Badge,
} from "@mui/material";
import { components } from "@/lib/apiv2/schema";

type TagResponse = components["schemas"]["TagResponse"];
type TypeTag = components["schemas"]["TypeTag"];

interface TagTableProps {
  tags: TagResponse[];
  onEditTag: (tag: TagResponse) => void;
  onDeleteTag: (tagId: string, tagName: string) => void;
}

const getTypeBadgeProps = (type: TypeTag) => {
  const badges: Record<TypeTag, { label: string; color: string; bgcolor: string }> = {
    tag: { label: "Tag", color: "#1e40af", bgcolor: "#dbeafe" }, // blue-800, blue-100
    group: { label: "Group", color: "#6b21a8", bgcolor: "#f3e8ff" }, // purple-800, purple-100
    other: { label: "Other", color: "#1f2937", bgcolor: "#f3f4f6" }, // gray-800, gray-100
  };
  return badges[type] || badges.other;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function TagTable({
  tags,
  onEditTag,
  onDeleteTag,
}: TagTableProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTag, setSelectedTag] = useState<TagResponse | null>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, tag: TagResponse) => {
    setAnchorEl(event.currentTarget);
    setSelectedTag(tag);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTag(null);
  };

  const handleEdit = () => {
    if (selectedTag) {
      onEditTag(selectedTag);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTag) {
      onDeleteTag(selectedTag.tag_id, selectedTag.tag_name);
    }
    handleMenuClose();
  };

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="tag table">
        <TableHead sx={{ bgcolor: "grey.50" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Tag</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Type</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Description</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>OS</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Devices</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Templates</TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Updated</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tags.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                <FontAwesomeIcon icon={faTag} style={{ width: 48, height: 48, color: "var(--mui-palette-grey-300)", marginBottom: 16 }} />
                <Typography variant="h6" color="text.primary" fontWeight="medium">
                  No tags found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add a new tag to get started
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            tags.map((tag) => {
              const typeProps = getTypeBadgeProps(tag.type);
              return (
                <TableRow key={tag.tag_id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: tag.color, flexShrink: 0 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {tag.tag_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 4,
                        display: 'inline-block',
                        bgcolor: typeProps.bgcolor,
                        color: typeProps.color,
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                      }}
                    >
                      {typeProps.label}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tag.description || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="medium">{tag.os_count || 0}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="medium">{tag.device_count || 0}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="medium">{tag.template_count || 0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(tag.updated_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="more"
                      id={`tag-button-${tag.tag_id}`}
                      aria-controls={open ? `tag-menu-${tag.tag_id}` : undefined}
                      aria-expanded={open ? 'true' : undefined}
                      aria-haspopup="true"
                      onClick={(e) => handleMenuClick(e, tag)}
                      size="small"
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
      
      {/* Action Menu */}
      <Menu
        id="tag-menu"
        MenuListProps={{
          'aria-labelledby': 'tag-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            elevation: 2,
            sx: { minWidth: 160, borderRadius: 2, mt: 0.5 },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit} sx={{ py: 1.5 }}>
          <FontAwesomeIcon icon={faPencil} style={{ width: 16, marginRight: 12, color: "var(--mui-palette-primary-main)" }} />
          <Typography variant="body2">Edit</Typography>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ py: 1.5, color: "error.main" }}>
          <FontAwesomeIcon icon={faTrash} style={{ width: 16, marginRight: 12 }} />
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>
    </TableContainer>
  );
}

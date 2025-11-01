"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faNetworkWired,
  faShieldAlt,
  faFileAlt,
  faServer,
  faDesktop,
  faChevronDown,
  faChevronRight,
  faList,
  faCheckCircle,
  faCog,
  faComputer,
  faMapMarkerAlt,
  faTags,
  faDownload,
  faCode,
} from "@fortawesome/free-solid-svg-icons";

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: faHome,
    href: "/dashboard",
  },
  {
    id: "topology",
    label: "Topology",
    icon: faNetworkWired,
    href: "/topology",
  },
  {
    id: "policies",
    label: "Policies",
    icon: faShieldAlt,
    children: [
      {
        id: "catalog",
        label: "Catalog",
        icon: faList,
        href: "/policies/catalog",
      },
      {
        id: "applied-policies",
        label: "Applied Policies",
        icon: faCheckCircle,
        href: "/policies/applied",
      },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    icon: faFileAlt,
    children: [
      {
        id: "policies-template",
        label: "Policies",
        icon: faShieldAlt,
        href: "/templates/policies",
      },
      {
        id: "configuration-template",
        label: "Configuration",
        icon: faCog,
        href: "/templates/configuration",
      },
    ],
  },
  {
    id: "ip-management",
    label: "IPAM",
    icon: faServer,
    href: "/ip-management",
  },
  {
    id: "device",
    label: "Device",
    icon: faDesktop,
    children: [
      {
        id: "device-list",
        label: "Device List",
        icon: faList,
        href: "/device/device-list",
      },
      {
        id: "Operation System",
        label: "Operation",
        icon: faComputer,
        href: "/device/operation",
      },
      {
        id: "tag-group",
        label: "Tag/Group",
        icon: faTags,
        href: "/device/tag-group",
      },
      {
        id: "Site",
        label: "Site",
        icon: faMapMarkerAlt,
        href: "/device/site",
      },
      {
        id: "backup-config",
        label: "Backup Config",
        icon: faDownload,
        href: "/device/backup-config",
      },
    ],
  },
  {
    id: "Audit Log",
    label: "Audit Log",
    icon: faCode,
    href: "/audit-log",
  },
];

export const Sidebar: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  // Auto-expand parent menus that have active children
  React.useEffect(() => {
    const activeParents: string[] = [];
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => child.href && isActive(child.href)
        );
        if (hasActiveChild) {
          activeParents.push(item.id);
        }
      }
    });
    setExpandedItems(activeParents);
  }, [pathname]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const isParentActive = (item: MenuItem) => {
    if (item.href && isActive(item.href)) {
      return true;
    }
    if (item.children) {
      return item.children.some((child) => child.href && isActive(child.href));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const paddingLeft = level * 16 + 16;
    const itemIsActive = item.href ? isActive(item.href) : false;
    const parentIsActive = isParentActive(item);

    return (
      <div key={item.id}>
        {/* Parent Item */}
        {hasChildren ? (
          <div
            className={`flex items-center justify-between py-2 px-4 transition-colors cursor-pointer rounded-lg mx-2 ${
              parentIsActive
                ? "bg-primary-100 text-primary-700 border-l-4 border-primary-500"
                : "hover:bg-primary-50 text-gray-700"
            }`}
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={() => toggleExpanded(item.id)}
          >
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon
                icon={item.icon}
                className={`w-4 h-4 ${
                  parentIsActive ? "text-primary-600" : "text-primary-600"
                }`}
              />
              <span
                className={`text-sm font-medium font-sf-pro-text ${
                  parentIsActive
                    ? "text-primary-700 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {item.label}
              </span>
            </div>
            <FontAwesomeIcon
              icon={isExpanded ? faChevronDown : faChevronRight}
              className={`w-3 h-3 transition-transform ${
                parentIsActive ? "text-primary-500" : "text-gray-500"
              }`}
            />
          </div>
        ) : (
          <Link href={item.href || "#"}>
            <div
              className={`flex items-center space-x-3 py-2 px-4 transition-colors cursor-pointer rounded-lg mx-2 ${
                itemIsActive
                  ? "bg-primary-100 text-primary-700 border-l-4 border-primary-500"
                  : "hover:bg-primary-50 text-gray-700"
              }`}
              style={{ paddingLeft: `${paddingLeft}px` }}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className={`w-4 h-4 ${
                  itemIsActive ? "text-primary-600" : "text-primary-600"
                }`}
              />
              <span
                className={`text-sm font-medium font-sf-pro-text ${
                  itemIsActive
                    ? "text-primary-700 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {item.label}
              </span>
            </div>
          </Link>
        )}

        {/* Children Items - Show below parent when expanded */}
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {item.children?.map((child) => {
              const childIsActive = child.href ? isActive(child.href) : false;
              return (
                <Link key={child.id} href={child.href || "#"}>
                  <div
                    className={`flex items-center mt-2 space-x-3 py-2 px-4  transition-colors cursor-pointer rounded-lg mx-2 ml-4 ${
                      childIsActive
                        ? "bg-primary-100 text-primary-700 border-l-4 border-primary-500"
                        : "hover:bg-primary-50 text-gray-600"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={child.icon}
                      className={`w-3 h-3 ${
                        childIsActive ? "text-primary-600" : "text-primary-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-sf-pro-text ${
                        childIsActive
                          ? "text-primary-700 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {child.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="fixed top-16 left-0 w-64 bg-white shadow-sm border-r border-primary-100 h-[calc(100vh-4rem)] z-40 overflow-y-auto hidden lg:block">
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>
    </aside>
  );
};

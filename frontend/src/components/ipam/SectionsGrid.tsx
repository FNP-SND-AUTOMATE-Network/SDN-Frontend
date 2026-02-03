"use client";

import { Section } from "@/services/ipamService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faEllipsisV, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";

interface SectionsGridProps {
    sections: Section[];
    onRefresh: () => void;
}

function SectionsGrid({ sections, onRefresh }: SectionsGridProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // แยก sections เป็น root และ children
    const rootSections = sections.filter(s => !s.master_section);
    const getSectionChildren = (parentId: string) =>
        sections.filter(s => s.master_section === parentId);

    const toggleExpand = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const renderSection = (section: Section, level: number = 0) => {
        const children = getSectionChildren(section.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedSections.has(section.id);
        const marginLeft = level * 20; // Indent for nested sections

        return (
            <div key={section.id} style={{ marginLeft: `${marginLeft}px` }}>
                {/* Section Card */}
                <div className="mb-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all duration-200 group">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                    <FontAwesomeIcon
                                        icon={isExpanded ? faFolderOpen : faFolder}
                                        className="w-6 h-6 text-primary-600"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Link href={`/ipam/sections/${section.id}`}>
                                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                                            {section.name}
                                        </h3>
                                    </Link>
                                    {section.description && (
                                        <p className="text-sm text-gray-600 mt-1 overflow-hidden" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: '1.5rem',
                                            maxHeight: '3rem'
                                        }}>
                                            {section.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {hasChildren && (
                                    <button
                                        onClick={() => toggleExpand(section.id)}
                                        className="text-gray-400 hover:text-gray-600 p-2"
                                    >
                                        <span className="text-xs font-medium">
                                            {isExpanded ? 'Collapse' : `${children.length} sub${children.length > 1 ? 's' : ''}`}
                                        </span>
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // TODO: Open section menu
                                        console.log("Section menu:", section.id);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Section ID: {section.id}</span>
                                {level > 0 && (
                                    <span className="text-primary-600">Sub-section</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Render children if expanded */}
                {hasChildren && isExpanded && (
                    <div className="ml-4 border-l-2 border-gray-200 pl-4">
                        {children.map(child => renderSection(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            {rootSections.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    No root sections found
                </div>
            ) : (
                rootSections.map(section => renderSection(section, 0))
            )}
        </div>
    );
}

export default SectionsGrid;


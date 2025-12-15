"use client";

import { motion } from "motion/react";
import React from "react";
import { ProjectDetailsData, ProjectDetailsTabProps } from "./types";
import TextType from "@/components/ui/TextType";
import PanelContainer from "./ui/PanelContainer";

export const ProjectDetailsTab: React.FC<ProjectDetailsTabProps> = ({
  projectData,
  className,
  projectId: _projectId,
  onDataUpdate: _onDataUpdate,
  loading = false,
  error = null,
}) => {
  // TODO: Default project data theo design Figma
  const defaultProjectData: ProjectDetailsData = {
    overview: {
      title: "Overview",
      content: "Lorem Ipsum Lorem Ipsum",
    },
    introduction: {
      title: "Introduction",
      content:
        "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem Ipsum",
    },
  };

  const displayData = projectData || defaultProjectData;

  // Loading state
  if (loading) {
    return (
      <div className={`${className || ""}`}>
        <div className="relative md:border border-gray-200/20 rounded-lg md:p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200/20 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200/20 rounded w-full"></div>
            <div className="h-4 bg-gray-200/20 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${className || ""}`}>
        <div className="border border-red-500/20 rounded-lg p-8 md:p-10">
          <p className="text-red-400 font-mono text-sm">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${className || ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Main container theo design Figma */}
      <PanelContainer
        className="space-y-4 border-0 md:border lg:py-8 lg:px-10"
        withBars={true}
      >
        {/* Overview Section */}
        {displayData.overview && (
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
          >
            <motion.h3
              className="text-lg font-mono font-light text-gray-200 tracking-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.25, ease: "easeOut" }}
            >
              {displayData.overview.title}
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "16px",
                lineHeight: "1.625",
              }}
            >
              <TextType
                text={[displayData.overview.content]}
                typingSpeed={30}
                pauseDuration={500}
                showCursor={true}
                cursorCharacter=""
                loop={false}
                startOnVisible={true}
                initialDelay={300}
                textColors={["rgba(255, 255, 255, 0.2)"]}
                cursorClassName="font-mono text-white/20"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Introduction Section */}
        {displayData.introduction && (
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.35, ease: "easeOut" }}
          >
            <motion.h3
              className="text-lg font-mono font-light text-gray-200 tracking-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.4, ease: "easeOut" }}
            >
              {displayData.introduction.title}
            </motion.h3>
            <motion.p
              className="font-mono text-base text-white/20 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6, ease: "linear" }}
            >
              {displayData.introduction.content}
            </motion.p>
          </motion.div>
        )}

        {/* Additional Information Section - Optional */}
        {displayData.additionalInfo &&
          Object.keys(displayData.additionalInfo).length > 0 && (
            <motion.div
              className="space-y-1 pt-4 border-t border-gray-200/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
            >
              <motion.h3
                className="text-lg font-mono font-light text-gray-200 tracking-tight"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.55, ease: "easeOut" }}
              >
                Additional Information
              </motion.h3>
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6, ease: "easeOut" }}
              >
                {Object.entries(displayData.additionalInfo).map(
                  ([key, value], index) => (
                    <motion.div
                      key={key}
                      className="flex justify-between items-start"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: 0.65 + index * 0.05,
                        ease: "easeOut",
                      }}
                    >
                      <span className="font-mono text-base text-white/20 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>
                      <span className="font-mono text-base text-gray-200 text-right max-w-xs">
                        {value}
                      </span>
                    </motion.div>
                  )
                )}
              </motion.div>
            </motion.div>
          )}
      </PanelContainer>
    </motion.div>
  );
};
export default ProjectDetailsTab;

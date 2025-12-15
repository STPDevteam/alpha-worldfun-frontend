"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbSectionProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
  showAdmin?: boolean;
  onAdminClick?: () => void;
  className?: string;
}

const BreadcrumbSection = ({
  items,
  showAdmin: _showAdmin = false,
  onAdminClick: _onAdminClick,
  className = "",
}: BreadcrumbSectionProps) => {
  return (
    <div
      className={`flex flex-row justify-between items-center gap-2 sm:gap-4 md:gap-[78px] w-full max-w-[1280px] ${className}`}
    >
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList className="flex items-center gap-1">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink
                    href={item.href}
                    className="text-[#828B8D] text-xs sm:text-sm leading-[1.29] hover:text-[#E0E0E0] transition-colors"
                    style={{ fontFamily: "DM Mono" }}
                  >
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage
                    className="text-[#E0E0E0] text-xs sm:text-sm leading-[18px] font-normal truncate max-w-[120px] sm:max-w-none"
                    style={{ fontFamily: "DM Mono" }}
                  >
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbSection;

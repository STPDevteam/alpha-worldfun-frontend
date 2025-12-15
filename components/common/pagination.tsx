import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui";
import { cn } from "@/libs/utils";
import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
};

export const PaginationBar: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  goToPage,
}) => {
  const pageItem = (page: number) => (
    <PaginationItem key={page}>
      <PaginationLink
        isActive={currentPage === page}
        onClick={(e) => {
          e.preventDefault();
          goToPage(page);
        }}
        className={cn(
          currentPage === page
            ? "bg-gray-600 text-light border-none"
            : "bg-transparent text-light hover:bg-grey-200",
          "transition-colors w-8 h-8 cursor-pointer rounded-lg"
        )}
      >
        {page}
      </PaginationLink>
    </PaginationItem>
  );

  const ellipsisItem = (key: string) => (
    <PaginationItem key={key}>
      <PaginationEllipsis />
    </PaginationItem>
  );

  const renderPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => pageItem(i + 1));
    }

    if (currentPage <= 4) {
      return [
        ...[1, 2, 3, 4].map(pageItem),
        ellipsisItem("ellipsis-end"),
        pageItem(totalPages),
      ];
    }

    if (currentPage >= totalPages - 3) {
      return [
        pageItem(1),
        ellipsisItem("ellipsis-start"),
        ...[totalPages - 3, totalPages - 2, totalPages - 1, totalPages].map(
          pageItem
        ),
      ];
    }

    return [
      pageItem(1),
      ellipsisItem("ellipsis-mid"),
      ...[currentPage - 1, currentPage, currentPage + 1].map(pageItem),
      ellipsisItem("ellipsis-end"),
      pageItem(totalPages),
    ];
  };

  return (
    <Pagination className="mt-4 flex justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                goToPage(currentPage - 1);
              }
            }}
            aria-disabled={currentPage === 1}
            className={`${
              currentPage !== 1
                ? "cursor-pointer border border-grey-300"
                : "cursor-not-allowed opacity-50"
            }`}
          />
        </PaginationItem>
        {renderPageNumbers()}
        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                goToPage(currentPage + 1);
              }
            }}
            aria-disabled={currentPage === totalPages}
            className={`${
              currentPage !== totalPages
                ? "cursor-pointer border border-grey-300"
                : "cursor-not-allowed opacity-50"
            }`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

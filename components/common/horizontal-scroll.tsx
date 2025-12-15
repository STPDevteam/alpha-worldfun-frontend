"use client";

import { cn } from "@/libs/utils";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
  type ReactNode,
} from "react";

export interface HorizontalScrollRef {
  scrollLeft: () => void;
  scrollRight: () => void;
}

interface HorizontalScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  gap?: string;
  className?: string;
  showScrollbar?: boolean;
  itemWidth?: string;
  scrollAmount?: number;
  onScrollStateChange?: (state: { canScrollLeft: boolean; canScrollRight: boolean }) => void;
  contentPadding?: {
    left?: string;
    right?: string;
  };
}

function HorizontalScrollComponent<T>(
  {
    items,
    renderItem,
    gap = "1rem",
    className,
    showScrollbar = false,
    itemWidth,
    scrollAmount = 323, // 307px card + 16px gap
    onScrollStateChange,
    contentPadding,
  }: HorizontalScrollProps<T>,
  ref: React.Ref<HorizontalScrollRef>
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  const scrollBy = useCallback(
    (direction: "left" | "right") => {
      if (!scrollRef.current) return;
      const targetScroll =
        direction === "left"
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    },
    [scrollAmount]
  );

  // Expose scroll methods to parent via ref
  useImperativeHandle(ref, () => ({
    scrollLeft: () => scrollBy("left"),
    scrollRight: () => scrollBy("right"),
  }), [scrollBy]);

  useEffect(() => {
    checkScrollPosition();
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => checkScrollPosition();
    const handleResize = () => checkScrollPosition();

    scrollElement.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [checkScrollPosition, items]);

  // Notify parent of scroll state changes
  useEffect(() => {
    onScrollStateChange?.({ canScrollLeft, canScrollRight });
  }, [canScrollLeft, canScrollRight, onScrollStateChange]);

  return (
    <div className="relative">
      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className={cn(
          "overflow-x-auto overflow-y-hidden",
          !showScrollbar && "scrollbar-hide",
          className
        )}
      >
        <div
          className="flex"
          style={{
            gap,
            paddingLeft: contentPadding?.left,
            paddingRight: contentPadding?.right,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={itemWidth ? { width: itemWidth } : undefined}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export with forwardRef
export const HorizontalScroll = forwardRef(HorizontalScrollComponent) as <T>(
  props: HorizontalScrollProps<T> & { ref?: React.Ref<HorizontalScrollRef> }
) => ReturnType<typeof HorizontalScrollComponent>;

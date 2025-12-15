import React, {
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

type InlineClampProps = {
  text: string;
  maxLines?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
  className?: string;
};

export const InlineClamp: React.FC<InlineClampProps> = ({
  text,
  maxLines = 4,
  showMoreLabel = "Show more",
  showLessLabel = "Show less",
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState("");
  const [needsClamp, setNeedsClamp] = useState(false);

  const containerRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const clearClampStyle: React.CSSProperties = {
    display: "inline",
    overflow: "visible",
    maxHeight: "none",
    // preserve original source line breaks while still allowing wrapping
    whiteSpace: "pre-wrap",
    // allow words to break when needed
    wordBreak: "break-word",
    WebkitLineClamp: "unset" as React.CSSProperties["WebkitLineClamp"],
    WebkitBoxOrient: "unset" as React.CSSProperties["WebkitBoxOrient"],
  };

  const suffix = useMemo(() => `… ${showMoreLabel}`, [showMoreLabel]);

  const sliceAtWord = (s: string, idx: number) => {
    // clamp idx to string length
    const i = Math.min(idx, s.length);
    // prefer newline as a natural break
    const nl = s.lastIndexOf("\n", i);
    if (nl >= 0) return s.slice(0, nl);
    const cut = s.lastIndexOf(" ", i);
    return cut > 0 ? s.slice(0, cut) : s.slice(0, i);
  };

  const measure = useCallback(() => {
    const container = containerRef.current;
    const meas = measureRef.current;
    if (!container || !meas) return;

    const rect = container.getBoundingClientRect();
  const cs = getComputedStyle(container);
  meas.style.width = rect.width + "px";
  meas.style.font = cs.font;
  meas.style.lineHeight = cs.lineHeight;
  meas.style.letterSpacing = cs.letterSpacing;
  // ensure measurement element uses the same white-space handling so line breaks
  // from the source are respected (pre-wrap allows breaks but preserves \n)
  meas.style.whiteSpace = "pre-wrap";

    const lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3;
    const maxHeight = lineH * maxLines;

  // Use textContent so that newlines are measured correctly.
  meas.textContent = text;
    if (meas.scrollHeight <= maxHeight) {
      setNeedsClamp(false);
      setTruncated(text);
      return;
    }

    let lo = 0,
      hi = text.length,
      best = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const sub = sliceAtWord(text, mid);
      meas.textContent = sub + " " + suffix;
      if (meas.scrollHeight <= maxHeight) {
        best = sub.length;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    setTruncated(sliceAtWord(text, best));
    setNeedsClamp(true);
  }, [text, maxLines, suffix]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  if (!needsClamp) {
    return (
      <span ref={containerRef} className={className} style={clearClampStyle}>
        {text}
        <span
          ref={measureRef}
          aria-hidden
          style={{
            position: "fixed",
            visibility: "hidden",
            inset: "-9999px auto auto -9999px",
          }}
        />
      </span>
    );
  }

  if (expanded) {
    return (
      <span ref={containerRef} className={className} style={clearClampStyle}>
        <span style={clearClampStyle}>{text}</span>
        <span
          role="button"
          tabIndex={0}
          className="ml-2 underline-offset-2 text-[#0088FF] hover:underline cursor-pointer select-none"
          onClick={() => setExpanded(false)}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && setExpanded(false)
          }
        >
          {showLessLabel ?? "Show less"}
        </span>
        <span
          ref={measureRef}
          aria-hidden
          style={{
            position: "fixed",
            visibility: "hidden",
            inset: "-9999px auto auto -9999px",
          }}
        />
      </span>
    );
  }

  return (
    <span ref={containerRef} className={className} style={clearClampStyle}>
      <span>
        {truncated}
        <span aria-hidden>… </span>
      </span>
      <span
        role="button"
        tabIndex={0}
        className="underline-offset-2 text-[#0088FF] hover:underline cursor-pointer select-none"
        onClick={() => setExpanded(true)}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && setExpanded(true)
        }
      >
        {showMoreLabel}
      </span>
      <span
        ref={measureRef}
        aria-hidden
        style={{
          position: "fixed",
          visibility: "hidden",
          inset: "-9999px auto auto -9999px",
        }}
      />
    </span>
  );
};

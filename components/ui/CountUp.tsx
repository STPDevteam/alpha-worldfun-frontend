import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  decimals?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function CountUp({
  to,
  from,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  decimals,
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const requestedDown = direction === "down";
  const resolvedFrom =
    typeof from === "number"
      ? from
      : requestedDown
      ? to ?? 0
      : 0;

  const startValue = resolvedFrom;
  const endValue = to;

  const motionValue = useMotionValue(startValue);

  const damping = 60;
  const stiffness = 400;

  const springValue = useSpring(motionValue, {
    damping,
    stiffness,
    duration: duration * 1000,
  });

  const isInView = useInView(ref, { once: true, margin: "0px" });

  const getDecimalPlaces = (num: number): number => {
    if (!Number.isFinite(num)) {
      return 0;
    }
    const str = num.toString();
    if (str.includes(".")) {
      const decimalPart = str.split(".")[1];
      if (parseInt(decimalPart, 10) !== 0) {
        return decimalPart.length;
      }
    }
    return 0;
  };

  // Use provided decimals prop, or auto-detect from values
  const maxDecimals =
    decimals !== undefined
      ? decimals
      : Math.max(getDecimalPlaces(startValue), getDecimalPlaces(endValue));

  // Ensure the motion value always starts from the expected value
  useEffect(() => {
    motionValue.set(startValue);
  }, [motionValue, startValue]);

  // Kick off the animation once in view
  useEffect(() => {
    if (!isInView || !startWhen) {
      return;
    }

    if (typeof onStart === "function") {
      onStart();
    }

    const animationDelay = Math.max(0, delay) * 1000;

    const timeoutId = setTimeout(() => {
      motionValue.set(endValue);
    }, animationDelay);

    const durationTimeoutId = setTimeout(() => {
      if (typeof onEnd === "function") {
        onEnd();
      }
    }, animationDelay + duration * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(durationTimeoutId);
    };
  }, [
    isInView,
    startWhen,
    motionValue,
    endValue,
    delay,
    duration,
    onStart,
    onEnd,
    startValue,
  ]);

  useEffect(() => {
    const format = (num: number) => {
      const hasDecimals = maxDecimals > 0;
      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      };

      const formattedNumber = Intl.NumberFormat("en-US", options).format(
        num
      );

      return separator
        ? formattedNumber.replace(/,/g, separator)
        : formattedNumber;
    };

    if (ref.current) {
      ref.current.textContent = format(startValue);
    }

    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format(latest);
      }
    });

    return () => unsubscribe();
  }, [springValue, separator, maxDecimals, startValue, decimals]);

  return <span className={className} ref={ref} />;
}

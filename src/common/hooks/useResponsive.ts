import { LAYOUT_CONSTANTS } from "@/common/constants/layout";
import { useEffect, useState } from "react";
import useDebounce from "./useDebounce";

interface UseResponsiveReturn {
  /** Current window width */
  width: number;
  /** Is screen mobile size (<= 1272px) */
  isMobile: boolean;
  /** Is screen tablet size (<= 1280px) */
  isTablet: boolean;
}

/**
 * Custom hook for responsive design with debounced resize handling
 * Optimizes performance by debouncing resize events
 *
 * @param debounceDelay - Delay in milliseconds for debouncing (default: 100ms)
 * @returns Object with width, isMobile, and isTablet flags
 */
export function useResponsive(
  debounceDelay: number = 100
): UseResponsiveReturn {
  const [width, setWidth] = useState<number>(() => {
    // Initialize with current window width (SSR-safe)
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return LAYOUT_CONSTANTS.BREAKPOINTS.MOBILE + 1; // Default to desktop
  });

  // Update width on resize
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    // Initial call to ensure correct initial state
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Debounce the width value to reduce re-renders
  const debouncedWidth = useDebounce(width, debounceDelay);

  return {
    width: debouncedWidth,
    isMobile: debouncedWidth <= LAYOUT_CONSTANTS.BREAKPOINTS.MOBILE,
    isTablet: debouncedWidth <= LAYOUT_CONSTANTS.BREAKPOINTS.TABLET,
  };
}

/**
 * Layout constants for consistent breakpoints and dimensions
 */
export const LAYOUT_CONSTANTS = {
  BREAKPOINTS: {
    /** Mobile breakpoint - menu becomes drawer */
    MOBILE: 1272,
    /** Tablet breakpoint - alternative breakpoint for specific cases */
    TABLET: 1280,
  },
  DIMENSIONS: {
    /** Header height in pixels */
    HEADER_HEIGHT: 60,
    /** Menu/Sidebar width in pixels */
    MENU_WIDTH: 298,
    // Header Breadcrumb
    BREADCRUMN_HEIGHT: 48 + 1,
  },
  Z_INDEX: {
    /** Z-index for drawer overlay */
    DRAWER_OVERLAY: 50,
    /** Z-index for drawer content */
    DRAWER_CONTENT: 50,
  },
} as const;

/**
 * Type-safe breakpoint checker
 */
export type Breakpoint = keyof typeof LAYOUT_CONSTANTS.BREAKPOINTS;

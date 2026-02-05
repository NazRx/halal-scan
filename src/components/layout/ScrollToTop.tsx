import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global ScrollToTop component that scrolls to the top of the page
 * whenever the route changes.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

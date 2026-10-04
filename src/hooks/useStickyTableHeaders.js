import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook that automatically manages sticky table headers across all indicator tables.
 * - Ensures .MuiTableContainer-root has appropriate maxHeight and overflow: auto.
 * - Handles multi-row <thead> headers by calculating exact top offsets per row.
 * - Fixes z-index hierarchy so corner cells (sticky top + sticky left) stay above all headers and columns.
 * - Guarantees background colors are opaque so scrolled body rows never bleed through.
 */
export function useStickyTableHeaders() {
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    let rafId = null;

    const updateStickyHeaders = () => {
      if (!isMounted) return;

      const containers = document.querySelectorAll(".MuiTableContainer-root");
      containers.forEach((container) => {
        // Ensure container scrolls vertically within the viewport
        if (!container.style.maxHeight) {
          container.style.maxHeight = "calc(100vh - 210px)";
        }
        if (container.style.overflow !== "auto") {
          container.style.overflow = "auto";
        }

        const table = container.querySelector("table");
        if (!table) return;

        // Ensure clean borders without flickering
        table.style.borderCollapse = "separate";
        table.style.borderSpacing = "0";

        const thead = table.querySelector("thead");
        if (!thead) return;

        const rows = thead.querySelectorAll("tr");
        if (rows.length === 0) return;

        // Calculate top offset for each row in thead
        const rowOffsets = [];
        let accumulatedTop = 0;

        rows.forEach((tr) => {
          rowOffsets.push(accumulatedTop);

          // Find the height of this row:
          // Look for any cell that doesn't span multiple rows (rowspan is 1 or unset)
          const normalCell = Array.from(tr.children).find(
            (c) => !c.getAttribute("rowspan") || c.getAttribute("rowspan") === "1"
          );
          const rHeight =
            normalCell && normalCell.offsetHeight > 0
              ? normalCell.offsetHeight
              : tr.offsetHeight || 0;

          accumulatedTop += rHeight;
        });

        // Apply sticky styling to each cell in thead
        rows.forEach((tr, rIndex) => {
          const cells = tr.querySelectorAll("th, td");
          cells.forEach((cell) => {
            cell.style.position = "sticky";

            // If the cell spans multiple rows starting from row 0, it sticks to top: 0
            cell.style.top = `${rowOffsets[rIndex]}px`;

            // Check if cell is sticky to the left (corner cell)
            const inlineLeft = cell.style.left;
            const computedLeft = window.getComputedStyle(cell).left;
            const isStickyLeft =
              inlineLeft !== "" ||
              (computedLeft !== "auto" && computedLeft !== "") ||
              cell.getAttribute("data-sticky-left") === "true";

            if (isStickyLeft) {
              cell.style.zIndex = "35";
              if (!cell.style.left) {
                cell.style.left = computedLeft !== "auto" ? computedLeft : "0px";
              }
            } else {
              cell.style.zIndex = String(20 - rIndex);
            }

            // Ensure cell has an opaque background so scrolling content doesn't bleed through
            const computedBg = window.getComputedStyle(cell).backgroundColor;
            if (
              !computedBg ||
              computedBg === "transparent" ||
              computedBg === "rgba(0, 0, 0, 0)"
            ) {
              cell.style.backgroundColor = "#ffffff";
            }
          });
        });

        // Ensure body sticky-left cells have proper z-index and opaque background
        const tbody = table.querySelector("tbody");
        if (tbody) {
          const bodyStickyCells = tbody.querySelectorAll(
            'td[style*="left"], th[style*="left"]'
          );
          bodyStickyCells.forEach((cell) => {
            cell.style.zIndex = "5";
            const computedBg = window.getComputedStyle(cell).backgroundColor;
            if (
              !computedBg ||
              computedBg === "transparent" ||
              computedBg === "rgba(0, 0, 0, 0)"
            ) {
              cell.style.backgroundColor = "#ffffff";
            }
          });
        }
      });
    };

    const debouncedUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateStickyHeaders();
      });
    };

    // Run immediately and after paint passes
    debouncedUpdate();
    const t1 = setTimeout(debouncedUpdate, 50);
    const t2 = setTimeout(debouncedUpdate, 200);
    const t3 = setTimeout(debouncedUpdate, 600);

    // MutationObserver to catch tab changes, school switches, and async data loads
    const observer = new MutationObserver(() => {
      debouncedUpdate();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Window resize handler
    window.addEventListener("resize", debouncedUpdate);

    return () => {
      isMounted = false;
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
      window.removeEventListener("resize", debouncedUpdate);
    };
  }, [location.pathname, location.search]);
}

export default useStickyTableHeaders;

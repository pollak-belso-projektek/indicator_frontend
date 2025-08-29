import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectUserTableAccess,
  selectUserPermissions,
} from "../store/slices/authSlice";

const STORAGE_KEY = "hszc_recent_pages";
const MAX_RECENT_PAGES = 5;

// Find page info from navigation categories
const findPageInfo = (pathname, navigationCategories) => {
  for (const [categoryKey, category] of Object.entries(navigationCategories)) {
    const foundItem = category.items.find((item) => item.link === pathname);
    if (foundItem) {
      return {
        name: foundItem.name,
        icon: foundItem.icon,
        link: foundItem.link,
        category: category.name,
        categoryIcon: category.icon,
        tableName: foundItem.tableName,
        timestamp: Date.now(),
      };
    }
  }
  return null;
};

// Check if user has access to a specific page
const hasPageAccess = (pageInfo, tableAccess, userPermissions) => {
  // Superadmin bypasses all permission checks
  if (userPermissions?.isSuperadmin) {
    return true;
  }

  // Always allow dashboard
  if (pageInfo.link === "/dashboard") {
    return true;
  }

  if (!tableAccess || !Array.isArray(tableAccess) || tableAccess.length === 0) {
    return false;
  }

  const accessibleTableNames = tableAccess.map((access) => access.tableName);

  // For items without tableName, apply special rules
  if (pageInfo.tableName === null) {
    // Data import - check if user has admin permissions or access to any data tables
    if (pageInfo.link === "/adat-import") {
      return (
        userPermissions?.isAdmin ||
        userPermissions?.isSuperadmin ||
        accessibleTableNames.some((name) =>
          [
            "alapadatok",
            "tanulo_letszam",
            "kompetencia",
            "tanugyi_adatok",
          ].includes(name)
        )
      );
    }

    // Table management - only for superadmins
    if (pageInfo.link === "/table-management") {
      return userPermissions?.isSuperadmin;
    }

    // Alapadatok - only if user has alapadatok table access
    if (pageInfo.link === "/alapadatok") {
      return accessibleTableNames.includes("alapadatok");
    }

    // Schools - only if user has alapadatok table access
    if (pageInfo.link === "/schools") {
      return accessibleTableNames.includes("alapadatok");
    }

    return false;
  }

  // Special case for logs - only superadmins can access
  if (pageInfo.tableName === "log") {
    return userPermissions?.isSuperadmin;
  }

  // Special case for users - only superadmins can access
  if (pageInfo.tableName === "user") {
    return userPermissions?.isSuperadmin;
  }

  // Show items that the user has table access to
  return accessibleTableNames.includes(pageInfo.tableName);
};

export const useRecentPages = (navigationCategories) => {
  const location = useLocation();
  const [recentPages, setRecentPages] = useState([]);
  const tableAccess = useSelector(selectUserTableAccess);
  const userPermissions = useSelector(selectUserPermissions);

  // Load recent pages from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out pages older than 7 days
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        let validPages = parsed.filter((page) => page.timestamp > weekAgo);

        // Also filter out pages user no longer has access to
        if (tableAccess && userPermissions) {
          validPages = validPages.filter((page) =>
            hasPageAccess(page, tableAccess, userPermissions)
          );
        }

        setRecentPages(validPages);

        // Update localStorage if we filtered out old or inaccessible pages
        if (validPages.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validPages));
        }
      }
    } catch (error) {
      console.error("Error loading recent pages:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [tableAccess, userPermissions]);

  // Track page visits
  useEffect(() => {
    // Skip dashboard and login pages
    if (
      location.pathname === "/" ||
      location.pathname === "/dashboard" ||
      location.pathname === "/login" ||
      !navigationCategories
    ) {
      return;
    }

    const pageInfo = findPageInfo(location.pathname, navigationCategories);

    if (pageInfo && hasPageAccess(pageInfo, tableAccess, userPermissions)) {
      setRecentPages((prevPages) => {
        // Remove if already exists (to move it to front)
        const filtered = prevPages.filter(
          (page) => page.link !== pageInfo.link
        );

        // Add to front
        const newPages = [pageInfo, ...filtered].slice(0, MAX_RECENT_PAGES);

        // Save to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPages));
        } catch (error) {
          console.error("Error saving recent pages:", error);
        }

        return newPages;
      });
    }
  }, [location.pathname, navigationCategories, tableAccess, userPermissions]);

  // Clear recent pages
  const clearRecentPages = () => {
    setRecentPages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Remove specific page
  const removeRecentPage = (linkToRemove) => {
    setRecentPages((prevPages) => {
      const filtered = prevPages.filter((page) => page.link !== linkToRemove);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    });
  };

  return {
    recentPages,
    clearRecentPages,
    removeRecentPage,
  };
};

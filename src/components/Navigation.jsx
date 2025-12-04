import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  Text,
  Menu,
  Drawer,
  Image,
} from "@chakra-ui/react";
import {
  MdPerson,
  MdMenu,
  MdHome,
  MdStar,
  MdBookmark,
  MdUpload,
  MdSettings,
  MdGroup,
  MdBook,
  MdSchool,
  MdAssessment,
  MdEvent,
  MdTrendingUp,
  MdGavel,
  MdWork,
  MdClose,
  MdSearch,
  MdInfo,
  MdAccessible,
} from "react-icons/md";

import { useColorModeValue } from "./ui/color-mode";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation, indicatorApi } from "../store/api/apiSlice";
import {
  logout,
  selectUser,
  selectUserRole,
  selectUserPermissions,
  selectUserTableAccess,
} from "../store/slices/authSlice";
import { FiChevronDown } from "react-icons/fi";
import UserRoleBadge from "./UserRoleBadge";
import SchoolSelector from "./SchoolSelector";
import { toaster } from "./ui/toaster";
import {
  TextField,
  InputAdornment,
  IconButton as MuiIconButton,
  Tooltip,
} from "@mui/material";
import { useRecentPages } from "../hooks/useRecentPages";
import AliasModeBanner from "./AliasModeBanner";

// Page numbering map based on the user's requirements
const PageNumbering = {
  "/tanulo_letszam": 1,
  "/felvettek_szama": 2,
  "/oktato_per_diak": 3,
  "/szakkepzesi-munkaszerződes-arany": 4, // Note: This page doesn't exist yet in navigation
  "/felnottkepzes": 5,
  "/kompetencia": 6,
  "/nszfh-meresek": 7,
  "/szakmai-eredmenyek": 8, // Versenyek
  "/elhelyezkedesi-mutato": 9,
  "/vegzettek-elegedettsege": 10,
  "/vizsgaeredmenyek": 11,
  "/szakmai-vizsga": 12, // Note: This page doesn't exist yet in navigation
  "/intezmenyi-elismeresek": 13,
  "/szakmai-bemutatok-konferenciak": 14, // Rendezvények
  "/lemorzsolodas": 15, // Note: This page doesn't exist yet in navigation
  "/elegedettseg-meres-eredmenyei": 16,
  "/intezmenyi-nevelesi-mutatok": 17,
  "/hatranyos-helyezu-tanulok-aranya": 18, // HH és HHH tanulók
  "/sajatos-nevelesi-igenyu-tanulok-aranya": 19,
  "/dobbanto-program-aranya": 20,
  "/muhelyiskolai-reszszakmat": 21,
  "/szakmai-tovabbkepzesek": 22, // Note: This page doesn't exist yet in navigation
  "/oktato-egyeb-tev": 23,
  "/palyazatok": 24, // Note: This page doesn't exist yet in navigation
  "/tanulmani-eredmeny": 25, // Note: This page doesn't exist yet in navigation
  "/hianyzas": 26, // Note: This page doesn't exist yet in navigation
  "/egy-oktatora-juto-ossz-diak": 27,
  "/nyelvvizsgak-szama": 28, // Note: This page doesn't exist yet in navigation
  "/projektek": 29, // Note: This page doesn't exist yet in navigation
  "/dualis-kepzohelyek-szama": 30, // Note: This page doesn't exist yet in navigation
  "/palyaorientacio": 31, // Note: This page doesn't exist yet in navigation
  "/egyuttmukudesek-szama": 32, // Note: This page doesn't exist yet in navigation
  "/szervezetfejlesztes": 33, // Note: This page doesn't exist yet in navigation
  "/innovacios-tevekenysegek": 34, // Note: This page doesn't exist yet in navigation
  "/digitalis-kompetencia": 35, // Note: This page doesn't exist yet in navigation
  "/szakkepzes-zolditese": 36, // Note: This page doesn't exist yet in navigation
};

// Function to get the page number for a given link
const getPageNumber = (link) => {
  return PageNumbering[link] || null;
};

// Function to get the display name with page number prefix
const getDisplayName = (item) => {
  const pageNumber = getPageNumber(item.link);
  return pageNumber ? `${pageNumber}. ${item.name}` : item.name;
};

// Organized navigation items with categories
const NavigationCategories = {
  GENERAL: {
    name: "Általános",
    icon: MdHome,
    items: [
      { name: "Főoldal", icon: MdHome, link: "/dashboard", tableName: null },
      {
        name: "Alapadatok",
        icon: MdSettings,
        link: "/alapadatok",
        tableName: null,
      },
      {
        name: "Iskolák",
        icon: MdSchool,
        link: "/schools",
        tableName: "alapadatok",
      },
    ],
  },
  STUDENTS: {
    name: "Tanulói adatok",
    icon: MdGroup,
    items: [
      {
        name: "Tanulólétszám",
        icon: MdGroup,
        link: "/tanulo_letszam",
        tableName: "tanulo_letszam",
      },
      {
        name: "Felvettek száma",
        icon: MdGroup,
        link: "/felvettek_szama",
        tableName: "felvettek_szama",
      },
      {
        name: "Sajátos nevelésű (SNI)",
        icon: MdAccessible,
        link: "/sajatos-nevelesi-igenyu-tanulok-aranya",
        tableName: "sajatos_nevelesu_tanulok",
      },
      {
        name: "HH tanulók aránya",
        icon: MdAccessible,
        link: "/hatranyos-helyezu-tanulok-aranya",
        tableName: "hh_es_hhh_nevelesu_tanulok",
      },
    ],
  },
  EDUCATION: {
    name: "Oktatási eredmények",
    icon: MdAssessment,
    items: [
      {
        name: "Kompetencia",
        icon: MdBook,
        link: "/kompetencia",
        tableName: "kompetencia",
      },
      {
        name: "Országos kompetenciamérés",
        icon: MdAssessment,
        link: "/orszagos-kompetenciameres",
        tableName: "kompetencia",
      },
      {
        name: "NSZFH mérések",
        icon: MdAssessment,
        link: "/nszfh-meresek",
        tableName: "nszfh",
      },
      {
        name: "Vizsgaeredmények",
        icon: MdAssessment,
        link: "/vizsgaeredmenyek",
        tableName: "vizsgaeredmenyek",
      },
      {
        name: "Elégedettség mérés",
        icon: MdAssessment,
        link: "/elegedettseg-meres-eredmenyei",
        tableName: "elegedettseg_meres",
      },
    ],
  },
  ACHIEVEMENTS: {
    name: "Eredmények és elismerések",
    icon: MdStar,
    items: [
      {
        name: "Versenyek",
        icon: MdStar,
        link: "/szakmai-eredmenyek",
        tableName: "versenyek",
      },
      {
        name: "Intézményi elismerések",
        icon: MdStar,
        link: "/intezmenyi-elismeresek",
        tableName: "intezmenyi_neveltseg",
      },
    ],
  },
  CAREER: {
    name: "Pályakövetés",
    icon: MdWork,
    items: [
      {
        name: "Elhelyezkedési mutató",
        icon: MdAssessment,
        link: "/elhelyezkedesi-mutato",
        tableName: "elhelyezkedes",
      },
      {
        name: "Végzettek elégedettsége",
        icon: MdStar,
        link: "/vegzettek-elegedettsege",
        tableName: "elegedettseg",
      },
      {
        name: "Szakképzési munkaszerződés",
        icon: MdWork,
        link: "/szakkepzesi-munkaszerződes-arany",
        tableName: "szmsz",
      },
    ],
  },
  PROGRAMS: {
    name: "Speciális programok",
    icon: MdTrendingUp,
    items: [
      {
        name: "Felnőttképzés",
        icon: MdBook,
        link: "/felnottkepzes",
        tableName: "alkalmazottak_munkaugy",
      },
      {
        name: "Műhelyiskola",
        icon: MdSchool,
        link: "/muhelyiskolai-reszszakmat",
        tableName: "muhelyiskola",
      },
      {
        name: "Dobbantó program",
        icon: MdTrendingUp,
        link: "/dobbanto-program-aranya",
        tableName: "dobbanto",
      },
      {
        name: "Intézményi nevelési mutatók",
        icon: MdGavel,
        link: "/intezmenyi-nevelesi-mutatok",
        tableName: "intezmenyi_neveltseg",
      },
    ],
  },
  EVENTS: {
    name: "Események és aktivitás",
    icon: MdEvent,
    items: [
      {
        name: "Egy oktatóra jutó diákok",
        icon: MdBookmark,
        link: "/oktato_per_diak",
        tableName: "egy_oktatora_juto_tanulo",
      },
      {
        name: "Egy oktatóra jutó össz diák",
        icon: MdBookmark,
        link: "/egy-oktatora-juto-ossz-diak",
        tableName: "egy_oktatora_juto_tanulo",
      },
      {
        name: "Oktatók egyéb tev.",
        icon: MdWork,
        link: "/oktato-egyeb-tev",
        tableName: "oktato-egyeb-tev",
      },
    ],
  },
  ADMIN: {
    name: "Adminisztráció",
    icon: MdSettings,
    items: [
      {
        name: "Adatok importálása",
        icon: MdUpload,
        link: "/adat-import",
        tableName: null,
      },
      {
        name: "Felhasználók",
        icon: MdPerson,
        link: "/users",
        tableName: "user",
      },
      {
        name: "Tábla kezelés",
        icon: MdSettings,
        link: "/table-management",
        tableName: null,
      },
      {
        name: "Rendszer naplók",
        icon: MdBookmark,
        link: "/logs",
        tableName: "log",
      },
    ],
  },
};

// Flatten all items for backwards compatibility
const AllLinkItems = Object.values(NavigationCategories).reduce(
  (acc, category) => {
    return [...acc, ...category.items];
  },
  []
);

// Function to filter navigation items based on user's table access
const getAccessibleNavItems = (tableAccess, userPermissions) => {
  // Superadmin bypasses all permission checks and gets all items
  if (userPermissions?.isSuperadmin) {
    return AllLinkItems;
  }

  if (!tableAccess || !Array.isArray(tableAccess) || tableAccess.length === 0) {
    // If no table access info, only show dashboard
    return AllLinkItems.filter((item) => item.link === "/dashboard");
  }

  const accessibleTableNames = tableAccess.map((access) => access.tableName);

  return AllLinkItems.filter((item) => {
    // Always show dashboard
    if (item.link === "/dashboard") {
      return true;
    }

    // For items without tableName, apply special rules
    if (item.tableName === null) {
      // Data import - check if user has admin permissions or access to any data tables
      if (item.link === "/adat-import") {
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
      if (item.link === "/table-management") {
        return userPermissions?.isSuperadmin;
      }

      // Alapadatok - only if user has alapadatok table access
      if (item.link === "/alapadatok") {
        return accessibleTableNames.includes("alapadatok");
      }

      // Schools - only if user has alapadatok table access
      if (item.link === "/schools") {
        return accessibleTableNames.includes("alapadatok");
      }

      // For other items without tableName, don't show them unless explicitly handled above
      return false;
    }

    // Special case for logs - only superadmins can access
    if (item.tableName === "log") {
      return userPermissions?.isSuperadmin;
    }

    // Special case for users - check both superadmin and table access
    if (item.tableName === "user") {
      return (
        userPermissions?.isSuperadmin || accessibleTableNames.includes("user")
      );
    }

    // Show items that the user has table access to
    return accessibleTableNames.includes(item.tableName);
  });
};

// Function to organize accessible items by categories
const getOrganizedAccessibleItems = (tableAccess, userPermissions) => {
  const accessibleItems = getAccessibleNavItems(tableAccess, userPermissions);
  const organizedCategories = {};

  // Group accessible items by category
  Object.entries(NavigationCategories).forEach(([categoryKey, category]) => {
    const categoryItems = category.items.filter((item) =>
      accessibleItems.some((accessible) => accessible.link === item.link)
    );

    if (categoryItems.length > 0) {
      // Sort category items by page number
      const sortedCategoryItems = categoryItems.sort((a, b) => {
        const aNumber = getPageNumber(a.link);
        const bNumber = getPageNumber(b.link);

        // Items with page numbers come first, sorted numerically
        if (aNumber && bNumber) return aNumber - bNumber;
        if (aNumber && !bNumber) return -1;
        if (!aNumber && bNumber) return 1;

        // If neither has a page number, sort alphabetically
        return a.name.localeCompare(b.name);
      });

      organizedCategories[categoryKey] = {
        ...category,
        items: sortedCategoryItems,
      };
    }
  });

  return organizedCategories;
};

const SidebarContent = ({ onClose, ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [itemSearch, setItemSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({
    GENERAL: true, // Keep general expanded by default
    FIXED_GENERAL: true, // Keep fixed general expanded by default
  });

  const tableAccess = useSelector(selectUserTableAccess);
  const userPermissions = useSelector(selectUserPermissions);

  // Add keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only trigger shortcuts when not in an input field
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="Keresés"]'
        );
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Escape to clear search or close mobile menu
      if (event.key === "Escape") {
        if (itemSearch) {
          setItemSearch("");
        } else if (onClose) {
          onClose();
        }
      }

      // Ctrl/Cmd + H to go to dashboard
      if ((event.ctrlKey || event.metaKey) && event.key === "h") {
        event.preventDefault();
        navigate("/dashboard");
        if (onClose) onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [itemSearch, navigate, onClose]);

  // Get navigation items that the user has access to
  const accessibleNavItems = getAccessibleNavItems(
    tableAccess,
    userPermissions
  );

  // Initialize recent pages hook
  const { recentPages, clearRecentPages, removeRecentPage } =
    useRecentPages(NavigationCategories);

  // Separate fixed items (first 5) and scrollable items - memoized to prevent infinite re-renders
  const fixedItems = useMemo(() => {
    const items = accessibleNavItems.filter(
      (item) =>
        item.link === "/dashboard" ||
        item.link === "/alapadatok" ||
        item.link === "/adat-import" ||
        item.link === "/schools" ||
        item.link === "/users" ||
        item.link === "/logs"
    );

    // Sort fixed items by page number
    return items.sort((a, b) => {
      const aNumber = getPageNumber(a.link);
      const bNumber = getPageNumber(b.link);

      // Items with page numbers come first, sorted numerically
      if (aNumber && bNumber) return aNumber - bNumber;
      if (aNumber && !bNumber) return -1;
      if (!aNumber && bNumber) return 1;

      // If neither has a page number, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [accessibleNavItems]);

  // Get organized categories
  const organizedCategories = getOrganizedAccessibleItems(
    tableAccess,
    userPermissions
  );

  // Find which category contains the current active page and expand it
  useEffect(() => {
    const currentPath = location.pathname;
    let activeCategoryKey = null;

    // Check if current path is in fixed items
    const isInFixedItems = fixedItems.some((item) => item.link === currentPath);
    if (isInFixedItems) {
      setExpandedCategories((prev) => ({
        ...prev,
        FIXED_GENERAL: true,
      }));
      return;
    }

    // Find the category that contains the current path
    Object.entries(NavigationCategories).forEach(([categoryKey, category]) => {
      const hasActiveItem = category.items.some(
        (item) => item.link === currentPath
      );
      if (hasActiveItem) {
        activeCategoryKey = categoryKey;
      }
    });

    // If we found an active category, expand it
    if (activeCategoryKey) {
      setExpandedCategories((prev) => ({
        ...prev,
        [activeCategoryKey]: true,
      }));
    }
  }, [location.pathname]); // Removed fixedItems from dependency array

  // Helper function to check if a category contains the active page
  const isCategoryActive = (categoryKey) => {
    const category = NavigationCategories[categoryKey];
    if (!category) return false;
    return category.items.some((item) => item.link === location.pathname);
  };

  // Helper function to check if fixed general category is active
  const isFixedGeneralActive = () => {
    return fixedItems.some((item) => item.link === location.pathname);
  };

  const scrollableItems = useMemo(() => {
    const items = accessibleNavItems.filter(
      (item) =>
        item.link !== "/dashboard" &&
        item.link !== "/alapadatok" &&
        item.link !== "/adat-import" &&
        item.link !== "/schools" &&
        item.link !== "/users" &&
        item.link !== "/logs"
    );

    // Sort scrollable items by page number
    return items.sort((a, b) => {
      const aNumber = getPageNumber(a.link);
      const bNumber = getPageNumber(b.link);

      // Items with page numbers come first, sorted numerically
      if (aNumber && bNumber) return aNumber - bNumber;
      if (aNumber && !bNumber) return -1;
      if (!aNumber && bNumber) return 1;

      // If neither has a page number, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [accessibleNavItems]);

  // Filter scrollable items based on search (search by name or page number)
  const filteredScrollableItems = scrollableItems.filter((item) => {
    const pageNumber = getPageNumber(item.link);
    const searchValue = itemSearch.trim();

    if (!searchValue) return true;

    // Search by name
    if (item.name.toLowerCase().includes(searchValue.toLowerCase())) {
      return true;
    }

    // Search by page number - handle both "11" and "11." formats
    if (pageNumber) {
      const pageNumberStr = pageNumber.toString();
      const searchClean = searchValue.replace(/\.$/, ""); // Remove trailing dot

      // Check if search matches the number (with or without dot)
      if (
        pageNumberStr === searchClean ||
        pageNumberStr.includes(searchClean)
      ) {
        return true;
      }

      // Also check if search with dot matches the formatted display name
      if (
        searchValue.includes(".") &&
        getDisplayName(item).toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return true;
      }
    }

    return false;
  });

  // Filter categories based on search (search by name or page number)
  const filteredCategories = Object.entries(organizedCategories).reduce(
    (acc, [key, category]) => {
      // Skip the GENERAL category since its items are already shown in the fixed section
      if (key === "GENERAL") {
        return acc;
      }

      const filteredItems = category.items.filter((item) => {
        const pageNumber = getPageNumber(item.link);
        const searchValue = itemSearch.trim();

        if (!searchValue) return true;

        // Exclude fixed items
        if (fixedItems.some((fixed) => fixed.link === item.link)) {
          return false;
        }

        // Search by name
        if (item.name.toLowerCase().includes(searchValue.toLowerCase())) {
          return true;
        }

        // Search by page number - handle both "11" and "11." formats
        if (pageNumber) {
          const pageNumberStr = pageNumber.toString();
          const searchClean = searchValue.replace(/\.$/, ""); // Remove trailing dot

          // Check if search matches the number (with or without dot)
          if (
            pageNumberStr === searchClean ||
            pageNumberStr.includes(searchClean)
          ) {
            return true;
          }

          // Also check if search with dot matches the formatted display name
          if (
            searchValue.includes(".") &&
            getDisplayName(item)
              .toLowerCase()
              .includes(searchValue.toLowerCase())
          ) {
            return true;
          }
        }

        return false;
      });

      if (filteredItems.length > 0) {
        acc[key] = { ...category, items: filteredItems };
      }
      return acc;
    },
    {}
  );

  const toggleCategory = (categoryKey) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  return (
    <Box
      transition="all 0.3s ease-in-out"
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 64 }}
      pos="fixed"
      h="100vh"
      bg={useColorModeValue("white", "gray.50")}
      boxShadow={useColorModeValue("lg", "2xl")}
      zIndex={1000}
      {...rest}
    >
      {/* Header */}
      <Box
        bg={useColorModeValue("white", "gray.50")}
        borderBottom="1px"
        borderColor={useColorModeValue("gray.100", "gray.200")}
      >
        <Flex h="20" alignItems="center" mx="6" justifyContent="space-between">
          <Link to="/dashboard" onClick={onClose}>
            <Image
              src="https://cms.hodmezovasarhelyi.szc.edir.hu/uploads/HSZC_logo_color_tomb_k_4b19d45dc7.png"
              alt="HSZC Logo"
              maxW="140px"
              h="auto"
              objectFit="contain"
              transition="all 0.2s ease-in-out"
              _hover={{ transform: "scale(1.02)" }}
            />
          </Link>
          <CloseButton
            display={{ base: "flex", md: "none" }}
            onClick={onClose}
            size="lg"
            color="gray.500"
            _hover={{ color: "gray.700", bg: "gray.100" }}
            borderRadius="md"
          />
        </Flex>

        {/* Search */}
        <Box mx="4" my="4">
          <TextField
            placeholder="Keresés név vagy szám alapján... (Ctrl+K)"
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                transition: "all 0.2s ease-in-out",
                backgroundColor: "rgba(0,0,0,0.02)",
                "&:hover": {
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  backgroundColor: "rgba(0,0,0,0.03)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 2px 12px rgba(66, 153, 225, 0.3)",
                  backgroundColor: "white",
                },
              },
              "& .MuiOutlinedInput-input": {
                fontSize: "14px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch
                    style={{ color: itemSearch ? "#4299E1" : "#9CA3AF" }}
                  />
                </InputAdornment>
              ),
              endAdornment:
                itemSearch !== "" ? (
                  <InputAdornment position="end">
                    <MuiIconButton
                      aria-label="Keresés törlése"
                      onClick={() => {
                        setItemSearch("");
                        // Refocus the search input after clearing
                        setTimeout(() => {
                          const searchInput = document.querySelector(
                            'input[placeholder*="Keresés"]'
                          );
                          if (searchInput) searchInput.focus();
                        }, 100);
                      }}
                      edge="end"
                      size="small"
                      sx={{
                        color: "gray.500",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          color: "red.500",
                          bg: "red.50",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <MdClose />
                    </MuiIconButton>
                  </InputAdornment>
                ) : null,
            }}
          />
          {/* Search Results Count */}
          {itemSearch && (
            <Text fontSize="xs" color="gray.500" mt="2" ml="1">
              {Object.keys(filteredCategories).length === 0 &&
              filteredScrollableItems.length === 0
                ? "Nincs találat"
                : `${filteredScrollableItems.length} találat`}
            </Text>
          )}
        </Box>

        {/* Recent Pages Section 
        <RecentPages
          recentPages={recentPages}
          onRemovePage={removeRecentPage}
          onClearAll={clearRecentPages}
          onClose={onClose}
        />
*/}
        {/* Fixed Navigation Items - Collapsible */}
        <Box mb="2">
          {/* Fixed Category Header */}
          <Flex
            align="center"
            p="3"
            mx="4"
            borderRadius="xl"
            cursor="pointer"
            role="button"
            tabIndex={0}
            transition="all 0.2s ease-in-out"
            bg={
              isFixedGeneralActive()
                ? "blue.50"
                : useColorModeValue("gray.50", "gray.100")
            }
            _hover={{
              bg: isFixedGeneralActive()
                ? "blue.100"
                : useColorModeValue("gray.100", "gray.200"),
              transform: "translateY(-1px)",
              boxShadow: "sm",
            }}
            _focus={{
              boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)",
              outline: "none",
            }}
            onClick={() => toggleCategory("FIXED_GENERAL")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleCategory("FIXED_GENERAL");
              }
            }}
            aria-expanded={expandedCategories["FIXED_GENERAL"]}
            aria-label="Toggle general navigation section"
          >
            <Icon
              as={MdHome}
              mr="3"
              fontSize="18"
              color={isFixedGeneralActive() ? "blue.600" : "gray.600"}
            />
            <Text
              fontSize="sm"
              fontWeight={isFixedGeneralActive() ? "bold" : "semibold"}
              flex="1"
              color={isFixedGeneralActive() ? "blue.700" : "gray.700"}
            >
              Általános
            </Text>
            <Icon
              as={FiChevronDown}
              fontSize="14"
              transform={
                expandedCategories["FIXED_GENERAL"]
                  ? "rotate(0deg)"
                  : "rotate(-90deg)"
              }
              transition="transform 0.2s ease-in-out"
              color={isFixedGeneralActive() ? "blue.600" : "gray.500"}
            />
          </Flex>

          {/* Fixed Category Items */}
          {expandedCategories["FIXED_GENERAL"] && (
            <Box
              overflow="hidden"
              transition="all 0.3s ease-in-out"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <VStack align="stretch" spacing="1" mt="2">
                {fixedItems.map((link, index) => (
                  <Box
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavItem
                      icon={link.icon}
                      as={Link}
                      to={link.link}
                      link={link.link}
                      onClick={() => onClose()}
                      p="3"
                      pl="6"
                      fontSize="sm"
                    >
                      {getDisplayName(link)}
                    </NavItem>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </Box>

        {/* Separator if there are scrollable items */}
        {filteredScrollableItems.length > 0 && (
          <Box mx="4" my="2">
            <Box
              height="1px"
              bg={useColorModeValue("gray.200", "gray.600")}
              width="100%"
            />
          </Box>
        )}
      </Box>

      {/* Scrollable Navigation Items - Organized by Categories */}
      <Box
        flex="1"
        overflowY="auto"
        overflowX="hidden"
        maxHeight={
          expandedCategories["FIXED_GENERAL"]
            ? "calc(100% - 535px)"
            : "calc(100% - 210px)"
        }
        sx={{
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "20px",
            "&:hover": {
              background: "rgba(0,0,0,0.3)",
            },
          },
        }}
        pb="4"
      >
        {/* Show categorized navigation */}
        {!itemSearch
          ? // When not searching, show categories
            Object.entries(filteredCategories).map(
              ([categoryKey, category]) => (
                <Box key={categoryKey} mb="2">
                  {/* Category Header */}
                  <Flex
                    align="center"
                    p="3"
                    mx="4"
                    borderRadius="xl"
                    cursor="pointer"
                    role="button"
                    tabIndex={0}
                    transition="all 0.2s ease-in-out"
                    bg={
                      isCategoryActive(categoryKey)
                        ? "blue.50"
                        : useColorModeValue("gray.50", "gray.100")
                    }
                    _hover={{
                      bg: isCategoryActive(categoryKey)
                        ? "blue.100"
                        : useColorModeValue("gray.100", "gray.200"),
                      transform: "translateY(-1px)",
                      boxShadow: "sm",
                    }}
                    _focus={{
                      boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)",
                      outline: "none",
                    }}
                    onClick={() => toggleCategory(categoryKey)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleCategory(categoryKey);
                      }
                    }}
                    aria-expanded={expandedCategories[categoryKey]}
                    aria-label={`Toggle ${category.name} section`}
                  >
                    <Icon
                      as={category.icon}
                      mr="3"
                      fontSize="18"
                      color={
                        isCategoryActive(categoryKey) ? "blue.600" : "gray.600"
                      }
                    />
                    <Text
                      fontSize="sm"
                      fontWeight={
                        isCategoryActive(categoryKey) ? "bold" : "semibold"
                      }
                      flex="1"
                      color={
                        isCategoryActive(categoryKey) ? "blue.700" : "gray.700"
                      }
                    >
                      {category.name}
                    </Text>
                    <Icon
                      as={FiChevronDown}
                      fontSize="14"
                      transform={
                        expandedCategories[categoryKey]
                          ? "rotate(180deg)"
                          : "rotate(0deg)"
                      }
                      transition="transform 0.2s ease-in-out"
                      color={
                        isCategoryActive(categoryKey) ? "blue.600" : "gray.500"
                      }
                    />
                  </Flex>

                  {/* Category Items */}
                  {expandedCategories[categoryKey] && (
                    <Box
                      overflow="hidden"
                      transition="all 0.3s ease-in-out"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <VStack align="stretch" spacing="1" mt="2">
                        {category.items.map((link, index) => (
                          <Box
                            key={link.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <NavItem
                              icon={link.icon}
                              as={Link}
                              to={link.link}
                              link={link.link}
                              onClick={() => onClose()}
                              fontSize="sm"
                              p="3"
                              pl="6"
                            >
                              {getDisplayName(link)}
                            </NavItem>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </Box>
              )
            )
          : // When searching, show flat list
            filteredScrollableItems
              .sort((a, b) => {
                const searchValue = itemSearch.trim();
                const searchClean = searchValue.replace(/\.$/, ""); // Remove trailing dot

                // If searching by number, prioritize exact number matches and sort numerically
                if (searchClean && !isNaN(searchClean)) {
                  const aNumber = getPageNumber(a.link);
                  const bNumber = getPageNumber(b.link);
                  const searchNum = parseInt(searchClean);

                  // Exact matches first
                  if (aNumber === searchNum && bNumber !== searchNum) return -1;
                  if (bNumber === searchNum && aNumber !== searchNum) return 1;

                  // Then sort numerically if both have numbers
                  if (aNumber && bNumber) return aNumber - bNumber;

                  // Items with numbers come before items without numbers
                  if (aNumber && !bNumber) return -1;
                  if (!aNumber && bNumber) return 1;
                }

                // Default alphabetical sort
                return a.name.localeCompare(b.name);
              })
              .map((link) => (
                <NavItem
                  key={link.name}
                  icon={link.icon}
                  as={Link}
                  to={link.link}
                  link={link.link}
                  onClick={() => onClose()}
                >
                  {getDisplayName(link)}
                </NavItem>
              ))}
        {/* Show message if no items found in search */}
        {itemSearch &&
          Object.keys(filteredCategories).length === 0 &&
          filteredScrollableItems.length === 0 && (
            <Box mx="4" my="2">
              <Text fontSize="sm" color="gray.500">
                Nincs találat a keresésre
              </Text>
            </Box>
          )}
        {/* Show message if user has no table access */}
        {!itemSearch && Object.keys(filteredCategories).length === 0 && (
          <Box mx="4" my="2">
            <Text fontSize="sm" color="gray.500">
              Nincs további elérhető menü a jogosultságai alapján
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const NavItem = ({ icon, children, onClick, link, ...rest }) => {
  const location = useLocation();
  // Extract the 'to' prop from rest to check if it's active
  const { to, ...otherProps } = rest;
  const isActive = to && location.pathname === to;

  // Handle both the navigation and onClick (for mobile closing)
  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <Flex
      align="center"
      p="3"
      mx="4"
      borderRadius="xl"
      role="button"
      tabIndex={0}
      cursor="pointer"
      style={{ textDecoration: "none" }}
      transition="all 0.2s ease-in-out"
      _focus={{
        boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)",
        outline: "none",
      }}
      _hover={{
        bg: isActive ? "blue.600" : "blue.50",
        color: isActive ? "white" : "blue.700",
        transform: "translateX(4px)",
        boxShadow: "md",
      }}
      bg={isActive ? "blue.500" : "transparent"}
      color={isActive ? "white" : "gray.700"}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      to={to}
      aria-label={`Navigate to ${children}`}
      {...otherProps}
    >
      {icon && (
        <Icon
          mr="3"
          fontSize="18"
          flexShrink={0}
          _groupHover={{
            color: isActive ? "white" : "blue.600",
          }}
          color={isActive ? "white" : "gray.500"}
          as={icon}
        />
      )}
      <Text
        fontSize="sm"
        fontWeight={isActive ? "semibold" : "medium"}
        noOfLines={1}
        flex="1"
      >
        {children}
      </Text>
    </Flex>
  );
};

const MobileNav = ({ onOpen, ...rest }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const userPermissions = useSelector(selectUserPermissions);
  const [logoutMutation] = useLogoutMutation();

  // Initialize recent pages hook for mobile nav
  const { recentPages, clearRecentPages, removeRecentPage } =
    useRecentPages(NavigationCategories); // Emergency logout handler (bypasses API call)
  const handleEmergencyLogout = () => {
    console.log("Emergency logout triggered - bypassing API call");

    // Show immediate toast
    toaster.create({
      title: "Azonnali kijelentkezés",
      description: "Helyi kijelentkezést hajt végre API hívás nélkül.",
      status: "info",
      duration: 2000,
    });

    // Clear all RTK Query cache data
    dispatch(indicatorApi.util.resetApiState());
    // Clear auth state
    dispatch(logout());
    // Navigate to login immediately
    navigate("/login");
  };

  // Add keyboard shortcut for emergency logout (Ctrl+Shift+L)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        console.log("Emergency logout shortcut activated");
        handleEmergencyLogout();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleLogout = async () => {
    // Show loading toast
    const loadingToast = toaster.create({
      title: "Kijelentkezés...",
      description: "Kérjük várjon, amíg a kijelentkezés folyamata befejeződik.",
      status: "loading",
      duration: null, // Don't auto-close
    });

    try {
      console.log("Starting logout process...");

      // Add a timeout for the logout API call - shorter timeout for logout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Logout request timed out")), 3000)
      );

      // Try to call the logout API with timeout
      await Promise.race([logoutMutation().unwrap(), timeoutPromise]);

      console.log("Server logout successful");

      // Update loading toast to success
      toaster.update(loadingToast, {
        title: "Sikeres kijelentkezés",
        description: "A szerver kijelentkeztette Önt.",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Logout API error (proceeding with local logout):", error);

      // Update loading toast to warning
      toaster.update(loadingToast, {
        title: "Helyi kijelentkezés",
        description:
          "Szerver kapcsolat megszakadt, de a helyi kijelentkezés megtörtént.",
        status: "warning",
        duration: 3000,
      });

      // Check if it's a timeout or connection error
      if (
        error.message?.includes("timeout") ||
        error.status === "FETCH_ERROR"
      ) {
        console.log("Network issue detected - logging out locally");
      }

      // Even if API logout fails, we still want to log out locally
      // This is important for security - never leave user "stuck" logged in
    } finally {
      // Always perform local logout regardless of API response
      console.log("Performing local logout...");

      // Clear all RTK Query cache data
      dispatch(indicatorApi.util.resetApiState());

      // Clear auth state
      dispatch(logout());

      // Navigate to login
      setTimeout(() => {
        navigate("/login");
      }, 1000); // Small delay to show the toast
    }
  };

  return (
    <Flex
      ml={{ base: 0, md: 64 }}
      px={{ base: 4, md: 6 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.50")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.300")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      boxShadow={useColorModeValue("sm", "md")}
      zIndex={999}
      {...rest}
    >
      <Box position="relative">
        <IconButton
          display={{ base: "flex", md: "none" }}
          onClick={onOpen}
          variant="outline"
          aria-label="Open navigation menu"
          size="lg"
          borderRadius="xl"
          transition="all 0.2s ease-in-out"
          _hover={{
            bg: "blue.50",
            borderColor: "blue.200",
            transform: "scale(1.05)",
          }}
          _active={{
            transform: "scale(0.95)",
          }}
        >
          <MdMenu size={20} />
        </IconButton>

        {/* Recent pages indicator for mobile 
        {recentPages && recentPages.length > 0 && (
          <Box
            position="absolute"
            top="-1"
            right="-1"
            w="5"
            h="5"
            bg="blue.500"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
            color="white"
            fontWeight="bold"
            border="2px solid white"
          >
            {recentPages.length}
          </Box>
        )}*/}
      </Box>

      <Box flex="1" flexGrow={1} justifyContent="center">
        <SchoolSelector />
      </Box>

      <HStack spacing={{ base: "0", md: "6" }}>
        {/* Recent Pages Dropdown - Desktop Only 

        <Box display={{ base: "none", md: "block" }}>
          <RecentPagesDropdown
            recentPages={recentPages}
            onRemovePage={removeRecentPage}
            onClearAll={clearRecentPages}
          />
        </Box>
*/}

        <Flex alignItems={"center"} gap={3}>
          <Tooltip title="Az oldal fejlesztés alatt áll.">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="8"
              h="8"
              borderRadius="full"
              bg="orange.100"
              color="orange.600"
              cursor="pointer"
              transition="all 0.2s ease-in-out"
              _hover={{
                bg: "orange.200",
                transform: "scale(1.1)",
              }}
            >
              <MdInfo size={18} />
            </Box>
          </Tooltip>
          <Menu.Root>
            <Menu.Trigger
              py={2}
              px={3}
              borderRadius="xl"
              transition="all 0.2s ease-in-out"
              _focus={{ boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)" }}
              _hover={{ bg: "gray.50" }}
            >
              {" "}
              <HStack>
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="center"
                  spacing="1px"
                  ml="2"
                  fontWeight={600}
                >
                  {" "}
                  <Text fontSize="sm">
                    {user?.name || user?.email || "User"}
                  </Text>
                  <UserRoleBadge
                    role={userRole}
                    permissions={userPermissions}
                  />
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </Menu.Trigger>{" "}
            <Menu.Positioner>
              <Menu.Content
                bg={useColorModeValue("white", "gray.900")}
                borderColor={useColorModeValue("gray.200", "gray.700")}
                _hover={{
                  bg: useColorModeValue("gray.50", "gray.800"),
                  cursor: "pointer",
                }}
              >
                <Menu.Item
                  _hover={{
                    bg: useColorModeValue("gray.50", "gray.800"),
                    cursor: "pointer",
                  }}
                  onClick={handleLogout}
                >
                  Kijelentkezés
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Flex>
      </HStack>
    </Flex>
  );
};

export default function Navigation({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Alias Mode Banner - Shows when in alias mode */}
      <AliasModeBanner />
      <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
        <SidebarContent
          onClose={() => setIsOpen(false)}
          display={{ base: "none", md: "block" }}
          bg="white"
        />
        <Drawer.Root
          open={isOpen}
          onOpenChange={(open) => setIsOpen(open)}
          placement={"left"}
          restoreFocus={false}
          size={"full"}
        >
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.CloseTrigger />
              <Drawer.Body>
                <SidebarContent onClose={() => setIsOpen(false)} />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
        {/* mobilenav */}
        <MobileNav onOpen={() => setIsOpen(true)} />
        <Box ml={{ base: 0, md: 64 }} p="4">
          {children}
        </Box>
      </Box>
    </>
  );
}

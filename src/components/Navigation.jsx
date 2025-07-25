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
  MdAccessible,
  MdPeople,
  MdGavel,
  MdWork,
} from "react-icons/md";

import { ColorModeButton, useColorModeValue } from "./ui/color-mode";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetAllAlapadatokQuery,
  useLogoutMutation,
} from "../store/api/apiSlice";
import {
  logout,
  selectUser,
  selectUserRole,
  selectUserPermissions,
  selectUserTableAccess,
  selectSelectedSchool,
  setSelectedSchool,
} from "../store/slices/authSlice";
import { FiChevronDown } from "react-icons/fi";
import UserRoleBadge from "./UserRoleBadge";
import { FormControl, Input, MenuItem, Select } from "@mui/material";

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
        name: "SNI tanulók aránya",
        icon: MdAccessible,
        link: "/sajatos-nevelesi-igenyu-tanulok-aranya",
        tableName: "sajatos_nevelesi_igenyu_tanulok_aranya",
      },
      {
        name: "HH tanulók aránya",
        icon: MdPeople,
        link: "/hatranyos-helyezu-tanulok-aranya",
        tableName: "hatranyos_helyetu_tanulok_aranya",
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
        tableName: "orszagos_kompetenciameres",
      },
      {
        name: "NSZFH mérések",
        icon: MdAssessment,
        link: "/nszfh-meresek",
        tableName: "nszfh_meresek",
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
        tableName: "elegedettseg_meres_eredmenyei",
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
        link: "/versenyek",
        tableName: "versenyek",
      },
      {
        name: "Szakmai eredmények",
        icon: MdStar,
        link: "/szakmai-eredmenyek",
        tableName: "szakmai_eredmenyek",
      },
      {
        name: "Intézményi elismerések",
        icon: MdStar,
        link: "/intezmenyi-elismeresek",
        tableName: "intezmenyi_elismeresek",
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
        tableName: "elhelyezkedesi_mutato",
      },
      {
        name: "Végzettek elégedettsége",
        icon: MdStar,
        link: "/vegzettek-elegedettsege",
        tableName: "vegzettek_elegedettsege",
      },
      {
        name: "Szakképzési munkaszerződés",
        icon: MdWork,
        link: "/szakkepzesi-munkaszerződes-arany",
        tableName: "szakkepzesi_munkaszerződes_arany",
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
        tableName: "felnottkepzes",
      },
      {
        name: "Műhelyiskolai részszakmat",
        icon: MdSchool,
        link: "/muhelyiskolai-reszszakmat",
        tableName: "muhelyiskolai_reszszakmat",
      },
      {
        name: "Dobbantó program",
        icon: MdTrendingUp,
        link: "/dobbanto-program-aranya",
        tableName: "dobbanto_program_aranya",
      },
      {
        name: "Intézményi nevelési mutatók",
        icon: MdGavel,
        link: "/intezmenyi-nevelesi-mutatok",
        tableName: "intezmenyi_nevelesi_mutatok",
      },
    ],
  },
  EVENTS: {
    name: "Események és aktivitás",
    icon: MdEvent,
    items: [
      {
        name: "Szakmai bemutatók",
        icon: MdEvent,
        link: "/szakmai-bemutatok-konferenciak",
        tableName: "szakmai_bemutatok_konferenciak",
      },
      {
        name: "Oktató per diák",
        icon: MdBookmark,
        link: "/oktato_per_diak",
        tableName: "oktato_per_diak",
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
        tableName: "users",
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

  if (!tableAccess || !Array.isArray(tableAccess)) {
    // If no table access info, only show dashboard
    return AllLinkItems.filter((item) => item.tableName === null);
  }

  const accessibleTableNames = tableAccess.map((access) => access.tableName);

  return AllLinkItems.filter((item) => {
    // Always show items without tableName (like dashboard)
    if (item.tableName === null) {
      // For data import, check if user has admin permissions or access to any data tables
      if (item.link === "/adat-import") {
        return (
          userPermissions?.isAdmin ||
          userPermissions?.isSuperadmin ||
          accessibleTableNames.some((name) =>
            ["alapadatok", "tanulo_letszam", "kompetencia"].includes(name)
          )
        );
      }
      return true;
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
      organizedCategories[categoryKey] = {
        ...category,
        items: categoryItems,
      };
    }
  });

  return organizedCategories;
};

const SidebarContent = ({ onClose, ...rest }) => {
  const [itemSearch, setItemSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({
    GENERAL: true, // Keep general expanded by default
  });

  const tableAccess = useSelector(selectUserTableAccess);
  const userPermissions = useSelector(selectUserPermissions);

  // Get navigation items that the user has access to
  const accessibleNavItems = getAccessibleNavItems(
    tableAccess,
    userPermissions
  );

  // Get organized categories
  const organizedCategories = getOrganizedAccessibleItems(
    tableAccess,
    userPermissions
  );

  // Separate fixed items (first 3) and scrollable items
  const fixedItems = accessibleNavItems.filter(
    (item) =>
      item.link === "/dashboard" ||
      item.link === "/alapadatok" ||
      item.link === "/adat-import" ||
      item.link === "/schools" ||
      item.link === "/users"
  );

  const scrollableItems = accessibleNavItems.filter(
    (item) =>
      item.link !== "/dashboard" &&
      item.link !== "/alapadatok" &&
      item.link !== "/adat-import" &&
      item.link !== "/schools" &&
      item.link !== "/users"
  );

  // Filter scrollable items based on search
  const filteredScrollableItems = scrollableItems.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  // Filter categories based on search
  const filteredCategories = Object.entries(organizedCategories).reduce(
    (acc, [key, category]) => {
      const filteredItems = category.items.filter(
        (item) =>
          item.name.toLowerCase().includes(itemSearch.toLowerCase()) &&
          !fixedItems.some((fixed) => fixed.link === item.link)
      );

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
      transition="3s ease"
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="100vh"
      bg="white"
      {...rest}
    >
      {/* Header */}
      <Box>
        <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
          <Image
            src="../hszc_logo.png"
            alt="HSZC"
            className="!max-w-[150px] h-auto object-contain !important"
          />
          <CloseButton
            display={{ base: "flex", md: "none" }}
            onClick={onClose}
          />
        </Flex>

        {/* Search */}
        <VStack align="start" mx="8" my="4">
          <Input
            placeholder="Keresés..."
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            size="sm"
            width="100%"
          />
        </VStack>

        {/* Fixed Navigation Items */}
        {fixedItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            as={Link}
            to={link.link}
            onClick={() => onClose()}
          >
            {link.name}
          </NavItem>
        ))}

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
        overflowY="auto"
        overflowX="hidden"
        maxHeight="calc(100vh - 400px)"
        sx={{
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#cbd5e0",
            borderRadius: "10px",
            "&:hover": {
              background: "#a0aec0",
            },
          },
        }}
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
                    p="2"
                    mx="4"
                    borderRadius="lg"
                    cursor="pointer"
                    bg={useColorModeValue("gray.50", "gray.700")}
                    _hover={{
                      bg: useColorModeValue("gray.100", "gray.600"),
                    }}
                    onClick={() => toggleCategory(categoryKey)}
                  >
                    <Icon as={category.icon} mr="2" fontSize="16" />
                    <Text fontSize="sm" fontWeight="medium" flex="1">
                      {category.name}
                    </Text>
                    <Icon
                      as={FiChevronDown}
                      fontSize="12"
                      transform={
                        expandedCategories[categoryKey]
                          ? "rotate(180deg)"
                          : "rotate(0deg)"
                      }
                      transition="transform 0.2s"
                    />
                  </Flex>

                  {/* Category Items */}
                  {expandedCategories[categoryKey] && (
                    <Box
                      overflow="hidden"
                      transition="all 0.2s ease-in-out"
                    >
                      <VStack align="stretch" spacing="0" mt="1">
                        {category.items.map((link) => (
                          <NavItem
                            key={link.name}
                            icon={link.icon}
                            as={Link}
                            to={link.link}
                            onClick={() => onClose()}
                            pl="8"
                            fontSize="sm"
                          >
                            {link.name}
                          </NavItem>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </Box>
              )
            )
          : // When searching, show flat list
            filteredScrollableItems
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((link) => (
                <NavItem
                  key={link.name}
                  icon={link.icon}
                  as={Link}
                  to={link.link}
                  onClick={() => onClose()}
                >
                  {link.name}
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

const NavItem = ({ icon, children, onClick, ...rest }) => {
  // Handle both the navigation and onClick (for mobile closing)
  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  return (
    <Flex
      align="center"
      p="4"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
      _hover={{
        bg: "cyan.400",
        color: "white",
      }}
      onClick={handleClick}
      {...rest}
    >
      {icon && (
        <Icon
          mr="4"
          fontSize="16"
          _groupHover={{
            color: "white",
          }}
          as={icon}
        />
      )}
      {children}
    </Flex>
  );
};

const MobileNav = ({ onOpen, ...rest }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const userPermissions = useSelector(selectUserPermissions);
  const selectedSchool = useSelector(selectSelectedSchool);
  const [logoutMutation] = useLogoutMutation();

  const { data: schoolsData } = useGetAllAlapadatokQuery();
  useEffect(() => {
    if (schoolsData) {
      console.log("Schools data:", schoolsData);
    }
  }, [schoolsData]);

  const schools = {
    items:
      schoolsData?.map((item) => ({
        label: item.iskola_neve,
        value: item.id.toString(),
      })) || [],
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    const selectedSchoolData = schoolsData?.find(
      (school) => school.id.toString() === selectedValue
    );

    // Dispatch the selected school to Redux store
    dispatch(setSelectedSchool(selectedSchoolData || null));

    console.log("Selected school:", selectedSchoolData);
  };
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg="white"
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
      >
        <MdMenu />
      </IconButton>

      <Box flex="1" flexGrow={1} justifyContent="center">
        <HStack spacing={2} alignItems="center">
          <ColorModeButton />
          <FormControl variant="outlined" size="small" width="200px">
            <Select
              value={selectedSchool?.id?.toString() || ""}
              onChange={handleChange}
              displayEmpty
              input={<Input />}
              renderValue={(value) =>
                value
                  ? schools.items.find((item) => item.value === value)?.label
                  : "Válassz iskolát"
              }
            >
              <MenuItem default value="">
                Válassz iskolát
              </MenuItem>
              {schools.items.map((school) => (
                <MenuItem key={school.value} value={school.value}>
                  {school.label}
                </MenuItem>
              ))}
              {schools.items.length === 0 && (
                <MenuItem disabled>Nincs elérhető iskola</MenuItem>
              )}
            </Select>
          </FormControl>
        </HStack>
      </Box>

      <HStack spacing={{ base: "0", md: "6" }}>
        <Flex alignItems={"center"} gap={2}>
          <Menu.Root>
            <Menu.Trigger
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
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
              >
                <Menu.Item>Profile</Menu.Item>
                <Menu.Item>Settings</Menu.Item>
                <Menu.Separator />
                <Menu.Item onClick={handleLogout}>Sign out</Menu.Item>
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
        <Box ml={{ base: 0, md: 60 }} p="4">
          {children}
        </Box>
      </Box>
    </>
  );
}

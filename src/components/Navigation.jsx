import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  Text,
  Menu,
  Drawer,
  Select,
  Portal,
  createListCollection,
  Image,
} from "@chakra-ui/react";
import {
  MdPerson,
  MdChevronLeft,
  MdChevronRight,
  MdMenu,
  MdHome,
  MdStar,
  MdBookmark,
  MdUpload,
  MdSettings,
  MdGroup,
  MdBook,
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
} from "../store/slices/authSlice";
import { FiBookmark, FiChevronDown } from "react-icons/fi";
import UserRoleBadge from "./UserRoleBadge";
import { Input } from "@mui/material";
import { getTableName } from "../utils/tableValues";

// All available navigation items with their table mappings
const AllLinkItems = [
  { name: "Főoldal", icon: MdHome, link: "/dashboard", tableName: null }, // Always visible
  {
    name: "Alapadatok",
    icon: MdSettings,
    link: "/alapadatok",
    tableName: null,
  },
  {
    name: "Tanulólétszám",
    icon: MdGroup,
    link: "/tanulo_letszam",
    tableName: "tanulo_letszam",
  },
  {
    name: "Kompetencia",
    icon: MdBook,
    link: "/kompetencia",
    tableName: "kompetencia",
  },
  {
    name: "Versenyek",
    icon: MdStar,
    link: "/versenyek",
    tableName: "versenyek",
  },
  {
    name: "Felvettek száma",
    icon: MdGroup,
    link: "/felvettek_szama",
    tableName: "felvettek_szama",
  },
  {
    name: "Adatok Importálása a Kréta rendszerből",
    icon: MdUpload,
    link: "/adat-import",
    tableName: null, // Special page, check based on permissions
  },
  { name: "Felhasználók", icon: MdPerson, link: "/users", tableName: "users" },
];

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

const SidebarContent = ({ onClose, ...rest }) => {
  const [itemSearch, setItemSearch] = useState("");
  const tableAccess = useSelector(selectUserTableAccess);
  const userPermissions = useSelector(selectUserPermissions);

  console.log("tableAccess", tableAccess);
  console.log("userPermissions", userPermissions);
  // Get navigation items that the user has access to
  const accessibleNavItems = getAccessibleNavItems(
    tableAccess,
    userPermissions
  );

  // Separate dashboard and other items
  const dashboardItems = accessibleNavItems.filter(
    (item) => item.link === "/dashboard" || item.tableName === null
  );
  const otherItems = accessibleNavItems.filter(
    (item) => item.link !== "/dashboard" && item.tableName !== null
  );

  // Filter other items based on search
  const filteredOtherItems = otherItems.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <Box
      transition="3s ease"
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      {" "}
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Image
          src="../hszc_logo.png"
          alt="HSZC"
          className="!max-w-[150px] h-auto object-contain !important"
        />

        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      <VStack align="start" mx="8" my="4">
        <Input
          placeholder="Keresés..."
          value={itemSearch}
          onChange={(e) => setItemSearch(e.target.value)}
          size="sm"
          width="100%"
          mb={4}
        />
      </VStack>
      {/* Always show dashboard items first */}
      {dashboardItems.map((link) => (
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
      {/* Show separator if there are other items */}
      {filteredOtherItems.length > 0 && <hr />}
      {/* Show filtered accessible items */}
      {filteredOtherItems.map((link) => (
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
      {/* Show message if no items found */}
      {filteredOtherItems.length === 0 &&
        itemSearch &&
        otherItems.length > 0 && (
          <Box mx="4" my="2">
            <Text fontSize="sm" color="gray.500">
              Nincs találat a keresésre
            </Text>
          </Box>
        )}
      {/* Show message if user has no table access */}
      {accessibleNavItems.length <= 1 && (
        <Box mx="4" my="2">
          <Text fontSize="sm" color="gray.500">
            Nincs elérhető menü a jogosultságai alapján
          </Text>
        </Box>
      )}
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
  const [logoutMutation] = useLogoutMutation();
  const { data } = useGetAllAlapadatokQuery();

  console.log(data);

  const schools = createListCollection({
    items:
      data?.map((item) => ({
        label: item.nev,
        value: item.id.toString(),
      })) || [],
  });

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

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
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
        <Select.Root collection={schools} size="sm" width="320px">
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Iskola kiválasztása" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {schools.items.map((school) => (
                  <Select.Item item={school} key={school.value}>
                    {school.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
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

  useEffect(() => {
    console.log("isOpen", isOpen);
  }, [isOpen]);

  return (
    <>
      <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
        <SidebarContent
          onClose={() => setIsOpen(false)}
          display={{ base: "none", md: "block" }}
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

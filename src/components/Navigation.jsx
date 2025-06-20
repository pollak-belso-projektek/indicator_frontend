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
} from "../store/slices/authSlice";
import { FiBookmark, FiChevronDown } from "react-icons/fi";
import UserRoleBadge from "./UserRoleBadge";

const LinkItems = [
  { name: "Főoldal", icon: MdHome, link: "/dashboard" },
  { name: "Alapadatok", icon: MdSettings, link: "/alapadatok" },
  { name: "Tanulólétszám", icon: MdGroup, link: "/tanuloletszam" },
  { name: "Kompetencia", icon: MdBook, link: "/kompetencia" },
  { name: "Versenyek", icon: MdStar, link: "/versenyek" },
  {
    name: "Adatok Importálása a Kréta rendszerből",
    icon: MdUpload,
    link: "/adat-import",
  },
  { name: "Felhasználók", icon: MdPerson, link: "/users" },
];

const SidebarContent = ({ onClose, ...rest }) => {
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Logo
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
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
    </Box>
  );
};

const NavItem = ({ icon, children, onClick, ...rest }) => {
  // Handle both the navigation and onClick (for mobile closing)
  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  return (
    <Box
      as="a"
      href="#"
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
      onClick={handleClick}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: "cyan.400",
          color: "white",
        }}
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
    </Box>
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

      <Text
        display={{ base: "flex", md: "none" }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Logo
      </Text>

      <Box flex="1" flexGrow={1} justifyContent="center">
        <Select.Root collection={schools} size="sm" width="320px">
          <Select.HiddenSelect />
          <Select.Label>Select framework</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select framework" />
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
          <ColorModeButton />
          <Menu.Root>
            <Menu.Trigger
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              {" "}
              <HStack>
                <Avatar.Root>
                  <Avatar.Fallback name={user?.name || user?.email || "User"} />
                  {user?.avatar && <Avatar.Image src={user.avatar} />}
                </Avatar.Root>
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
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

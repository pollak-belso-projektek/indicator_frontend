import React, { useEffect } from "react";
import {
  Avatar,
  Flex,
  HStack,
  VStack,
  IconButton,
  Text,
  Menu,
  Box,
} from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { MdMenu } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetAllAlapadatokQuery,
  useLogoutMutation,
} from "../../store/api/apiSlice";
import {
  logout,
  selectUser,
  selectUserRole,
  selectUserPermissions,
} from "../../store/slices/authSlice";
import { ColorModeButton } from "../ui/color-mode";
import UserRoleBadge from "../UserRoleBadge";

const MobileNav = ({ onOpen, ...rest }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const userPermissions = useSelector(selectUserPermissions);
  const [logoutMutation] = useLogoutMutation();

  const { data: schoolsData } = useGetAllAlapadatokQuery();
  
  useEffect(() => {
    if (schoolsData) {
      console.log("Schools data:", schoolsData);
    }
  }, [schoolsData]);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error("Failed to logout:", err);
      // Even if logout fails, clear local state
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
        Indikátor
      </Text>

      <HStack spacing={{ base: "0", md: "6" }}>
        <ColorModeButton />
        <Flex alignItems="center">
          <Menu.Root>
            <Menu.Trigger asChild>
              <HStack>
                <Avatar
                  size="sm"
                  src="https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                />
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{user?.name || "Unknown User"}</Text>
                  <UserRoleBadge
                    userType={userRole}
                    permissions={userPermissions}
                  />
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </Menu.Trigger>
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

export default MobileNav;
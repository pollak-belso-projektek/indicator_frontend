import React, { useState } from "react";
import {
  Box,
  CloseButton,
  Flex,
  Text,
  Image,
} from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { FormControl, Input } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectUserTableAccess,
  selectUserPermissions,
} from "../../store/slices/authSlice";
import { useNavigationFilter } from "./useNavigationFilter";
import NavItem from "./NavItem";

const SidebarContent = ({ onClose, ...rest }) => {
  const [itemSearch, setItemSearch] = useState("");
  const userTableAccess = useSelector(selectUserTableAccess);
  const userPermissions = useSelector(selectUserPermissions);

  const {
    alwaysVisibleItems,
    otherItems,
    filteredOtherItems,
    accessibleNavItems,
  } = useNavigationFilter(userTableAccess, userPermissions, itemSearch);

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
        <Image src="/images/logo.png" alt="Logo" maxH="10" />
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Indikátor Rendszer
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>

      {/* Search Box */}
      <Box mx="4" my="4">
        <FormControl fullWidth>
          <Input
            placeholder="Keresés a menüben..."
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            size="small"
          />
        </FormControl>
      </Box>

      {/* Always visible items */}
      {alwaysVisibleItems.map((link) => (
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

export default SidebarContent;
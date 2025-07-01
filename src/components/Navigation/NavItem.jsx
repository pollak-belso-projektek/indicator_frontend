import React from "react";
import { Flex, Icon } from "@chakra-ui/react";

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

export default NavItem;
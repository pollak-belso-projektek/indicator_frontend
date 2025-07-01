import React, { useState } from "react";
import { Box, Drawer } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { SidebarContent, MobileNav } from ".";

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
import { useState, useEffect } from "react";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";

const RouteLoadingSpinner = ({ message = "Oldal betöltése..." }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the spinner after a tiny delay to avoid flash
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(showTimer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg={useColorModeValue(
        "rgba(255, 255, 255, 0.9)",
        "rgba(26, 32, 44, 0.9)"
      )}
      backdropFilter="blur(2px)"
      zIndex="9999"
      display="flex"
      alignItems="center"
      justifyContent="center"
      opacity={isVisible ? 1 : 0}
      transition="opacity 0.2s ease-in-out"
    >
      <VStack spacing={4}>
        <Spinner
          thickness="3px"
          speed="0.8s"
          emptyColor="gray.200"
          color="cyan.500"
          size="lg"
        />
        <Text
          fontSize="md"
          fontWeight="medium"
          color={useColorModeValue("gray.600", "gray.300")}
        >
          {message}
        </Text>
      </VStack>
    </Box>
  );
};

export default RouteLoadingSpinner;

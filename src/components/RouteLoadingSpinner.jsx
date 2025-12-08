import { useState, useEffect } from "react";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";

const RouteLoadingSpinner = ({ message = "Oldal betöltése..." }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Call hooks unconditionally at the top level
  const bgColor = useColorModeValue(
    "rgba(255, 255, 255, 0.95)",
    "rgba(26, 32, 44, 0.95)"
  );
  const textColor = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    // Show the spinner immediately for better UX
    setIsVisible(true);
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
      bg={bgColor}
      backdropFilter="blur(4px)"
      zIndex="9999"
      display="flex"
      alignItems="center"
      justifyContent="center"
      opacity={isVisible ? 1 : 0}
      transition="opacity 0.15s ease-in-out"
    >
      <VStack spacing={4}>
        <Spinner
          thickness="3px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text fontSize="md" fontWeight="medium" color={textColor}>
          {message}
        </Text>
      </VStack>
    </Box>
  );
};

export default RouteLoadingSpinner;

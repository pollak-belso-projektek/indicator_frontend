import React from "react";
import { useSelector } from "react-redux";
import { Button, Box, Text, VStack, Badge } from "@chakra-ui/react";
import {
  selectAccessToken,
  selectRefreshToken,
  selectIsTokenExpired,
  selectIsTokenExpiringSoon,
  selectIsAuthenticated,
} from "../store/slices/authSlice";
import useTokenRefresh from "../hooks/useTokenRefresh";
import { jwtDecode } from "jwt-decode";

/**
 * TokenDebugPanel - A debug component to test and monitor token refresh functionality
 * This component should only be used in development
 */
const TokenDebugPanel = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const refreshToken = useSelector(selectRefreshToken);
  const isTokenExpired = useSelector(selectIsTokenExpired);
  const isTokenExpiringSoon = useSelector(selectIsTokenExpiringSoon);

  const { manualRefresh, checkAndRefresh } = useTokenRefresh();

  // Get token expiration info
  const getTokenInfo = (token) => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      const exp = new Date(decoded.exp * 1000);
      const now = new Date();
      const timeLeft = exp.getTime() - now.getTime();
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));

      return {
        expires: exp.toLocaleString(),
        minutesLeft,
        isExpired: timeLeft <= 0,
      };
    } catch (error) {
      return { error: error.message };
    }
  };

  const accessTokenInfo = getTokenInfo(accessToken);
  const refreshTokenInfo = getTokenInfo(refreshToken);

  const handleManualRefresh = async () => {
    try {
      console.log("Manual refresh triggered from debug panel");
      await manualRefresh();
      console.log("Manual refresh completed successfully");
    } catch (error) {
      console.error("Manual refresh failed:", error);
    }
  };

  const handleCheckAndRefresh = async () => {
    try {
      console.log("Check and refresh triggered from debug panel");
      const result = await checkAndRefresh(true, true); // autoRefresh=true, proactive=true
      console.log("Check and refresh result:", result);
    } catch (error) {
      console.error("Check and refresh failed:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box
        p={4}
        border="1px"
        borderColor="red.300"
        borderRadius="md"
        bg="red.50"
      >
        <Text color="red.600">Not authenticated - Token debug unavailable</Text>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      border="1px"
      borderColor="blue.300"
      borderRadius="md"
      bg="blue.50"
    >
      <VStack align="stretch" spacing={3}>
        <Text fontSize="lg" fontWeight="bold" color="blue.800">
          Token Debug Panel
        </Text>

        <Box>
          <Text fontWeight="semibold">Status:</Text>
          <Badge colorScheme={isTokenExpired ? "red" : "green"}>
            {isTokenExpired ? "Expired" : "Valid"}
          </Badge>
          {isTokenExpiringSoon && !isTokenExpired && (
            <Badge colorScheme="yellow" ml={2}>
              Expiring Soon
            </Badge>
          )}
        </Box>

        {accessTokenInfo && (
          <Box>
            <Text fontWeight="semibold">Access Token:</Text>
            <Text fontSize="sm">Expires: {accessTokenInfo.expires}</Text>
            <Text fontSize="sm">
              Time left: {accessTokenInfo.minutesLeft} minutes
            </Text>
          </Box>
        )}

        {refreshTokenInfo && (
          <Box>
            <Text fontWeight="semibold">Refresh Token:</Text>
            <Text fontSize="sm">Expires: {refreshTokenInfo.expires}</Text>
            <Text fontSize="sm">
              Time left: {refreshTokenInfo.minutesLeft} minutes
            </Text>
          </Box>
        )}

        <VStack spacing={2}>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={handleManualRefresh}
            isDisabled={!refreshToken}
          >
            Manual Refresh
          </Button>
          <Button
            colorScheme="green"
            size="sm"
            onClick={handleCheckAndRefresh}
            isDisabled={!refreshToken}
          >
            Check & Refresh
          </Button>
        </VStack>

        <Text fontSize="xs" color="gray.600">
          Check browser console for detailed logs
        </Text>
      </VStack>
    </Box>
  );
};

export default TokenDebugPanel;

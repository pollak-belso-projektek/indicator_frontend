import { Badge } from "@chakra-ui/react";
import { Box } from "@mui/material";

const UserRoleBadge = ({ role, permissions }) => {
  const getDisplayRole = (role, permissions) => {
    // Map internal roles to Hungarian display names
    if (permissions?.isSuperadmin) return "Fejlesztő";
    if (permissions?.isHSZC && permissions?.isAdmin) return "HSZC Admin";
    if (permissions?.isHSZC && permissions?.isPrivileged)
      return "HSZC Privilegizált";
    if (permissions?.isHSZC && permissions?.isStandard) return "HSZC Általános";
    if (permissions?.isAdmin && !permissions?.isHSZC) return "Iskolai Admin";
    if (permissions?.isPrivileged && !permissions?.isHSZC)
      return "Iskolai Privilegizált";
    if (permissions?.isStandard && !permissions?.isHSZC)
      return "Iskolai Általános";

    // Fallback to role name
    return role || "Ismeretlen";
  };

  const getRoleColor = (role, permissions) => {
    if (permissions?.isSuperadmin) return "red";
    if (permissions?.isAdmin) return "orange";
    if (permissions?.isPrivileged) return "blue";
    if (permissions?.isStandard) return "green";
    return "gray";
  };

  const getRoleIcon = (permissions) => {
    if (permissions?.isSuperadmin) return "👨‍💻";
    if (permissions?.isAdmin) return "🛡️";
    if (permissions?.isPrivileged) return "⭐";
    if (permissions?.isStandard) return "👤";
    return "👤";
  };

  const displayRole = getDisplayRole(role, permissions);

  return (
    <Box display="inline-flex" alignItems="center">
      <Badge
        colorPalette={getRoleColor(role, permissions)}
        variant="subtle"
        fontSize="xs"
        px={2}
      >
        {getRoleIcon(permissions)} {displayRole}
      </Badge>
      {permissions?.isHSZC && (
        <Badge ml={2} colorPalette="blue" variant="solid" fontSize="xs" px={2}>
          HSZC
        </Badge>
      )}
    </Box>
  );
};

export default UserRoleBadge;

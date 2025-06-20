import { Badge } from "@chakra-ui/react";
import { Box } from "@mui/material";

const UserRoleBadge = ({ role, permissions }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case "Superadmin":
        return "red";
      case "Admin":
        return "orange";
      case "Privileged":
        return "blue";
      case "Standard":
        return "green";
      default:
        return "gray";
    }
  };

  const getRoleIcon = (permissions) => {
    if (permissions?.isSuperadmin) return "👑";
    if (permissions?.isAdmin) return "🛡️";
    if (permissions?.isPrivileged) return "⭐";
    if (permissions?.isStandard) return "👤";
    return "👤";
  };

  return (
    <Box display="inline-flex" alignItems="center">
      <Badge
        colorScheme={getRoleColor(role)}
        variant="subtle"
        fontSize="xs"
        px={2}
      >
        {getRoleIcon(permissions)} {role}
      </Badge>
      {permissions?.isHSZC && (
        <Badge colorScheme="purple" variant="solid" fontSize="xs" ml={1}>
          HSZC
        </Badge>
      )}
    </Box>
  );
};

export default UserRoleBadge;

import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, MenuItem, Select, InputBase, alpha, styled } from "@mui/material";
import { MdSchool } from "react-icons/md";
import { useGetAllAlapadatokQuery, indicatorApi } from "../store/api/apiSlice";
import {
  selectUser,
  selectUserPermissions,
  selectSelectedSchool,
  setSelectedSchool,
} from "../store/slices/authSlice";

const StyledInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    border: "1px solid",
    borderColor: alpha(theme.palette.primary.main, 0.1),
    fontSize: 14,
    padding: "8px 36px 8px 16px",
    display: "flex",
    alignItems: "center",
    transition: theme.transitions.create(["border-color", "box-shadow", "background-color"]),
    fontWeight: 600,
    color: theme.palette.text.primary,
    "&:focus": {
      borderRadius: 12,
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      borderColor: alpha(theme.palette.primary.main, 0.2),
    },
  },
  "& .MuiSelect-icon": {
    color: theme.palette.primary.main,
    right: 12,
  },
}));

const formatSchoolName = (name) => {
  if (!name) return "";
  return name.replace("Hódmezővásárhelyi SZC ", "").trim();
};

const SchoolSelector = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const userPermissions = useSelector(selectUserPermissions);
  const selectedSchool = useSelector(selectSelectedSchool);

  // Use ref to prevent infinite re-renders when auto-selecting school
  const hasAutoSelectedSchool = useRef(false);
  const isInitializing = useRef(true);

  const { data: schoolsData } = useGetAllAlapadatokQuery();

  // Check if user can select schools (only Superadmin and HSZC users) - memoized to prevent re-renders
  const canSelectSchool = useMemo(() => {
    return userPermissions?.isSuperadmin || userPermissions?.isHSZC;
  }, [userPermissions?.isSuperadmin, userPermissions?.isHSZC]);

  // Memoize user school ID to prevent unnecessary re-renders
  const userSchoolId = useMemo(() => {
    if (!user?.school) return null;
    return typeof user.school === "string" ? user.school : user.school?.id;
  }, [user?.school]);

  // Memoize schools data transformation to prevent re-renders
  const schools = useMemo(
    () => ({
      items:
        schoolsData?.map((item) => ({
          label: item.iskola_neve,
          value: item.id.toString(),
        })) || [],
    }),
    [schoolsData]
  );

  // Reset auto-selection flag when user changes
  useEffect(() => {
    if (isInitializing.current) {
      isInitializing.current = false;
      return;
    }
    hasAutoSelectedSchool.current = false;
  }, [user?.id]);

  // Auto-select user's assigned school for Iskolai users - ONE TIME ONLY
  useEffect(() => {
    if (hasAutoSelectedSchool.current) return;
    if (canSelectSchool) {
      hasAutoSelectedSchool.current = true;
      return;
    }
    if (!userSchoolId) {
      hasAutoSelectedSchool.current = true;
      return;
    }
    if (!schoolsData || schoolsData.length === 0) return;

    if (selectedSchool?.id === userSchoolId) {
      hasAutoSelectedSchool.current = true;
      return;
    }

    const assignedSchool = schoolsData.find(
      (school) => school.id === userSchoolId
    );

    if (assignedSchool) {
      hasAutoSelectedSchool.current = true;
      dispatch(setSelectedSchool(assignedSchool) || null);
    } else {
      hasAutoSelectedSchool.current = true;
    }
  }, [
    canSelectSchool,
    userSchoolId,
    schoolsData,
    selectedSchool?.id,
    dispatch,
  ]);

  const handleChange = (event) => {
    // Only allow school selection for Superadmin and HSZC users
    if (!canSelectSchool) return;

    const selectedValue = event.target.value;
    const selectedSchoolData = schoolsData?.find(
      (school) => school.id.toString() === selectedValue
    );

    // Clear all cached API data when switching schools to prevent stale data
    if (selectedSchoolData?.id !== selectedSchool?.id) {
      dispatch(indicatorApi.util.resetApiState());
    }

    // Dispatch the selected school to Redux store
    dispatch(setSelectedSchool(selectedSchoolData || null));
  };

  // If user cannot select schools, show read-only display or nothing
  if (!canSelectSchool) {
    if (selectedSchool) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1, bgcolor: "grey.50", borderRadius: 3, border: "1px solid", borderColor: "grey.200", maxWidth: 400, overflow: "hidden" }}>
          <MdSchool style={{ color: "#757575", fontSize: 20, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {formatSchoolName(selectedSchool.iskola_neve)}
          </Typography>
        </Box>
      );
    }
    return null;
  }

  // Render the school selector for users who can select schools
  return (
    <Box sx={{ minWidth: 260, maxWidth: 400 }}>
      <Select
        value={selectedSchool?.id?.toString() || ""}
        onChange={handleChange}
        displayEmpty
        fullWidth
        input={<StyledInput />}
        MenuProps={{
          PaperProps: {
            elevation: 3,
            sx: { mt: 1, borderRadius: 3, minWidth: 260 },
          },
        }}
        renderValue={(value) => {
          if (!value) {
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", overflow: "hidden" }}>
                <MdSchool size={18} style={{ flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Válassz iskolát</Typography>
              </Box>
            );
          }
          const found = schools.items.find((item) => item.value === value);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
              <MdSchool size={18} style={{ color: "#1976d2", flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {found ? formatSchoolName(found.label) : "Ismeretlen iskola"}
              </Typography>
            </Box>
          );
        }}
      >
        <MenuItem value="">
          <em>Válassz iskolát</em>
        </MenuItem>
        {schools.items.map((school) => (
          <MenuItem 
            key={school.value} 
            value={school.value}
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              my: 0.5,
              fontSize: 14,
              fontWeight: 500
            }}
          >
            {school.label}
          </MenuItem>
        ))}
        {schools.items.length === 0 && (
          <MenuItem disabled>Nincs elérhető iskola</MenuItem>
        )}
      </Select>
    </Box>
  );
};

export default SchoolSelector;

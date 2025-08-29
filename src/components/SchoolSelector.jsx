import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, OutlinedInput, MenuItem, Select } from "@mui/material";
import { HStack, Text } from "@chakra-ui/react";
import { useGetAllAlapadatokQuery } from "../store/api/apiSlice";
import {
  selectUser,
  selectUserPermissions,
  selectSelectedSchool,
  setSelectedSchool,
} from "../store/slices/authSlice";

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
    console.log(
      "User changed in SchoolSelector, resetting auto-selection flag"
    );
    hasAutoSelectedSchool.current = false;
  }, [user?.id]);

  // Auto-select user's assigned school for Iskolai users - ONE TIME ONLY
  useEffect(() => {
    // Early return conditions to prevent infinite loops
    if (hasAutoSelectedSchool.current) {
      return;
    }

    if (canSelectSchool) {
      // User can select schools, no auto-selection needed
      hasAutoSelectedSchool.current = true;
      return;
    }

    if (!userSchoolId) {
      // User has no assigned school
      hasAutoSelectedSchool.current = true;
      return;
    }

    if (!schoolsData || schoolsData.length === 0) {
      // Schools data not available yet
      return;
    }

    console.log(
      "SchoolSelector: Attempting auto-selection for Iskolai user..."
    );

    // Check if correct school is already selected
    if (selectedSchool?.id === userSchoolId) {
      console.log(
        "SchoolSelector: Correct school already selected, marking complete"
      );
      hasAutoSelectedSchool.current = true;
      return;
    }

    // Find and select the user's assigned school
    const assignedSchool = schoolsData.find(
      (school) => school.id === userSchoolId
    );

    console.log(
      "SchoolSelector: User's assigned school ID:",
      userSchoolId,
      "Found in data:",
      assignedSchool
    );

    if (assignedSchool) {
      console.log(
        "SchoolSelector: Auto-selecting school:",
        assignedSchool.iskola_neve
      );
      hasAutoSelectedSchool.current = true;
      dispatch(setSelectedSchool(assignedSchool) || null);
    } else {
      console.warn("SchoolSelector: User's assigned school not found in data");
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
    if (!canSelectSchool) {
      console.warn("User does not have permission to select schools");
      return;
    }

    const selectedValue = event.target.value;
    const selectedSchoolData = schoolsData?.find(
      (school) => school.id.toString() === selectedValue
    );

    // Debug logging
    console.log("SchoolSelector: School selection change:");
    console.log("- Selected value:", selectedValue);
    console.log("- Available schools:", schools.items);
    console.log("- Found school data:", selectedSchoolData);

    // Dispatch the selected school to Redux store
    dispatch(setSelectedSchool(selectedSchoolData || null));

    console.log("SchoolSelector: Selected school:", selectedSchoolData);
  };

  // If user cannot select schools, show read-only display or nothing
  if (!canSelectSchool) {
    // Only show something if there's a selected school
    if (selectedSchool) {
      return (
        <HStack spacing={2} alignItems="center">
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            Kiválasztott iskola: {selectedSchool.iskola_neve}
          </Text>
        </HStack>
      );
    }
    // Return null if user can't select and no school is selected
    return null;
  }

  // Render the school selector for users who can select schools
  return (
    <HStack spacing={2} alignItems="center">
      <FormControl variant="filled" size="small" width="200px">
        <Select
          value={selectedSchool?.id?.toString() || ""}
          onChange={handleChange}
          displayEmpty
          input={<OutlinedInput />}
          renderValue={(value) => {
            if (!value) return "Válassz iskolát";
            const found = schools.items.find((item) => item.value === value);
            return found ? found.label : "Ismeretlen iskola";
          }}
        >
          <MenuItem value="">Válassz iskolát</MenuItem>
          {schools.items.map((school) => (
            <MenuItem key={school.value} value={school.value}>
              {school.label}
            </MenuItem>
          ))}
          {schools.items.length === 0 && (
            <MenuItem disabled>Nincs elérhető iskola</MenuItem>
          )}
        </Select>
      </FormControl>
    </HStack>
  );
};

export default SchoolSelector;

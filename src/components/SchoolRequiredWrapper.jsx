import { useSelector } from "react-redux";
import { selectSelectedSchool } from "../store/slices/authSlice";
import { Alert, Box, Typography } from "@mui/material";

const SchoolRequiredWrapper = ({ children, pageName }) => {
  const selectedSchool = useSelector(selectSelectedSchool);

  if (!selectedSchool) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        width="100%"
        p={4}
      >
        <Alert severity="error" variant="filled">
          <Box>
            <Typography variant="h6" component="div" mb={1}>
              Kérjük válasszon ki egy iskolát az adatok megtekintéséhez!
            </Typography>
            <Typography variant="body2">
              Az iskola kiválasztása a bal felső sarokban található iskola
              választóval lehetséges.
            </Typography>
          </Box>
        </Alert>
      </Box>
    );
  }

  return children;
};

export default SchoolRequiredWrapper;

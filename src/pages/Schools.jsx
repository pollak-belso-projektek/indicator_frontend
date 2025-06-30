import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useState } from "react";
import {
  useGetAllAlapadatokQuery,
  useAddAlapadatokMutation,
  useUpdateAlapadatokMutation,
  useDeleteAlapadatokMutation,
} from "../store/api/apiSlice";

const Schools = () => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [formData, setFormData] = useState({
    iskola_neve: "",
    intezmeny_tipus: "",
  });

  // API hooks
  const {
    data: schools,
    error,
    isLoading,
    refetch,
  } = useGetAllAlapadatokQuery();
  const [addSchool, { isLoading: isAdding }] = useAddAlapadatokMutation();
  const [updateSchool, { isLoading: isUpdating }] =
    useUpdateAlapadatokMutation();
  const [deleteSchool, { isLoading: isDeleting }] =
    useDeleteAlapadatokMutation();

  // Institution types
  const institutionTypes = [
    "Technikum",
    "Szakképző iskola",
    "Gimnázium",
    "Általános iskola",
    "Szakgimnázium",
  ];

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updateSchool({
          id: selectedSchool.id,
          ...formData,
        }).unwrap();
      } else {
        await addSchool(formData).unwrap();
      }
      handleClose();
      refetch();
    } catch (error) {
      console.error("Error saving school:", error);
    }
  };

  // Handle delete
  const handleDelete = async (schoolId) => {
    if (window.confirm("Biztosan törölni szeretné ezt az iskolát?")) {
      try {
        await deleteSchool(schoolId).unwrap();
        refetch();
      } catch (error) {
        console.error("Error deleting school:", error);
      }
    }
  };

  // Handle dialog open
  const handleOpen = (school = null) => {
    if (school) {
      setEditMode(true);
      setSelectedSchool(school);
      setFormData({
        iskola_neve: school.iskola_neve,
        intezmeny_tipus: school.intezmeny_tipus,
      });
    } else {
      setEditMode(false);
      setSelectedSchool(null);
      setFormData({
        iskola_neve: "",
        intezmeny_tipus: "",
      });
    }
    setOpen(true);
  };

  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedSchool(null);
    setFormData({
      iskola_neve: "",
      intezmeny_tipus: "",
    });
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ margin: 2 }}>
        <Alert severity="error">
          Hiba történt az iskolák betöltése során: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ margin: 2 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Iskolák kezelése
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          disabled={isAdding}
        >
          Új iskola hozzáadása
        </Button>
      </Box>

      {/* Schools Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Iskola neve</TableCell>
              <TableCell>Intézmény típusa</TableCell>
              <TableCell>Létrehozva</TableCell>
              <TableCell>Módosítva</TableCell>
              <TableCell align="center">Műveletek</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools?.map((school) => (
              <TableRow key={school.id}>
                <TableCell>{school.id}</TableCell>
                <TableCell>{school.iskola_neve}</TableCell>
                <TableCell>{school.intezmeny_tipus}</TableCell>
                <TableCell>
                  {new Date(school.createdAt).toLocaleDateString("hu-HU")}
                </TableCell>
                <TableCell>
                  {new Date(school.updatedAt).toLocaleDateString("hu-HU")}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(school)}
                    disabled={isUpdating}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(school.id)}
                    disabled={isDeleting}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!schools || schools.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Nincs megjeleníthető iskola
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? "Iskola szerkesztése" : "Új iskola hozzáadása"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Iskola neve"
              value={formData.iskola_neve}
              onChange={(e) => handleInputChange("iskola_neve", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Intézmény típusa"
              value={formData.intezmeny_tipus}
              onChange={(e) =>
                handleInputChange("intezmeny_tipus", e.target.value)
              }
              select
              fullWidth
              required
            >
              {institutionTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Mégse</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.iskola_neve ||
              !formData.intezmeny_tipus ||
              isAdding ||
              isUpdating
            }
          >
            {isAdding || isUpdating ? (
              <CircularProgress size={20} />
            ) : editMode ? (
              "Mentés"
            ) : (
              "Hozzáadás"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Schools;

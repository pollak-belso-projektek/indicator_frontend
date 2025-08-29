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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  useGetAllAlapadatokQuery,
  useAddAlapadatokMutation,
  useUpdateAlapadatokMutation,
  useDeleteAlapadatokMutation,
  useGetSzakiranyListQuery,
  useGetSzakmaListQuery,
} from "../store/api/apiSlice";
import CustomCreatableSelect from "../components/ui/CreatableSelect";
import { useUserPermissions } from "../hooks/useUserPermissions";

const Schools = () => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [formData, setFormData] = useState({
    iskola_neve: "",
    intezmeny_tipus: "",
    alapadatok_szakirany: [],
  });
  const [expandedSchool, setExpandedSchool] = useState(null);

  const hasSuperAdminPermission = useUserPermissions().isSuperadmin;

  // API hooks
  const {
    data: schools,
    error,
    isLoading,
    refetch,
  } = useGetAllAlapadatokQuery();
  const { data: szakiranyOptions = [], isLoading: isSzakiranyLoading } = useGetSzakiranyListQuery();
  const { data: szakmaOptions = [], isLoading: isSzakmaLoading } = useGetSzakmaListQuery();
  const [addSchool, { isLoading: isAdding }] = useAddAlapadatokMutation();
  const [updateSchool, { isLoading: isUpdating }] =
    useUpdateAlapadatokMutation();
  const [deleteSchool, { isLoading: isDeleting }] =
    useDeleteAlapadatokMutation();

  // Institution types
  const institutionTypes = [
    "Technikum",
    "Szakképző iskola",
    "Technikum és Szakképző iskola",
  ];

  // Add new szakirány to school
  const addSzakirany = (selectedOption) => {
    if (!selectedOption || !selectedOption.value) return;

    // Generate a temporary unique ID for new szakirány
    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newSzakiranyData = {
      szakirany_id: tempId,
      alapadatok_id: selectedSchool?.id || "",
      szakirany: {
        nev: selectedOption.value,
        szakma: [],
      },
    };

    setFormData((prev) => ({
      ...prev,
      alapadatok_szakirany: [...prev.alapadatok_szakirany, newSzakiranyData],
    }));
  };

  // Remove szakirány from school
  const removeSzakirany = (szakiranyId) => {
    setFormData((prev) => ({
      ...prev,
      alapadatok_szakirany: prev.alapadatok_szakirany.filter(
        (item) => item.szakirany_id !== szakiranyId
      ),
    }));
  };

  // Add szakma to szakirány
  const addSzakmaToSzakirany = (szakiranyId, selectedOption) => {
    if (!selectedOption || !selectedOption.value) return;

    // Generate a temporary unique ID for new szakma
    const tempSzakmaId = `temp_szakma_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newSzakmaData = {
      szakma_id: tempSzakmaId,
      szakirany_id: szakiranyId,
      szakma: {
        nev: selectedOption.value,
      },
    };

    setFormData((prev) => ({
      ...prev,
      alapadatok_szakirany: prev.alapadatok_szakirany.map((item) => {
        if (item.szakirany_id === szakiranyId) {
          return {
            ...item,
            szakirany: {
              ...item.szakirany,
              szakma: [...(item.szakirany.szakma || []), newSzakmaData],
            },
          };
        }
        return item;
      }),
    }));
  };

  // Remove szakma from szakirány
  const removeSzakmaFromSzakirany = (szakiranyId, szakmaId) => {
    setFormData((prev) => ({
      ...prev,
      alapadatok_szakirany: prev.alapadatok_szakirany.map((item) => {
        if (item.szakirany_id === szakiranyId) {
          return {
            ...item,
            szakirany: {
              ...item.szakirany,
              szakma: (item.szakirany.szakma || []).filter(
                (szakmaItem) => szakmaItem.szakma_id !== szakmaId
              ),
            },
          };
        }
        return item;
      }),
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const schoolData = {
        iskola_neve: formData.iskola_neve,
        intezmeny_tipus: formData.intezmeny_tipus,
        alapadatok_szakirany: formData.alapadatok_szakirany || [],
      };

      if (editMode) {
        await updateSchool({
          id: selectedSchool.id,
          ...schoolData,
        }).unwrap();
      } else {
        await addSchool(schoolData).unwrap();
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
        alapadatok_szakirany: school.alapadatok_szakirany || [],
      });
    } else {
      setEditMode(false);
      setSelectedSchool(null);
      setFormData({
        iskola_neve: "",
        intezmeny_tipus: "",
        alapadatok_szakirany: [],
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
      alapadatok_szakirany: [],
    });
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle school expansion
  const handleSchoolExpansion = (schoolId) => {
    setExpandedSchool(expandedSchool === schoolId ? null : schoolId);
  };

  useEffect(() => {
    //log every obj change
    console.log("Form Data Changed:", formData);
  }, [formData]);

  useEffect(() => {
    console.log("Szakirany Options:", szakiranyOptions);
    console.log("Szakma Options:", szakmaOptions);
  }, [szakiranyOptions, szakmaOptions]);

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
          disabled={!hasSuperAdminPermission || isAdding}
        >
          Új iskola hozzáadása
        </Button>
      </Box>

      {/* Schools Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Iskola neve</TableCell>
              <TableCell>Intézmény típusa</TableCell>
              <TableCell>Szakirányok száma</TableCell>
              <TableCell align="center">Műveletek</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools?.map((school) => (
              <>
                <TableRow
                  key={school.id}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      expandedSchool === school.id ? "#f0f0f0" : "inherit",
                    "&:hover": {
                      backgroundColor:
                        expandedSchool === school.id ? "#e0e0e0" : "#f5f5f5",
                    },
                  }}
                  onClick={() => handleSchoolExpansion(school.id)}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SchoolIcon color="primary" />
                      {school.iskola_neve}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={school.intezmeny_tipus}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={school.alapadatok_szakirany?.length || 0}
                      color="primary"
                      size="small"
                    />
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
                    <Button
                      size="small"
                      onClick={() => handleSchoolExpansion(school.id)}
                    >
                      {expandedSchool === school.id ? "Bezárás" : "Részletek"}
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Expanded Details Row */}
                {expandedSchool === school.id && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ p: 0 }}>
                      <Box sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
                        <Typography variant="h6" gutterBottom>
                          Szakirányok és szakmák
                        </Typography>

                        {school.alapadatok_szakirany?.length > 0 ? (
                          school.alapadatok_szakirany.map(
                            (szakiranyData, index) => (
                              <Accordion
                                key={szakiranyData.szakirany_id}
                                sx={{ mb: 1 }}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                >
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <WorkIcon color="secondary" />
                                    <Typography variant="subtitle1">
                                      {szakiranyData.szakirany.nev}
                                    </Typography>
                                  </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Szakmák:
                                  </Typography>
                                  <List dense>
                                    {szakiranyData.szakirany.szakma?.map(
                                      (szakmaData) => (
                                        <ListItem key={szakmaData.szakma.id}>
                                          <ListItemText
                                            primary={szakmaData.szakma.nev}
                                          />
                                        </ListItem>
                                      )
                                    )}
                                  </List>
                                  {(!szakiranyData.szakirany.szakma ||
                                    szakiranyData.szakirany.szakma.length ===
                                      0) && (
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                    >
                                      Nincs hozzárendelt szakma
                                    </Typography>
                                  )}
                                </AccordionDetails>
                              </Accordion>
                            )
                          )
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Nincs hozzárendelt szakirány
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
            {(!schools || schools.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            overflow: 'visible'
          }
        }}
        sx={{
          '& .MuiDialog-container': {
            overflow: 'visible'
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle>
          {editMode ? "Iskola szerkesztése" : "Új iskola hozzáadása"}
        </DialogTitle>
        <DialogContent sx={{ overflow: 'visible', paddingBottom: 0, maxHeight: '70vh', overflowY: 'auto' }}>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Basic School Information */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alapadatok
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Iskola neve"
                    value={formData.iskola_neve}
                    onChange={(e) =>
                      handleInputChange("iskola_neve", e.target.value)
                    }
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
              </CardContent>
            </Card>

            {/* Szakirányok Management */}
            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ pt: 1 }}>
                    Szakirányok ({formData.alapadatok_szakirany.length})
                  </Typography>
                  <Box sx={{ width: 300 }}>
                    <CustomCreatableSelect
                      options={szakiranyOptions}
                      placeholder="Válasszon vagy hozzon létre szakirányt"
                      label="Új szakirány"
                      isLoading={isSzakiranyLoading}
                      onChange={addSzakirany}
                      value={null}
                      isClearable={false}
                    />
                  </Box>
                </Box>

                {formData.alapadatok_szakirany.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    Nincs hozzáadott szakirány
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {formData.alapadatok_szakirany.map((szakiranyData) => (
                      <Card
                        key={szakiranyData.szakirany_id}
                        variant="outlined"
                        sx={{ border: "1px solid #e0e0e0" }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: "bold" }}
                            >
                              {szakiranyData.szakirany.nev}
                            </Typography>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<RemoveIcon />}
                              onClick={() =>
                                removeSzakirany(szakiranyData.szakirany_id)
                              }
                            >
                              Eltávolítás
                            </Button>
                          </Box>

                          {/* Szakmák for this szakirány */}
                          <Box sx={{ mt: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1,
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ pt: 1 }}>
                                Szakmák (
                                {szakiranyData.szakirany.szakma?.length || 0})
                              </Typography>
                              <Box sx={{ width: 250 }}>
                                <CustomCreatableSelect
                                  options={szakmaOptions}
                                  placeholder="Válasszon vagy hozzon létre szakmát"
                                  label="Új szakma"
                                  isLoading={isSzakmaLoading}
                                  onChange={(selectedOption) =>
                                    addSzakmaToSzakirany(
                                      szakiranyData.szakirany_id,
                                      selectedOption
                                    )
                                  }
                                  value={null}
                                  isClearable={false}
                                />
                              </Box>
                            </Box>

                            {!szakiranyData.szakirany.szakma ||
                            szakiranyData.szakirany.szakma.length === 0 ? (
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ fontStyle: "italic" }}
                              >
                                Nincs hozzáadott szakma
                              </Typography>
                            ) : (
                              <List dense>
                                {szakiranyData.szakirany.szakma.map(
                                  (szakmaData) => (
                                    <ListItem
                                      key={szakmaData.szakma_id}
                                      sx={{
                                        border: "1px solid #f0f0f0",
                                        borderRadius: 1,
                                        mb: 1,
                                        backgroundColor: "#fafafa",
                                      }}
                                      secondaryAction={
                                        <IconButton
                                          edge="end"
                                          size="small"
                                          color="error"
                                          onClick={() =>
                                            removeSzakmaFromSzakirany(
                                              szakiranyData.szakirany_id,
                                              szakmaData.szakma_id
                                            )
                                          }
                                        >
                                          <RemoveIcon />
                                        </IconButton>
                                      }
                                    >
                                      <ListItemText
                                        primary={szakmaData.szakma.nev}
                                      />
                                    </ListItem>
                                  )
                                )}
                              </List>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
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

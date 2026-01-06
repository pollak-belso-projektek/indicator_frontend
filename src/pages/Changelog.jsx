import { useState } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    Alert,
    CircularProgress,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUserPermissions } from "../store/slices/authSlice";
import {
    useGetChangelogQuery,
    useAddChangelogEntryMutation,
    useDeleteChangelogEntryMutation,
    useUpdateChangelogEntryMutation,
} from "../store/api/apiSlice";
import ReactMarkdown from "react-markdown";

export default function Changelog() {
    const permissions = useSelector(selectUserPermissions);
    const isSuperadmin = permissions?.isSuperadmin;

    const { data: changelogData, isLoading, error } = useGetChangelogQuery();
    const [addChangelogEntry, { isLoading: isAdding }] =
        useAddChangelogEntryMutation();
    const [deleteChangelogEntry] = useDeleteChangelogEntryMutation();
    const [updateChangelogEntry] = useUpdateChangelogEntryMutation();

    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [version, setVersion] = useState("");

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addChangelogEntry({
                date,
                title,
                description,
                version,
            }).unwrap();
            setTitle("");
            setDescription("");
            setVersion("");
            // Date stays current or user can change it manually
        } catch (err) {
            console.error("Failed to add changelog entry:", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Biztosan törölni szeretnéd ezt a bejegyzést?")) {
            try {
                await deleteChangelogEntry(id).unwrap();
            } catch (err) {
                console.error("Failed to delete changelog entry:", err);
            }
        }
    };

    const handleEditClick = (item) => {
        setEditingItem({ ...item });
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            await updateChangelogEntry({
                id: editingItem.id,
                date: editingItem.date,
                title: editingItem.title,
                description: editingItem.description,
                version: editingItem.version,
            }).unwrap();
            setEditDialogOpen(false);
            setEditingItem(null);
        } catch (err) {
            console.error("Failed to update changelog entry:", err);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Változások Naplója (Changelog)
            </Typography>

            {isSuperadmin && (
                <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
                    <Typography variant="h6" gutterBottom>
                        Új bejegyzés hozzáadása
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            label="Dátum"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Verzió (opcionális)"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            placeholder="pl. v1.2.0"
                        />
                        <TextField
                            label="Cím"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            label="Leírás (Markdown támogatott)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            sx={{ mb: 2 }}
                            required
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={isAdding}
                        >
                            {isAdding ? "Hozzáadás..." : "Bejegyzés Hozzáadása"}
                        </Button>
                    </Box>
                </Paper>
            )}

            {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">
                    Hiba történt a napló betöltésekor: {error.message || "Ismeretlen hiba"}
                </Alert>
            ) : (
                <List>
                    {changelogData && Array.isArray(changelogData) && changelogData.length > 0 ? (
                        // Sort by date descending (newest first)
                        [...changelogData]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((item) => (
                                <Paper key={item.id} sx={{ mb: 2, p: 2 }} variant="outlined">
                                    <ListItem
                                        alignItems="flex-start"
                                        disableGutters
                                        secondaryAction={
                                            isSuperadmin && (
                                                <Box>
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="edit"
                                                        onClick={() => handleEditClick(item)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="delete"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            )
                                        }
                                    >
                                        <Box sx={{ width: "100%" }}>
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                mb={1}
                                            >
                                                <Typography variant="h6" component="div">
                                                    {item.title}
                                                </Typography>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {item.version && (
                                                        <Chip
                                                            label={item.version}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                    <Chip
                                                        label={item.date ? item.date.split('T')[0] : 'Nincs dátum'}
                                                        size="small"
                                                    />
                                                </Box>
                                            </Box>
                                            <Divider sx={{ my: 1 }} />
                                            <Box sx={{ mt: 1, '& p': { m: 0 } }}>
                                                <ReactMarkdown>{item.description}</ReactMarkdown>
                                            </Box>
                                        </Box>
                                    </ListItem>
                                </Paper>
                            ))
                    ) : (
                        <Typography variant="body1" align="center" color="text.secondary">
                            Nincs megjeleníthető bejegyzés.
                        </Typography>
                    )}
                </List>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Bejegyzés Szerkesztése</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ pt: 1 }}>
                        <TextField
                            label="Dátum"
                            type="date"
                            value={editingItem?.date?.split('T')[0] || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                            fullWidth
                            sx={{ mb: 2 }}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Verzió (opcionális)"
                            value={editingItem?.version || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, version: e.target.value })}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Cím"
                            value={editingItem?.title || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            fullWidth
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            label="Leírás (Markdown támogatott)"
                            value={editingItem?.description || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={4}
                            sx={{ mb: 2 }}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Mégse</Button>
                    <Button onClick={handleEditSubmit} variant="contained" color="primary">
                        Mentés
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

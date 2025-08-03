# Shared Components

Ez a mappa tartalmazza az újrafelhasználható komponenseket, amelyek több helyen is használhatók a projektben.

## Komponensek

### TableLoadingOverlay

Újrafelhasználható töltési overlay táblázatok számára.

**Props:**

- `isLoading` (boolean): Meghatározza, hogy a töltési overlay látható-e
- `message` (string, opcionális): A töltés során megjelenő üzenet (alapértelmezett: "Adatok mentése folyamatban, kérjük várjon...")

**Használat:**

```jsx
import { TableLoadingOverlay } from "../../components/shared";

<TableContainer sx={{ position: "relative" }}>
  <TableLoadingOverlay
    isLoading={isSaving}
    message="Egyedi töltési üzenet..."
  />
  <Table>{/* táblázat tartalma */}</Table>
</TableContainer>;
```

### NotificationSnackbar

Újrafelhasználható értesítési Snackbar komponens.

**Props:**

- `open` (boolean): Meghatározza, hogy a Snackbar megjelenjen-e
- `message` (string): Az értesítési üzenet
- `severity` (string, opcionális): Az értesítés típusa: 'success' | 'error' | 'warning' | 'info' (alapértelmezett: 'success')
- `onClose` (function): Callback függvény a Snackbar bezárásához
- `autoHideDuration` (number, opcionális): Automatikus elrejtés időtartama milliszekundumban (alapértelmezett: 6000)
- `anchorOrigin` (object, opcionális): A Snackbar pozíciója (alapértelmezett: { vertical: "top", horizontal: "right" })

**Használat:**

```jsx
import { NotificationSnackbar } from "../../components/shared";

const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarSeverity, setSnackbarSeverity] = useState("success");

const handleSnackbarClose = () => {
  setSnackbarOpen(false);
};

// Komponens renderelésében:
<NotificationSnackbar
  open={snackbarOpen}
  message={snackbarMessage}
  severity={snackbarSeverity}
  onClose={handleSnackbarClose}
/>;
```

## Importálás

Az összes komponens importálható egyszerűen:

```jsx
import {
  TableLoadingOverlay,
  NotificationSnackbar,
} from "../../components/shared";
```

vagy külön-külön:

```jsx
import TableLoadingOverlay from "../../components/shared/TableLoadingOverlay";
import NotificationSnackbar from "../../components/shared/NotificationSnackbar";
```

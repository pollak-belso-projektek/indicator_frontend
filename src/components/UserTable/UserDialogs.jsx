import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";

export const EditUserDialog = ({
  open,
  onClose,
  user,
  onUserChange,
  onSave,
  fullScreen,
}) => (
  <Dialog open={open} onClose={onClose} fullScreen={fullScreen}>
    <DialogTitle>Edit User</DialogTitle>
    <DialogContent>
      <DialogContentText>Modify user details here.</DialogContentText>
      <Input
        placeholder="Name"
        defaultValue={user?.name || ""}
        onChange={(e) =>
          onUserChange((prev) => ({ ...prev, name: e.target.value }))
        }
      />
      <Input
        placeholder="Email"
        defaultValue={user?.email || ""}
        onChange={(e) =>
          onUserChange((prev) => ({ ...prev, email: e.target.value }))
        }
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={() => onSave(user)}>Save</Button>
    </DialogActions>
  </Dialog>
);

export const DeleteUserDialog = ({ open, onClose, user, onDelete }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Felhasználó inaktíválása</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Biztos benne, hogy inaktíválni szeretné a következő felhasználót: <br />
        <strong>{user?.name}</strong>?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="outlined">
        Mégse
      </Button>
      <Button onClick={onDelete} color="error" >
        Inaktíválás
      </Button>
    </DialogActions>
  </Dialog>
);

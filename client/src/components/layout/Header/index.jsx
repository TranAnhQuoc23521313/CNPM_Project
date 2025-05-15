import * as React from 'react';
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MovieIcon from '@mui/icons-material/Movie';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Login from '../../../pages/Login';

export default function Header() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#000',
          color: '#fff',
          py: 1.5,
          borderRadius: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        <Toolbar
          sx={{
            maxWidth: '950px',
            mx: 'auto',
            width: '100%',
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', 
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logoci.png" alt="Logo" style={{ height: 50 }} />
          </Box>

          {/* Tên ứng dụng */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MovieIcon sx={{ fontSize: 32, color: '#f5c518', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              CINEZONE
            </Typography>
          </Box>

          {/* Các biểu tượng và nút */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <SearchIcon />
            </IconButton>
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <NotificationsNoneIcon />
            </IconButton>
            <Button color="inherit" onClick={handleClickOpen}>
              Sign In
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dialog Login */}
      <Dialog
  open={open}
  onClose={(event, reason) => {
    if (reason !== 'backdropClick') {
      handleClose();
    }
  }}
  disableEscapeKeyDown
  sx={{
    '& .MuiDialog-paper': {
      width: '400px',
      height: '490px',
      maxWidth: '90%',
      backgroundColor: '#121212',
      color: '#fff', 
    },
  }}
>
  <DialogContent
    sx={{
      backgroundColor: '#121212', 
      color: '#fff', 
      padding: '20px', 
      borderRadius: '8px', 
    }}
  >
    <Login closedialog={handleClose} />
  </DialogContent>

  <DialogActions
    sx={{
      backgroundColor: '#121212', 
      color: '#fff', 
    }}
  >
    <Button onClick={handleClose} sx={{ color: '#fff' }}>
      Cancel
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';

function Navbar() {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <MedicalServicesIcon sx={{ mr: 1 }} />
            脱毛カウント管理
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/" 
              startIcon={<DashboardIcon />}
              sx={{ mx: 0.5 }}
            >
              ダッシュボード
            </Button>
            
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/patients" 
              startIcon={<PeopleIcon />}
              sx={{ mx: 0.5 }}
            >
              患者一覧
            </Button>
            
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/patients/add" 
              startIcon={<PersonAddIcon />}
              sx={{ mx: 0.5 }}
            >
              患者登録
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;

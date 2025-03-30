import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from './components/patients/PatientList';
import PatientDetails from './components/patients/PatientDetails';
import AddPatient from './components/patients/AddPatient';
import AddTreatment from './components/treatments/AddTreatment';

function App() {
  return (
    <Router>
      <Navbar />
      <Box className="content-container">
        <React.Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
          </Box>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/patients/add" element={<AddPatient />} />
            <Route path="/treatments/add" element={<AddTreatment />} />
          </Routes>
        </React.Suspense>
      </Box>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Box, Tooltip, TextField,
  InputAdornment
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

function PatientList() {
  const { getPatients } = useData();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const patientData = getPatients();
    setPatients(patientData);
    setFilteredPatients(patientData);
  }, [getPatients]);

  // 検索機能
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(term.toLowerCase()) ||
        (patient.email && patient.email.toLowerCase().includes(term.toLowerCase())) ||
        (patient.phone && patient.phone.includes(term))
      );
      setFilteredPatients(filtered);
    }
  };

  // 日付をフォーマット
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          患者一覧
        </Typography>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/patients/add"
          startIcon={<AddIcon />}
        >
          新規患者登録
        </Button>
      </Box>

      {/* 検索フィールド */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="患者を検索（名前、電話番号、メール）"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>氏名</TableCell>
              <TableCell>電話番号</TableCell>
              <TableCell>メールアドレス</TableCell>
              <TableCell>登録日</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell component="th" scope="row">
                    {patient.name}
                  </TableCell>
                  <TableCell>{patient.phone || '-'}</TableCell>
                  <TableCell>{patient.email || '-'}</TableCell>
                  <TableCell>{formatDate(patient.created_at)}</TableCell>
                  <TableCell align="center">
                    <Box>
                      <Tooltip title="詳細を表示">
                        <IconButton 
                          color="primary" 
                          component={RouterLink} 
                          to={`/patients/${patient.id}`}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="編集">
                        <IconButton 
                          color="secondary" 
                          component={RouterLink} 
                          to={`/patients/${patient.id}/edit`}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  患者が見つかりません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default PatientList;

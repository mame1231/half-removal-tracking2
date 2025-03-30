import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Grid, Card, CardContent, 
  Divider, Button, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Chip, Alert
} from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import NoteIcon from '@mui/icons-material/Note';

function PatientDetails() {
  const { id } = useParams();
  const { 
    getPatient, 
    getPatientTreatments, 
    getPatientTreatmentSummary,
    deleteTreatment 
  } = useData();
  
  const [patient, setPatient] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [treatmentSummary, setTreatmentSummary] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      const patientData = getPatient(parseInt(id));
      setPatient(patientData);

      const treatmentsData = getPatientTreatments(parseInt(id));
      setTreatments(treatmentsData);

      const summaryData = getPatientTreatmentSummary(parseInt(id));
      setTreatmentSummary(summaryData);
    }
  }, [id, getPatient, getPatientTreatments, getPatientTreatmentSummary, deleteSuccess]);

  // 治療削除ダイアログを開く
  const openDeleteDialog = (treatment) => {
    setTreatmentToDelete(treatment);
    setDeleteDialogOpen(true);
  };

  // 治療削除
  const handleDeleteTreatment = () => {
    if (treatmentToDelete) {
      const success = deleteTreatment(treatmentToDelete.id);
      if (success) {
        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 3000);
      }
    }
    setDeleteDialogOpen(false);
    setTreatmentToDelete(null);
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

  if (!patient) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>患者が見つかりません</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {deleteSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          治療記録を削除しました
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {patient.name}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            component={RouterLink} 
            to={`/patients/${patient.id}/edit`}
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            編集
          </Button>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to={`/treatments/add?patientId=${patient.id}`}
            startIcon={<AddIcon />}
          >
            治療追加
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 患者情報 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                患者情報
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>
                  {patient.phone || '電話番号未登録'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>
                  {patient.email || 'メールアドレス未登録'}
                </Typography>
              </Box>

              {patient.notes && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <NoteIcon sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                  <Typography>
                    {patient.notes}
                  </Typography>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                登録日: {formatDate(patient.created_at)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 治療サマリー */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                治療サマリー
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {treatmentSummary ? (
                <Grid container spacing={2}>
                  {Object.entries(treatmentSummary.treatments).map(([type, data]) => {
                    // データが0の場合は表示しない
                    if (data.count === 0 && type !== '全身脱毛（顔、うなじ、VIO込み）') return null;
                    
                    return (
                      <Grid item xs={12} key={type}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {type}
                          </Typography>
                          <Grid container spacing={1} alignItems="center">
                            <Grid item xs={6} md={4}>
                              <Typography variant="body2" color="text.secondary">
                                治療回数:
                              </Typography>
                              <Typography variant="h6">
                                {type === '女性顔脱毛' && 'totalFaceCount' in data ? 
                                  `${data.count}回 (顔合計: ${data.totalFaceCount}回)` : 
                                  `${data.count}回`}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} md={4}>
                              <Typography variant="body2" color="text.secondary">
                                割引ステータス:
                              </Typography>
                              <Chip 
                                label={data.discount} 
                                color={data.discount === '半額適用' ? 'success' : 'default'}
                                size="small"
                              />
                            </Grid>
                            {type === '全身脱毛（顔、うなじ、VIO込み）' && (
                              <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary">
                                  残り回数（半額まで）:
                                </Typography>
                                <Typography variant="h6">
                                  {data.count >= 6 ? 0 : 6 - data.count}回
                                </Typography>
                              </Grid>
                            )}
                            {(type === '女性顔脱毛' || type === '男性ひげ脱毛') && (
                              <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary">
                                  残り回数（半額まで）:
                                </Typography>
                                <Typography variant="h6">
                                  {type === '女性顔脱毛' ? 
                                    (data.totalFaceCount >= 11 ? 0 : 11 - data.totalFaceCount) : 
                                    (data.count >= 11 ? 0 : 11 - data.count)}回
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography>治療データはありません</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 治療履歴 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  治療履歴
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to={`/treatments/add?patientId=${patient.id}`}
                  startIcon={<AddIcon />}
                  size="small"
                >
                  治療追加
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>日付</TableCell>
                      <TableCell>治療タイプ</TableCell>
                      <TableCell align="right">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {treatments.length > 0 ? (
                      treatments.map((treatment) => (
                        <TableRow key={treatment.id}>
                          <TableCell>{formatDate(treatment.treatment_date)}</TableCell>
                          <TableCell>{treatment.treatment_type}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() => openDeleteDialog(treatment)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          治療記録はありません
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>治療記録の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {treatmentToDelete && `${formatDate(treatmentToDelete.treatment_date)}の${treatmentToDelete.treatment_type}の治療記録を削除します。この操作は元に戻せません。`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleDeleteTreatment} color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PatientDetails;

import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, TextField, Button, 
  Grid, Box, Alert, MenuItem, FormControl, InputLabel,
  Select, FormHelperText
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import ja from 'date-fns/locale/ja';

// 治療タイプの選択肢
const TREATMENT_TYPES = [
  '全身脱毛（顔、うなじ、VIO込み）',
  '女性顔脱毛',
  '男性ひげ脱毛',
  'VIO脱毛',
  'うなじ脱毛',
  '腕脱毛',
  '脚脱毛'
];

function AddTreatment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getPatients, addTreatment } = useData();
  
  // URLパラメータからpatientIdを取得
  const params = new URLSearchParams(location.search);
  const patientIdFromUrl = params.get('patientId');
  
  const [formData, setFormData] = useState({
    patient_id: patientIdFromUrl ? parseInt(patientIdFromUrl) : '',
    treatment_type: '',
    treatment_date: new Date()
  });
  
  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    // 患者リストを取得
    const patientData = getPatients();
    setPatients(patientData);
    
    // URLパラメータで患者IDが指定されているが、患者が存在しない場合
    if (patientIdFromUrl && !patientData.some(p => p.id === parseInt(patientIdFromUrl))) {
      setErrors({
        patient_id: '指定された患者IDは存在しません'
      });
    }
  }, [getPatients, patientIdFromUrl]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // 入力時にエラーをクリア
    if (errors[name]) {
      setErrors(prevState => ({
        ...prevState,
        [name]: null
      }));
    }
  };
  
  const handleDateChange = (date) => {
    setFormData(prevState => ({
      ...prevState,
      treatment_date: date
    }));
    
    // 日付エラーをクリア
    if (errors.treatment_date) {
      setErrors(prevState => ({
        ...prevState,
        treatment_date: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // 患者は必須
    if (!formData.patient_id) {
      newErrors.patient_id = '患者を選択してください';
    }
    
    // 治療タイプは必須
    if (!formData.treatment_type) {
      newErrors.treatment_type = '治療タイプを選択してください';
    }
    
    // 日付は必須
    if (!formData.treatment_date) {
      newErrors.treatment_date = '日付を入力してください';
    } else if (formData.treatment_date > new Date()) {
      newErrors.treatment_date = '未来の日付は選択できません';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 日付をYYYY-MM-DD形式に変換
      const formattedData = {
        ...formData,
        treatment_date: formData.treatment_date.toISOString().split('T')[0]
      };
      
      const newTreatment = addTreatment(formattedData);
      
      if (newTreatment) {
        setSuccess(true);
        
        // フォームをリセット（患者IDはURLから取得した場合は維持）
        setFormData({
          patient_id: patientIdFromUrl ? parseInt(patientIdFromUrl) : '',
          treatment_type: '',
          treatment_date: new Date()
        });
        
        // 3秒後に患者詳細ページに遷移
        setTimeout(() => {
          navigate(`/patients/${formData.patient_id}`);
        }, 3000);
      }
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          戻る
        </Button>
        <Typography variant="h4" component="h1">
          治療記録の追加
        </Typography>
      </Box>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          治療記録を追加しました！3秒後に患者詳細ページに移動します...
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.patient_id}>
                <InputLabel id="patient-select-label">患者</InputLabel>
                <Select
                  labelId="patient-select-label"
                  id="patient-select"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  label="患者"
                  disabled={!!patientIdFromUrl}
                  required
                >
                  {patients.map(patient => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.patient_id && (
                  <FormHelperText>{errors.patient_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.treatment_type}>
                <InputLabel id="treatment-type-label">治療タイプ</InputLabel>
                <Select
                  labelId="treatment-type-label"
                  id="treatment-type"
                  name="treatment_type"
                  value={formData.treatment_type}
                  onChange={handleChange}
                  label="治療タイプ"
                  required
                >
                  {TREATMENT_TYPES.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.treatment_type && (
                  <FormHelperText>{errors.treatment_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                <DatePicker
                  label="治療日"
                  value={formData.treatment_date}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.treatment_date}
                      helperText={errors.treatment_date}
                      required
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  size="large"
                >
                  登録する
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default AddTreatment;

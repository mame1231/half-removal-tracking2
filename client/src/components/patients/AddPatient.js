import React, { useState } from 'react';
import { 
  Container, Typography, Paper, TextField, Button, 
  Grid, Box, Alert, Snackbar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function AddPatient() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addPatient } = useData();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
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
  
  const validateForm = () => {
    const newErrors = {};
    
    // 氏名は必須
    if (!formData.name.trim()) {
      newErrors.name = '氏名は必須です';
    }
    
    // メールアドレスの形式チェック（入力されている場合）
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }
    
    // 電話番号の形式チェック（入力されている場合）
    if (formData.phone && !/^[0-9\-+]+$/.test(formData.phone)) {
      newErrors.phone = '電話番号は数字とハイフンのみ使用できます';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const newPatient = addPatient(formData);
      
      if (newPatient) {
        setSuccess(true);
        
        // フォームをリセット
        setFormData({
          name: '',
          phone: '',
          email: '',
          notes: ''
        });
        
        // 3秒後に患者一覧ページに遷移
        setTimeout(() => {
          navigate('/patients');
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
          新規患者登録
        </Typography>
      </Box>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          患者を登録しました！3秒後に患者一覧ページに移動します...
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="氏名"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="phone"
                label="電話番号"
                fullWidth
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="例: 090-1234-5678"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="メールアドレス"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="例: example@mail.com"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="備考"
                fullWidth
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="患者に関する備考や特記事項を入力してください"
              />
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

export default AddPatient;

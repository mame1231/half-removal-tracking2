import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, 
  Box, Divider, CardHeader, List, ListItem, 
  ListItemText, ListItemSecondaryAction, IconButton 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';

const COLORS = ['#8e24aa', '#00bcd4', '#ffc107', '#4caf50', '#f44336'];

function Dashboard() {
  const { getPatients, getPatientTreatments } = useData();
  const [patients, setPatients] = useState([]);
  const [treatmentStats, setTreatmentStats] = useState([]);
  const [recentTreatments, setRecentTreatments] = useState([]);

  useEffect(() => {
    // 患者データを取得
    const patientData = getPatients();
    setPatients(patientData);

    // 治療の統計データを集計
    const allTreatments = patientData.flatMap(patient => 
      getPatientTreatments(patient.id).map(treatment => ({
        ...treatment,
        patientName: patient.name
      }))
    );

    // 治療タイプごとのカウントを計算
    const treatmentTypeCount = allTreatments.reduce((acc, treatment) => {
      acc[treatment.treatment_type] = (acc[treatment.treatment_type] || 0) + 1;
      return acc;
    }, {});

    // チャート用のデータフォーマットに変換
    const chartData = Object.entries(treatmentTypeCount).map(([name, value]) => ({
      name,
      value
    }));
    setTreatmentStats(chartData);

    // 最近の治療（日付順）
    const sortedTreatments = [...allTreatments].sort(
      (a, b) => new Date(b.treatment_date) - new Date(a.treatment_date)
    );
    setRecentTreatments(sortedTreatments.slice(0, 5));
  }, [getPatients, getPatientTreatments]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ダッシュボード
      </Typography>

      <Grid container spacing={3}>
        {/* 総患者数 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                登録患者数
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                <Typography variant="h3">{patients.length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 総治療数 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                累計治療回数
              </Typography>
              <Typography variant="h3">
                {treatmentStats.reduce((acc, item) => acc + item.value, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 半額適用数 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                半額適用対象（治療タイプ）
              </Typography>
              <Typography variant="h3">
                {/* ここは実装により異なるかもしれないので、暫定の値を表示 */}
                {patients.length > 0 ? Math.floor(patients.length / 2) : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 治療タイプ円グラフ */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="治療タイプ分布" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {treatmentStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={treatmentStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {treatmentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}回`, '治療回数']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="textSecondary">データがありません</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 最近の治療 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="最近の治療" />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List>
                {recentTreatments.length > 0 ? (
                  recentTreatments.map((treatment) => (
                    <React.Fragment key={treatment.id}>
                      <ListItem>
                        <ListItemText
                          primary={treatment.patientName}
                          secondary={`${treatment.treatment_type} - ${treatment.treatment_date}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            component={RouterLink}
                            to={`/patients/${treatment.patient_id}`}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="治療データがありません" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;

/**
 * LocalStorageDataService.js
 * バックエンドなしで動作するためのデータサービス
 * LocalStorageを使用してデータを保存・取得する
 */

const LocalStorageDataService = {
  // 初期データセットアップ
  initializeIfEmpty: () => {
    if (!localStorage.getItem('patients')) {
      localStorage.setItem('patients', JSON.stringify([
        { id: 1, name: '山田花子', phone: '090-1234-5678', email: 'hanako@example.com', notes: '敏感肌', created_at: new Date().toISOString() },
        { id: 2, name: '鈴木太郎', phone: '080-8765-4321', email: 'taro@example.com', notes: '予約時間に遅れることが多い', created_at: new Date().toISOString() },
        { id: 3, name: '佐藤由美', phone: '070-2468-1357', email: 'yumi@example.com', notes: '', created_at: new Date().toISOString() }
      ]));
    }
    
    if (!localStorage.getItem('treatments')) {
      const now = new Date();
      const treatments = [
        // 山田花子のトリートメント
        ...generateTreatments(1, '全身脱毛（顔、うなじ、VIO込み）', 5, 30),
        ...generateTreatments(1, '女性顔脱毛', 2, 60, 150),
        
        // 鈴木太郎のトリートメント
        ...generateTreatments(2, '全身脱毛（顔、うなじ、VIO込み）', 2, 30),
        ...generateTreatments(2, '男性ひげ脱毛', 3, 30, 60),
        
        // 佐藤由美のトリートメント
        ...generateTreatments(3, '女性顔脱毛', 11, 30)
      ];
      
      localStorage.setItem('treatments', JSON.stringify(treatments));
    }
  },
  
  // 患者データ取得
  getPatients: () => {
    return JSON.parse(localStorage.getItem('patients') || '[]');
  },
  
  // 特定の患者を取得
  getPatient: (id) => {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    return patients.find(p => p.id === parseInt(id));
  },
  
  // 新しい患者を追加
  addPatient: (patient) => {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
    const newPatient = { 
      ...patient, 
      id: newId, 
      created_at: new Date().toISOString() 
    };
    patients.push(newPatient);
    localStorage.setItem('patients', JSON.stringify(patients));
    return newPatient;
  },
  
  // 患者情報を更新
  updatePatient: (id, patient) => {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const index = patients.findIndex(p => p.id === parseInt(id));
    
    if (index !== -1) {
      patients[index] = { ...patients[index], ...patient };
      localStorage.setItem('patients', JSON.stringify(patients));
      return patients[index];
    }
    return null;
  },
  
  // 患者のすべての治療を取得
  getPatientTreatments: (patientId) => {
    const treatments = JSON.parse(localStorage.getItem('treatments') || '[]');
    return treatments.filter(t => t.patient_id === parseInt(patientId))
      .sort((a, b) => new Date(b.treatment_date) - new Date(a.treatment_date));
  },
  
  // 患者の治療サマリーを取得
  getPatientTreatmentSummary: (patientId) => {
    const treatments = JSON.parse(localStorage.getItem('treatments') || '[]');
    const patientTreatments = treatments.filter(t => t.patient_id === parseInt(patientId));
    
    // 集計
    const treatmentCounts = patientTreatments.reduce((acc, treatment) => {
      acc[treatment.treatment_type] = (acc[treatment.treatment_type] || 0) + 1;
      return acc;
    }, {});
    
    // 全身脱毛と顔脱毛のカウント
    let fullBodyCount = treatmentCounts['全身脱毛（顔、うなじ、VIO込み）'] || 0;
    let faceCount = treatmentCounts['女性顔脱毛'] || 0;
    let beardCount = treatmentCounts['男性ひげ脱毛'] || 0;
    
    // 全身脱毛の場合は顔脱毛のカウントにも追加（全身には顔も含まれるため）
    faceCount += fullBodyCount;
    
    // 割引ステータスの決定
    const fullBodyDiscount = fullBodyCount >= 6 ? '半額適用' : '通常価格';
    const faceDiscount = faceCount >= 11 ? '半額適用' : '通常価格';
    const beardDiscount = beardCount >= 11 ? '半額適用' : '通常価格';
    
    return {
      treatments: {
        '全身脱毛（顔、うなじ、VIO込み）': {
          count: fullBodyCount,
          discount: fullBodyDiscount
        },
        '女性顔脱毛': {
          count: treatmentCounts['女性顔脱毛'] || 0, // 単独の顔脱毛のみ
          totalFaceCount: faceCount, // 合計カウント
          discount: faceDiscount
        },
        '男性ひげ脱毛': {
          count: beardCount,
          discount: beardDiscount
        }
      }
    };
  },
  
  // 新しい治療を追加
  addTreatment: (treatment) => {
    const treatments = JSON.parse(localStorage.getItem('treatments') || '[]');
    const newId = treatments.length > 0 ? Math.max(...treatments.map(t => t.id)) + 1 : 1;
    
    // 日付が指定されていない場合は現在の日付を使用
    const newTreatment = { 
      ...treatment, 
      id: newId,
      treatment_date: treatment.treatment_date || new Date().toISOString().split('T')[0]
    };
    
    treatments.push(newTreatment);
    localStorage.setItem('treatments', JSON.stringify(treatments));
    return newTreatment;
  },
  
  // 治療を削除
  deleteTreatment: (id) => {
    const treatments = JSON.parse(localStorage.getItem('treatments') || '[]');
    const filteredTreatments = treatments.filter(t => t.id !== parseInt(id));
    
    if (filteredTreatments.length < treatments.length) {
      localStorage.setItem('treatments', JSON.stringify(filteredTreatments));
      return true;
    }
    return false;
  }
};

// サンプル治療データを生成するヘルパー関数
function generateTreatments(patientId, type, count, daysInterval, startDaysAgo = 30) {
  const treatments = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(now.getDate() - startDaysAgo + (i * daysInterval));
    
    treatments.push({
      id: Math.floor(Math.random() * 10000) + 1,
      patient_id: patientId,
      treatment_type: type,
      treatment_date: date.toISOString().split('T')[0]
    });
  }
  
  return treatments;
}

export default LocalStorageDataService;

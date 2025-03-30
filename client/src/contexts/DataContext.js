import React, { createContext, useContext, useEffect } from 'react';
import LocalStorageDataService from '../services/LocalStorageDataService';

// データコンテキストを作成
const DataContext = createContext();

// データプロバイダーコンポーネント
export const DataProvider = ({ children }) => {
  // コンポーネントマウント時にLocalStorageを初期化
  useEffect(() => {
    LocalStorageDataService.initializeIfEmpty();
  }, []);

  // データサービスの関数をすべて提供
  const value = {
    // 患者関連
    getPatients: LocalStorageDataService.getPatients,
    getPatient: LocalStorageDataService.getPatient,
    addPatient: LocalStorageDataService.addPatient,
    updatePatient: LocalStorageDataService.updatePatient,
    
    // 治療関連
    getPatientTreatments: LocalStorageDataService.getPatientTreatments,
    getPatientTreatmentSummary: LocalStorageDataService.getPatientTreatmentSummary,
    addTreatment: LocalStorageDataService.addTreatment,
    deleteTreatment: LocalStorageDataService.deleteTreatment,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// カスタムフックを作成して簡単にアクセスできるようにする
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;

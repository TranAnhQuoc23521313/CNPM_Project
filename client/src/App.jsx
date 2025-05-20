// src/App.jsx
import React from 'react';
// import Layout from './components/layout/Layout'; // KHÔNG CẦN IMPORT LAYOUT Ở ĐÂY NỮA
import AppRoutes from './routes/AppRoutes';
import './App.css'; // CSS chung của App

function App() {
  return (
    <div className="App"> {/* Container gốc của ứng dụng */}
      <AppRoutes /> {/* Chỉ render AppRoutes */}
    </div>
  );
}

export default App;
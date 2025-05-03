// src/App.jsx
import React from 'react';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    // NO BrowserRouter HERE
    <div className="App">
      <Layout headerTitle="Cinema Management">
        <AppRoutes /> {/* This renders the page */}
      </Layout>
    </div>
    // NO BrowserRouter HERE
  );
}
export default App;
import React from 'react';
import { Routes, Route , Navigate } from 'react-router-dom';
import MoviesPage from '../pages/Movies/MoviesPage.jsx';
import ShowtimesPage from '../pages/Showtimes/Showtimes.jsx';
import ItemsPage from '../pages/Items/Items.jsx';
import HomeDefault from '../pages/Home';

const PlaceholderPage = ({ title = "Page" }) => (
  <div style={{ padding: '2rem', border: '1px dashed #ccc', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>This page is under construction.</p>
  </div>
);


const NotFound = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>404 - Page Not Found</h2>
    <p>Sorry, the page you requested could not be found.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      
      {/*<Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomeDefault />} />*/}
    
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/showtimes" element={<ShowtimesPage />} />
      <Route path="/items" element={<ItemsPage />} />
      <Route path="*" element={<NotFound />} />
      
    </Routes>
  );
};

export default AppRoutes;

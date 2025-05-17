// src/routes/AppRoutes.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import your page components
//import Dashboard from '../pages/Dashboard';
import MoviesPage from '../pages/Movies/Movies.jsx'; // Using the simplified version for now
import ShowtimesPage from '../pages/Showtimes/Showtimes.jsx';
import ItemsPage from '../pages/Items/Items.jsx';
import Employees from '../pages/Employees/Employees.jsx';
import Customers from '../pages/Customers/Customers.jsx';
// import Tickets from '../pages/Tickets';
// import Users from '../pages/Users';

// A simple component to display for pages not yet created
const PlaceholderPage = ({ title = "Page" }) => (
  <div style={{ padding: '2rem', border: '1px dashed #ccc', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>This page is under construction.</p>
  </div>
);

// A simple component for 404 Not Found
const NotFound = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>404 - Page Not Found</h2>
    <p>Sorry, the page you requested could not be found.</p>
  </div>
);


const AppRoutes = () => {
  return (
    <Routes>
      {/* Default route */}
      {/* <Route path="/" element={<Dashboard />} /> */}

      {/* Route for the Movies page */}
      {/* This currently points to the simplified MoviesPage */}
      <Route path="/movies" element={<MoviesPage />} />
      {/* Placeholder routes for other pages */}
      {/* Replace PlaceholderPage with actual components when ready */}
      { <Route path="/showtimes" element={<ShowtimesPage />} />
      /*<Route path="/tickets" element={<PlaceholderPage title="Tickets" />} />
      <Route path="/users" element={<PlaceholderPage title="Users" />} /> */}
      <Route path="/items" element={<ItemsPage />} />
      <Route path="/staffs" element={<Employees />} />
      <Route path="/customers" element={<Customers />} />
      {/* Catch-all route for any paths not matched above */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
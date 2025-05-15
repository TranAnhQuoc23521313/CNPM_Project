
import Footer from '../components/common/footer';
import { Toolbar } from '@mui/material';
import {  Routes, Route } from 'react-router-dom';
import ListFilmFeature from '../pages/FilmFeature';
import Header from '../components/layout/Header';
//import CinemaManagementPage from './pages/CinemaManagementPage';

function AppRoutes() {
  return (
      <div className="App">
        <Header />
        <Toolbar />
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            paddingTop: '2rem',
            backgroundColor: '#000',
            minHeight: '100vh',
          }}
        >
          <Routes>
            <Route path="/" element={<ListFilmFeature />} />
            {/* Trang cinema-management */}
            {/*<Route path="/cinemamanagement" element={<CinemaManagementPage />*/}
          </Routes>
          <Footer />
        </div>
      </div>
    
  );
}

export default AppRoutes;

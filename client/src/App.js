import './App.css';
import Header from './components/Header';
import Footer from './components/footer';
import { Toolbar } from '@mui/material';
import {  Routes, Route } from 'react-router-dom';
import ListFilmFeature from './features/FilmFeature/page';
//import CinemaManagementPage from './pages/CinemaManagementPage';

function App() {
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

export default App;

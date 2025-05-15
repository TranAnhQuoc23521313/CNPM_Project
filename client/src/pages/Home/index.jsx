
import { Toolbar } from '@mui/material';
import React from 'react';
import '../../App.css';
import Footer from '../../components/common/footer';
import Header from '../../components/layout/Header/index';
import { useNavigate } from 'react-router-dom';
import ListFilmFeature from '../FilmFeature';
function HomeDefault() {
  const navigate = useNavigate();
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
       <ListFilmFeature />
        <Footer />
    </div>  
    
    </div>
  );
}
export default HomeDefault;

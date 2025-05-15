import React from 'react';
import { useSelector } from 'react-redux';
import HomeDefault from './pages/Home';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';

function App() {
  const isLoggedIn = useSelector(state => !!state.user.current);

  return (
     <div>
      {!isLoggedIn ? (
        <HomeDefault />  
      ) : (
        <Layout headerTitle="Cinema Management">
          <AppRoutes />  
        </Layout>
      )}
     </div>
  );
}

export default App;

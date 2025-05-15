import React from 'react';
import PropTypes from 'prop-types';

const Film = ({ film }) => {
  return (
    <div style={{ width: 200, backgroundColor: '#111', color: '#fff', borderRadius: 8, overflow: 'hidden' }}>
      <img src={film.url} alt={film.name} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
      <p style={{ padding: '8px', textAlign: 'center' }}>{film.name}</p>
    </div>
  );
};

Film.propTypes = {
  film: PropTypes.object.isRequired,
};

export default Film;

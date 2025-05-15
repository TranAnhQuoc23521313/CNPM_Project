import React from 'react';
import PropTypes from 'prop-types';
import Film from '../Film';
const FilmList = ({ filmlist }) => {
  return (
    <div className="filmlist" style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '1rem 0' }}>
      {filmlist.map((film) => (
        <div key={film.id} style={{ display: 'inline-block', marginRight: '30px' }}>
          <Film film={film} />
        </div>
      ))}
    </div>
  );
};

FilmList.propTypes = {
  filmlist: PropTypes.array.isRequired,
};

export default FilmList;

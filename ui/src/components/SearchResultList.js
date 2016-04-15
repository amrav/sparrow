import React, { PropTypes } from 'react';
import SearchResult from './SearchResult';

const SearchResultList = ({searchResults}) => (
    <ul>
      {searchResults.map((sr, idx)=>
        <li key={sr.tth}>
          <SearchResult {...sr}/>
        </li>
      )}
    </ul>
);

SearchResultList.propTypes = {
    searchResults: PropTypes.arrayOf(PropTypes.shape(
        SearchResult.propTypes
    )).isRequired
};

export default SearchResultList;

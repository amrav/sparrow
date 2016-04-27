import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SearchResultList from './SearchResultList';

const SearchWindowComp = ({searchText, tths}) => (
    <div>
      <div><h1>Search results: "{searchText}"</h1></div>
      <SearchResultList tths={tths} />
    </div>
);

const mapStateToProps = (state, { searchText }) => {
    return {
        tths: state.searches.getIn([searchText, 'results'])
    };
};

SearchWindowComp.propTypes = {
    searchText: PropTypes.string.isRequired,
    tths: PropTypes.arrayOf(PropTypes.string).isRequired
};

const SearchWindow = connect(
    mapStateToProps
)(SearchWindowComp);

export default SearchWindow;

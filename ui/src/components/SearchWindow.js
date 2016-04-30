import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SearchResultList from './SearchResultList';
import ImmutablePropTypes from 'react-immutable-proptypes';

const SearchWindowComp = ({tths}) => (
    <div>
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
    tths: ImmutablePropTypes.setOf(PropTypes.string).isRequired
};

const SearchWindow = connect(
    mapStateToProps
)(SearchWindowComp);

export default SearchWindow;

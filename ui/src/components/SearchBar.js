import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { fetchSearchResults, newTabMaybe, focusTab } from '../actions';

const submit = ({searchText}, dispatch) => {
    dispatch(fetchSearchResults(searchText));
    dispatch(newTabMaybe(`Search results: ${searchText}`, 'search', searchText));
    dispatch(focusTab('search', searchText));
};

const SearchBarComp = ({fields: {searchText}, handleSubmit}) => (
    <div>
      <form onSubmit={handleSubmit(submit)}>
        <input
           type="text"
           placeholder="Search"
           {...searchText}
        />
      </form>
    </div>
);

SearchBarComp.propTypes = {
    fields: PropTypes.shape({
        searchText: PropTypes.object.isRequired
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired
};

const SearchBar = reduxForm({
    form: 'searchBar',
    fields: ['searchText']
})(SearchBarComp);

export default SearchBar;

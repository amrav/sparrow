import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { fetchSearchResults, newTabMaybe, focusTab } from '../actions';

const submit = ({searchText}, dispatch) => {
    dispatch(fetchSearchResults(searchText));
    dispatch(newTabMaybe(`Search results: ${searchText}`, 'search', searchText));
    dispatch(focusTab('search', searchText));
};

let SearchBarComp = ({fields: {searchText}, handleSubmit}) => (
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

const SearchBar = reduxForm({
    form: 'searchBar',
    fields: ['searchText']
})(SearchBarComp);

export default SearchBar;

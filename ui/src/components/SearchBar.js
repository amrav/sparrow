import React, { PropTypes } from 'react';
import Radium from 'radium';
import { reduxForm } from 'redux-form';
import { fetchSearchResults, newTabMaybe, focusTab } from '../actions';

const submit = ({searchText}, dispatch) => {
    dispatch(fetchSearchResults(searchText));
    dispatch(newTabMaybe(`Search results: ${searchText}`, 'search', searchText));
    dispatch(focusTab('search', searchText));
};

const colors = {
    ss: '#99B898',
    cs: '#FECEA8',
    cdg: '#2A363B',
    cc: '#FF847C',
    mj: '#E84A5F'
};

const styles = {
    base: {
        width: '100%',
        top: 0,
        position: 'fixed',
        backgroundColor: '#FFF',
        height: '100px',
        borderBottom: '1px #DDD solid',
        textAlign: 'center'
    },
    searchBox: {
        position: 'absolute',
        right: '350px',
        margin: '10px',
        fontSize: '2em',
        padding: '10px',
        borderRadius: '10px',
        border: '1px solid #ccc',
        outline: 'none',
        fontWeight: 300,
        ':focus': {
            border: '1px solid ' + colors.cs,
            borderRadius: '10px',
            outline: 'none',
            boxShadow: '0px 0px 2px 0px ' + colors.cs
        },
        width: '500px',
        marginTop: '20px'
    }
};

const SearchBarComp = Radium(({fields: {searchText}, handleSubmit}) => (
    <div style={styles.base}>
      <form onSubmit={handleSubmit(submit)}>
        <input
           type="text"
           placeholder="Search"
           {...searchText}
           style={styles.searchBox}
        />
      </form>
    </div>
));

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

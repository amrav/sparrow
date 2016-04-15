import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SearchResultList from './SearchResultList';

const SearchWindowComp = ({searchText, results}) => (
    <div>
      <div><h1>Search results: "{searchText}"</h1></div>
      <SearchResultList searchResults={results} />
    </div>
);

const searchTextToResults = (state, searchText) => {
    const search = state.searches[searchText];
    const tthToUsers = (tth) => {
        let users = [];
        for (let nick of Object.keys(state.files[tth].users)) {
            users.push({
                nick: nick,
                filenames: state.files[tth].users[nick]
            });
        }
        return users;
    };
    return search.results.map((tth) => {
        let users = tthToUsers(tth);
        return {
            tth: tth,
            users: users,
            displayName: users[0].filenames[0],
            size: state.files[tth].size
        };
    });
};

const mapStateToProps = (state, { searchText }) => {
    return {
        results: searchTextToResults(state, searchText)
    };
};

const SearchWindow = connect(
    mapStateToProps
)(SearchWindowComp);

export default SearchWindow;

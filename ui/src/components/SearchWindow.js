import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SearchResultList from './SearchResultList';

const SearchWindowComp = ({searchText, results}) => (
    <div>
      <div><h1>Search results: "{searchText}"</h1></div>
      <SearchResultList searchResults={results} />
    </div>
);

const humanFileSize = (bytes) => {
    let thresh = 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    let units = ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
};

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
    const tthToDisplayName = (tth) => {
        let names = [];
        let frequencies = {};
        let mostFrequent = null;
        for (let nick of Object.keys(state.files[tth].users)) {
            for (let path of state.files[tth].users[nick]) {
                let parts = path.split('\\');
                let name = parts[parts.length - 1];
                if (!frequencies.hasOwnProperty(name)) {
                    frequencies[name] = 1;
                } else {
                    frequencies[name] += 1;
                }
                if (mostFrequent === null || frequencies[name] > mostFrequent.value) {
                    mostFrequent = {value: frequencies[name], name: name};
                }
            }
        }
        return mostFrequent.name;
    };
    return search.results.map((tth) => {
        let users = tthToUsers(tth);
        return {
            tth: tth,
            users: users,
            displayName: tthToDisplayName(tth),
            size: humanFileSize(state.files[tth].size)
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

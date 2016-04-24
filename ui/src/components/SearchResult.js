import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import TableRow from 'material-ui/lib/table/table-row';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import { makeTthToDisplayName, makeTthToUsers, makeHumanFileSize } from '../selectors';
import DownloadButton from './DownloadButton';

const SearchResultComp = ({tth, displayName, users, size, onDownload}) => (
    <TableRow hoverable={true}>
      <TableRowColumn>{displayName}</TableRowColumn>
      <TableRowColumn>
        {truncate(users)}
      </TableRowColumn>
      <TableRowColumn>{size}</TableRowColumn>
      <TableRowColumn><DownloadButton tth={tth}></DownloadButton></TableRowColumn>
    </TableRow>
);

SearchResultComp.propTypes = {
    tth: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(PropTypes.string).isRequired,
    size: PropTypes.string.isRequired
};

const truncate = (usernames) => {
    let str = usernames.slice(0, 5).join(', ');
    if (usernames.length > 5) {
        str += ', …';
    }
    return str;
};

const makeMapStateToProps = () => {
    const tthToDisplayName = makeTthToDisplayName();
    const tthToUsers = makeTthToUsers();
    const humanFileSize = makeHumanFileSize();
    const mapStateToProps = (state, props) => {
        return {
            displayName: tthToDisplayName(state, props),
            users: tthToUsers(state, props),
            size: humanFileSize(state, props)
        };
    };
    return mapStateToProps;
};

const SearchResult = connect(
    makeMapStateToProps
)(SearchResultComp);

export default SearchResult;

import React, { PropTypes } from 'react';
import SearchResult from './SearchResult';
import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableBody from 'material-ui/lib/table/table-body';
import ImmutablePropTypes from 'react-immutable-proptypes';

const SearchResultList = ({tths}) => (
    <Table selectable={false}>
      <TableHeader displaySelectAll={false}>
        <TableRow>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Users</TableHeaderColumn>
          <TableHeaderColumn>Size</TableHeaderColumn>
          <TableHeaderColumn>Download</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tths.map((tth)=>
          <SearchResult key={tth} tth={tth}/>
        )}
      </TableBody>
    </Table>
);

SearchResultList.propTypes = {
    tths: ImmutablePropTypes.listOf(PropTypes.string).isRequired
};

export default SearchResultList;

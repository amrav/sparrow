import React, { PropTypes } from 'react';
import SearchResult from './SearchResult';
import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableBody from 'material-ui/lib/table/table-body';

const SearchResultList = ({searchResults}) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Users</TableHeaderColumn>
          <TableHeaderColumn>Size</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody>
        {searchResults.map((sr, idx)=>
          <SearchResult key={sr.tth} {...sr}/>
        )}
      </TableBody>
    </Table>
);

SearchResultList.propTypes = {
    searchResults: PropTypes.arrayOf(PropTypes.shape(
        SearchResult.propTypes
    )).isRequired
};

export default SearchResultList;

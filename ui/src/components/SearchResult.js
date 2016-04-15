import React, { PropTypes } from 'react';

const SearchResult = ({tth, displayName, users, size}) => (
    <div>
      <div>{displayName}</div>
      <div>
        <ul>
          {users.map((user, idx)=>
            <li key={user.nick}>{user.nick}</li>
          )}
        </ul>
      </div>
      <div>
        <ul>
        {users.map((user, idx)=>
          <li key={user.nick}>{user.filenames}</li>
        )}
        </ul>
      </div>
    </div>
);

const debug = (obj) => {
    console.log('Users: ', obj);
    return obj;
};

SearchResult.propTypes = {
    tth: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(PropTypes.shape({
        nick: PropTypes.string.isRequired,
        filenames: PropTypes.arrayOf(PropTypes.string).isRequired
    })).isRequired,
    size: PropTypes.number.isRequired
};

export default SearchResult;

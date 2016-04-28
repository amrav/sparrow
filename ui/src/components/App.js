import React from 'react';
import TabWindow from './TabWindow';
import SearchBar from './SearchBar';
import NavPane from './NavPane';

/*const mainContentStyle = {
    marginLeft:
 }*/

const styles = {
    noMargin: {
        margin: "0px",
        padding: "0px"
    },
    main: {
        display: 'block',
        overflow: 'hidden',
        boxSizing: 'border-box',
        marginLeft: '350px'
    },
    base: {
        fontFamily: 'Lato, "Open Sans"'
    }
};

const App = () => (
/*    <div className="container-fluid" style={styles.noMargin}>
      <div className="row">
        <NavPane />
        <div className="col-md-10" style={styles.noMargin}>
          <SearchBar />
          <TabWindow />
        </div>
      </div>
 </div> */
    <div style={styles.base}>
      <NavPane />
      <div style={styles.main}>
        <SearchBar />
        <TabWindow />
      </div>
    </div>
);

export default App;

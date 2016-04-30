import React from 'react';
// import TabWindow from './TabWindow';
import MainPane from './MainPane';
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
        display: 'flex',
        boxSizing: 'border-box',
        margin: '0px 0px 0px 350px',
        height: '100vh'
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
        <MainPane />
      </div>
    </div>
);

export default App;

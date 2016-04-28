import React from 'react';
import Radium from 'radium';

const styles = {
    ul: {
        listStyleType: "none",
        margin: 0,
        padding: 0,
        width: "100%",
        backgroundColor: '#f1f1f1'
    },
    a: {
        display: "block",
        color: '#000',
        padding: '8px 0 8px 16px',
        textDecoration: 'none',
        ':hover': {
            backgroundColor: '#555',
            color: 'white'
        }
    },
    menuItem: {
        padding: "20px"
    },
    pane: {
        height: '100%',
        backgroundColor: '#f61',
        position: 'fixed',
        top: 0,
        width: '350px',
        margin: 0,
        padding: 0,
        overflow: 'scroll'
    },
    noMargin: {
        margin: "0px",
        padding: "0px"
    }
};

const items = ['item1', 'item2', 'item3', 'item1', 'item2', 'item3'];

const NavPane = () => (
    <div className="col-md-2" style={{...styles.noMargin, ...styles.pane}}>
      <ul style={styles.ul}>
        <h2 style={styles.menuItem}>Sparrow</h2>
        {items.map((item, idx) => (
         <li key={idx} style={styles.menuItem}>
            <a href="#" key={idx} style={styles.a}>
             {item}
            </a>
          </li>
        ))}
      </ul>
     </div>
);

export default Radium(NavPane);

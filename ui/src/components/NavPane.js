import React from 'react';
import Radium from 'radium';
import color from 'color';

const colors = {
    ss: '#99B898',
    cs: '#FECEA8',
    cdg: '#2A363B',
    cc: '#FF847C',
    mj: '#E84A5F'
};

const styles = {
    ul: {
        listStyleType: "none",
        margin: 0,
        padding: 0,
        width: "100%",
        backgroundColor: colors.cdg
    },
    li: {
        color: '#CCC',
        ':hover': {
            backgroundColor: color(colors.cdg).lighten(0.2).hslString(),
            color: '#CCC'
        },
        padding: 0
    },
    a: {
        display: "block",
        color: 'inherit',
        padding: '10px 10px 10px 30px',
        textDecoration: 'none',
        margin: 0
    },
    menuItem: {
        padding: "10px"
    },
    pane: {
        height: '100%',
        backgroundColor: colors.cdg,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '350px',
        margin: 0,
        padding: 0,
        overflow: 'scroll',
        color: '#CCC'
    },
    noMargin: {
        margin: "0px",
        padding: "0px"
    },
    banner: {
        color: '#EEE',
        fontFamily: '"Bariol Regular", Lato',
        fontWeight: 300,
        marginLeft: '20px',
        fontSize: '2em'
    },
    sectionHeader: {
        padding: '8px 0 8px 16px',
        fontSize: '1em',
        textTransform: 'uppercase',
        marginTop: '40px',
        color: '#DDD',
        fontFamily: 'Lato',
        fontWeight: 300
    },
    active: {
        color: '#FFF',
        backgroundColor: colors.mj,
        ':hover': {}
    }
};

const items = {
    'Chat Messages': ['Hub', 'PtokaX'],
    'Searches': ['pirates of the caribbean', 'game of thrones'],
    'Downloads': ['Game of Thrones - S06E01 - The Red Woman (720p) (25.04.16) [Cipher].mkv']
};

const keys = ['Chat Messages', 'Searches', 'Downloads'];

const styleElem = (key, idx) => {
    let st = {
        ...styles.menuItem,
        ...styles.li
    };
    if (key === 'Chat Messages' && idx === 0) {
        return {...st, ...styles.active};
    } else {
        return st;
    }
};

const NavPane = () => (
    <div className="col-md-2" style={{...styles.noMargin, ...styles.pane}}>
      <ul style={styles.ul}>
        <h2 style={{...styles.menuItem, ...styles.banner}}>Sparrow</h2>
        {keys.map((key, idx) => (
            <div key={key}>
              <h3 style={styles.sectionHeader}>{key}</h3>
              {items[key].map((item, idx) => (
                  <li key={'li' + key + idx} style={styleElem(key, idx)}>
                    <a href="#" key={idx} style={styles.a}>
                      {item}
                    </a>
                  </li>
              ))}
            </div>
        ))}
      </ul>
     </div>
);

export default Radium(NavPane);

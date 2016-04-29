import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Radium from 'radium';
import color from 'color';
import ImmutablePropTypes from 'react-immutable-proptypes';

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
        color: '#CCC',
        fontWeight: 300
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

const styleTabItem = (tab, focusedTab) => {
    const st = {
        ...styles.menuItem,
        ...styles.li
    };
    if (tab === focusedTab) {
        return {...st, ...styles.active};
    } else {
        return st;
    }
};

const NavPaneComp = ({ messageTabs, focused }) => (
    <div className="col-md-2" style={{...styles.noMargin, ...styles.pane}}>
        <h2 style={{...styles.menuItem, ...styles.banner}}>Sparrow</h2>
        <div>
          <h3 style={styles.sectionHeader}>Messages</h3>
          <ul style={styles.ul}>
          {messageTabs.map((tab, idx) => (
              <li key={'li' + tab.get('name') + idx} style={styleTabItem(tab, focused)}>
                  <a href="#" key={idx} style={styles.a}>
                    {tab.get('name')}
                  </a>
              </li>
          ))}
          </ul>
        </div>
    </div>
);

const tabShape = {
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired
};

NavPaneComp.propTypes = {
    messageTabs: ImmutablePropTypes.listOf(
        ImmutablePropTypes.mapContains(tabShape)
    ).isRequired,
    focused: ImmutablePropTypes.mapContains(tabShape).isRequired
};

const mapStateToProps = (state) => {
    return {
        messageTabs: state.tabs.get('messageTabs'),
        focused: state.tabs.get('focused')
    };
};

const NavPane = connect(
    mapStateToProps
)(Radium(NavPaneComp));

export default NavPane;

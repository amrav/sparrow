import React, { PropTypes } from 'react';
import color from 'color';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Radium from 'radium';

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
        padding: "10px"
    },
    a: {
        display: "block",
        color: 'inherit',
        padding: '10px 10px 10px 30px',
        textDecoration: 'none',
        margin: 0
    },
    active: {
        color: '#FFF',
        backgroundColor: colors.mj,
        ':hover': {}
    },
    sectionHeader: {
        padding: '8px 0 8px 16px',
        fontSize: '1em',
        textTransform: 'uppercase',
        marginTop: '40px',
        color: '#DDD',
        fontFamily: 'Lato',
        fontWeight: 300
    }
};

const styleTabLink = (tab, focusedTab) => {
    if (tab === focusedTab) {
        return {...styles.li, ...styles.active};
    } else {
        return styles.li;
    }
};


const NavPaneSection = ({header, tabs, onLinkClick, focused}) => (
    <div>
      <h3 style={styles.sectionHeader}>{header}</h3>
      <ul style={styles.ul}>
        {tabs.map((tab, idx) => (
            <li key={'li' + tab.get('name') + idx} style={styleTabLink(tab, focused)}>
              <a href={"#"} key={idx} style={styles.a} onClick={onLinkClick(tab)}>
                {tab.get('name')}
              </a>
            </li>
        ))}
      </ul>
    </div>
);

const tabShape = {
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired
};

NavPaneSection.propTypes = {
    header: PropTypes.string.isRequired,
    tabs: ImmutablePropTypes.listOf(
        ImmutablePropTypes.mapContains(tabShape)
    ).isRequired,
    focused: ImmutablePropTypes.mapContains(tabShape),
    onLinkClick: PropTypes.func.isRequired
};

export default Radium(NavPaneSection);

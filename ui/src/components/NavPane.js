import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Radium from 'radium';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { focusTab } from '../actions';
import NavPaneSection from './NavPaneSection';

const colors = {
    ss: '#99B898',
    cs: '#FECEA8',
    cdg: '#2A363B',
    cc: '#FF847C',
    mj: '#E84A5F'
};

const styles = {
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
    banner: {
        color: '#EEE',
        fontFamily: '"Bariol Regular", Lato',
        fontWeight: 300,
        marginLeft: '20px',
        fontSize: '2em',
        padding: "10px"
    }
};

const NavPaneComp = ({ messageTabs, searchTabs, focused, onLinkClick }) => (
    <div style={styles.pane}>
      <h2 style={styles.banner}>Sparrow</h2>
      {messageTabs.size > 0 &&
          <NavPaneSection
                 tabs={messageTabs}
                 focused={focused}
                 onLinkClick={onLinkClick}
                 header={"Messages"} />
      }
      {searchTabs.size > 0 &&
          <NavPaneSection
                 tabs={searchTabs}
                 focused={focused}
                 onLinkClick={onLinkClick}
                 header={"Searches"} />
      }
    </div>
);

NavPaneComp.propTypes = {
    searchTabs: ImmutablePropTypes.listOf(ImmutablePropTypes.map).isRequired,
    messageTabs: ImmutablePropTypes.listOf(ImmutablePropTypes.map).isRequired,
    // focused isn't *required* because there may be no tabs at some point
    focused: ImmutablePropTypes.map,
    onLinkClick: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    return {
        messageTabs: state.tabs.get('messageTabs'),
        searchTabs: state.tabs.get('search'),
        focused: state.tabs.get('focused')
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onLinkClick: (tab) => {
            return (e) => {
                dispatch(focusTab(tab.get('type'), tab.get('key')));
                e.preventDefault();
            };
        }
    };
};

const NavPane = connect(
    mapStateToProps,
    mapDispatchToProps
)(Radium(NavPaneComp));

export default NavPane;

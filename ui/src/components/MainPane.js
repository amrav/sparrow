import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getMainWindow } from '../selectors/tabs';
import { findDOMNode } from 'react-dom';

const styles = {
    base: {
        margin: "100px 0px 70px 0px",
        overflowY: 'scroll',
        height: 'auto'
    }
};

class MainPaneComp extends React.Component {
    constructor(props) {
        super(props);
        this.scrollPosition = {};
    }
    componentWillUpdate() {
        const node = findDOMNode(this);
        this.scrollPosition[this.props.componentKey] = node.scrollTop;
    }
    componentDidUpdate() {
        if (this.scrollPosition.hasOwnProperty(this.props.componentKey)) {
            let node = findDOMNode(this);
            node.scrollTop = this.scrollPosition[this.props.componentKey];
        }
    }
    render() {
        return (
            <div style={styles.base}>
              {this.props.component}
            </div>
        );
    }
}

MainPaneComp.propTypes = {
    component: PropTypes.element.isRequired,
    componentKey: PropTypes.string.isRequired
};

const mapStateToProps = (state) => {
    const props = getMainWindow(state);
    return {
        component: props.component,
        componentKey: props.key
    };
};

const MainPane = connect(
    mapStateToProps
)(MainPaneComp);

export default MainPane;

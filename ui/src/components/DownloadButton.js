import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import { makeDownloadFile } from '../actions';

const DownloadButtonComp = ({onClick}) => (
    <a href="#" onClick={onClick}>
        Download
    </a>
);

const mapDispatchToProps = (dispatch, props) => {
    return {
        onClick: (e) => {
            e.preventDefault();
            dispatch(makeDownloadFile(props.tth));
        }
    };
};

DownloadButtonComp.propTypes = {
    onClick: PropTypes.func.isRequired
};

const DownloadButton = connect(
    null,
    mapDispatchToProps
)(DownloadButtonComp);

export default DownloadButton;

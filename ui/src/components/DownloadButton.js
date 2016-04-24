import { connect } from 'react-redux';
import React from 'react';
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

const DownloadButton = connect(
    null,
    mapDispatchToProps
)(DownloadButtonComp);

export default DownloadButton;

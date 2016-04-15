import React, { PropTypes } from 'react';

const msgStyle = {
    whiteSpace: 'pre'
};

const ChatMessage = ({from, text}) => (
    <li style={msgStyle}>
      <strong><em>{from}:</em></strong> {text}
    </li>
);

ChatMessage.propTypes = {
    from: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
};

export default ChatMessage;

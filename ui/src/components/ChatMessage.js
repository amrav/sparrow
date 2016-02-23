import React, { PropTypes } from 'react';

const ChatMessage = ({from, text}) => (
    <li>
      <em>{from}:</em> {text}
    </li>
);

ChatMessage.propTypes = {
    from: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
};

export default ChatMessage;

import React, { PropTypes } from 'react';

const msgStyle = {
    whiteSpace: 'pre'
};

const toHtml = (text) => {
    return text.split("\n").map((line, idx) => (
        <span key={idx}>
          {line}
          <br />
        </span>
    ));
};

const ChatMessage = ({from, text}) => (
    <li style={msgStyle}>
      <em>{from}:</em> {text}
    </li>
);

ChatMessage.propTypes = {
    from: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
};

export default ChatMessage;

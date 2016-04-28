import React, { PropTypes } from 'react';

const styles = {
    li: {
        whiteSpace: 'pre-wrap',
        marginRight: '40px'
    }
};

const ChatMessage = ({from, text}) => (
    <li style={styles.li}>
      <strong><em>{from}:</em></strong> <span style={styles.text}>{text}</span>
    </li>
);

ChatMessage.propTypes = {
    from: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
};

export default ChatMessage;

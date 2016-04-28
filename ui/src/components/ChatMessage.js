import React, { PropTypes } from 'react';

const styles = {
    li: {
        whiteSpace: 'pre-wrap',
        margin: '40px 40px 0px 0px'
    },
    time: {
        color: '#BBB',
        fontSize: '0.8em',
        fontWeight: 200,
        marginLeft: '10px'
    }
};

const ChatMessage = ({from, text, time}) => (
    <li style={styles.li}>
      <strong>{from}</strong> <span style={styles.time}>{time}</span>
      <div style={styles.text}>
        {text}
      </div>
    </li>
);

ChatMessage.propTypes = {
    from: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired
};

export default ChatMessage;

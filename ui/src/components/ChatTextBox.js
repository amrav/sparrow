import React from 'react';

const styles = {
    base: {
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: 0,
        margin: '0px 0px 0px 0px',
        textAlign: 'center',
        width: 'auto',
        backgroundColor: '#FFF',
        height: '60px',
        marginLeft: '350px'
    },
    input: {
        position: 'absolute',
        top: '0px',
        bottom: '10px',
        fontSize: '1.5em',
        padding: '5px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        outline: 'none',
        fontWeight: 300,
        marginLeft: 'auto',
        marginRight: 'auto',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '95%'
    }
};

const ChatTextBox = () => (
    <div style={styles.base}>
      <input type="text" style={styles.input}/>
    </div>
);

export default ChatTextBox;

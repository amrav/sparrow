import React, { PropTypes } from 'react';
import ChatMessage from './ChatMessage';

const ChatMessageList = ({chatMessages}) => (
    <ul>
      {chatMessages.map((msg, idx)=>
        <ChatMessage {...msg} key={idx}/>
      )}
    </ul>
);


ChatMessageList.propTypes = {
    chatMessages: PropTypes.arrayOf(PropTypes.shape(
        ChatMessage.propTypes
    ).isRequired).isRequired
};

export default ChatMessageList;

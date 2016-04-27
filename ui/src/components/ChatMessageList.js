import React, { PropTypes } from 'react';
import ChatMessage from './ChatMessage';
import ImmutablePropTypes from 'react-immutable-proptypes';

const ChatMessageList = ({chatMessages}) => (
    <ul>
      {chatMessages.map((msg, idx)=>
        <ChatMessage {...msg} key={idx}/>
      )}
    </ul>
);

ChatMessageList.propTypes = {
    chatMessages: ImmutablePropTypes.listOf(PropTypes.shape(
        ChatMessage.propTypes
    )).isRequired
};

export default ChatMessageList;

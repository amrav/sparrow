import React, { PropTypes } from 'react';
import ChatMessageList from './ChatMessageList';
import ChatTextBox from './ChatTextBox';

const ChatWindow = ({chatMessages}) => (
    <div>
      <ChatMessageList chatMessages={chatMessages} />
      <ChatTextBox />
      <div></div>
    </div>
);

ChatWindow.propTypes = {
    ...ChatMessageList.propTypes.chatMessages
};

export default ChatWindow;

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ChatMessageList from './ChatMessageList';
import ChatTextBox from './ChatTextBox';

const ChatWindowComp = ({chatMessages}) => (
    <div>
      <ChatMessageList chatMessages={chatMessages} />
      <ChatTextBox />
    </div>
);

ChatWindowComp.propTypes = {
    chatMessages: ChatMessageList.propTypes.chatMessages
};

const mapStateToProps = (state) => {
    return {
        chatMessages: state.getIn(['messages', 'hub_messages']).toJS()
    };
};

const ChatWindow = connect(
    mapStateToProps
)(ChatWindowComp);

export default ChatWindow;

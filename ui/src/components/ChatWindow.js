import React, { PropTypes } from 'react';
import ChatMessageList from './ChatMessageList';
import ChatTextBox from './ChatTextBox';
import { connect } from 'react-redux';

const ChatWindow = ({chatMessages}) => (
    <div>
      <ChatMessageList chatMessages={chatMessages} />
      <ChatTextBox />
      <div></div>
    </div>
);

const mapStateToProps = (state, props) => {
    let messages;
    if (props.messagesKey === 'hubMessages') {
        messages = state.messages.get('hubMessages');
    } else {
        messages = state.messages.getIn(['privateMessages', props.messagesKey]) || [];
    }
    return {
        chatMessages: messages,
        ...props
    };
};

ChatWindow.propTypes = {
    chatMessages: ChatMessageList.propTypes.chatMessages,
    messagesKey: PropTypes.string.isRequired
};

export default connect(
    mapStateToProps
)(ChatWindow);

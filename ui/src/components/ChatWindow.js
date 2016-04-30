import React, { PropTypes } from 'react';
import ChatMessageList from './ChatMessageList';
import ChatTextBox from './ChatTextBox';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { findDOMNode } from 'react-dom';

const styles = {

};

class ChatWindowComp extends React.Component {
    // this.shouldScrollBottom holds logic for whether the chat window
    // should be scrolled when a new message arrives.
    // TODO: Fix because scroll position is held by MainPane, not this
    // component.
    componentWillUpdate() {
        const node = findDOMNode(this);
        this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
    }
    componentDidUpdate() {
        if (this.shouldScrollBottom) {
            const node = findDOMNode(this);
            node.scrollTop = node.scrollHeight;
        }
    }
    render() {
        return (
            <div style={styles.base}>
              <ChatMessageList chatMessages={this.props.chatMessages} />
              <ChatTextBox />
              <div></div>
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    let messages;
    if (props.messagesKey === 'hubMessages') {
        messages = state.messages.get('hubMessages');
    } else {
        messages = state.messages.getIn(['privateMessages', props.messagesKey]) || fromJS([]);
    }
    return {
        chatMessages: messages,
        ...props
    };
};

ChatWindowComp.propTypes = {
    chatMessages: ChatMessageList.propTypes.chatMessages,
    messagesKey: PropTypes.string.isRequired
};

const ChatWindow = connect(
    mapStateToProps
)(ChatWindowComp);

export default ChatWindow;

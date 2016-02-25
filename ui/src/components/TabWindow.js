import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ChatWindow from './ChatWindow.js';

const TabWindowComp = ({chatThreads, activeTabs}) => (
    <Tabs>
      <TabList>
        {activeTabs.map((key) =>
          <Tab key={key}>{key}</Tab>
        )}
      </TabList>
      {activeTabs.map((key) =>
        <TabPanel key={key}>
          <ChatWindow chatMessages={chatThreads[key]} />
        </TabPanel>
      )}
    </Tabs>
);

TabWindowComp.propTypes = {
    chatThreads: PropTypes.shape({
        hubMessages: ChatWindow.propTypes.chatMessages
    }).isRequired,
    activeTabs: PropTypes.arrayOf(PropTypes.string).isRequired
};

const mapStateToProps = (state) => {
    return {
        chatThreads: {
            hubMessages: state.messages.hubMessages,
            ...state.messages.privateMessages
        },
        activeTabs: state.messages.activeTabs
    };
};

const TabWindow = connect(
    mapStateToProps
)(TabWindowComp);

export default TabWindow;

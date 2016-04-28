import React from 'react';
import { createSelector } from 'reselect';
import ChatWindow from '../components/ChatWindow.js';
import SearchWindow from '../components/SearchWindow.js';

const getTabs = (state) => state.tabs;

// TODO: Investigate whether this is the best way to generate
// tabbed windows. Currently, this recreates props on every tab select.
export const selectTabs = createSelector(
    [getTabs],
    (tabs) => {
        let focused = tabs.get('focused');
        let tab = tabs.get('tabList')
                .find(x =>
                      x.get('type') === focused.type &&
                      x.get('key') === focused.key);
        if (tabs.get('tabList').size === 0) {
            return <p></p>;
        }
        if (!tab) {
            tab = tabs.get('tabList').first();
        }
        if (tab.get('type') === 'hubMessages') {
            return <ChatWindow messagesKey={'hubMessages'} />;
        } else if (tab.get('type') === 'privateMessages') {
            return <ChatWindow messagesKey={tab.get('key')} />;
        } else if (tab.get('type') === 'search') {
            return <SearchWindow searchText={tab.get('key')}/>;
        } else {
            throw new Error('unknown tab type');
        }
    }
);

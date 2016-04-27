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
        let compTabs = [];
        tabs.get('tabList').map(tab => {
            const elem = {
                name: tab.get('name'),
                key: tab.get('key')
            };
            if (tab.get('type') === 'hubMessages') {
                elem.comp = <ChatWindow messagesKey={'hubMessages'} />;
            } else if (tab.get('type') === 'privateMessages') {
                elem.comp = <ChatWindow messagesKey={elem.key || []} />;
            } else if (tab.get('type') === 'search') {
                elem.comp = <SearchWindow searchText={elem.key}/>;
            } else {
                throw new Error('unknown tab type');
            }
            compTabs.push(elem);
        });
        return compTabs;
    }
);

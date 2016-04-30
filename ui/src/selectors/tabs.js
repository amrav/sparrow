import React from 'react';
import { createSelector } from 'reselect';
import ChatWindow from '../components/ChatWindow.js';
import SearchWindow from '../components/SearchWindow.js';

const getFocusedTab = (state) => state.tabs.get('focused');

// TODO: Investigate whether this is the best way to generate
// tabbed windows. Currently, this recreates props on every tab select.
export const getMainWindow = createSelector(
    [getFocusedTab],
    (focused) => {
        if (!focused) {
            return {
                key: '#',
                component: <div></div>
            };
        }
        const ret = {
            key: focused.get('type') + '#' + focused.get('key')
        };
        if (focused.get('type') === 'hubMessages') {
            return {
                ...ret,
                component: <ChatWindow messagesKey={'hubMessages'} />
            };
        } else if (focused.get('type') === 'privateMessages') {
            return {
                ...ret,
                component: <ChatWindow messagesKey={focused.get('key')} />
            }
        } else if (focused.get('type') === 'search') {
            return {
                ...ret,
                component: <SearchWindow searchText={focused.get('key')}/>
            }
        } else {
            throw new Error('unknown tab type');
        }
    }
);

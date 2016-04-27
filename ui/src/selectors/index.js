/* eslint-disable no-unreachable */

import { createSelector } from 'reselect';
import { fromJS } from 'immutable';
import { profiler } from '../instrumentation';

const getFilesForTth = (state, props) => state.files.get(props.tth);
const getUsersForTth = (state, props) => state.files.has(props.tth) ?
          state.files.getIn([props.tth, 'users']) : fromJS({});
const getSizeForTth = (state, props) => state.files.getIn([props.tth, 'size']);
const getTth = (state, props) => props.tth;

// let fileMemo = {};

export const makeTthToDisplayName = () => {
    return createSelector(
        getTth, getFilesForTth,
        (tth, files) => {
            let timer = profiler.start('tthToDisplayName');
            files = files.toJS();
            // fileMemo[tth] = files;
            let frequencies = {};
            let mostFrequent = null;
            for (let nick of Object.keys(files.users)) {
                for (let path of files.users[nick]) {
                    let parts = path.split('\\');
                    let name = parts[parts.length - 1];
                    // Short circuit
                    timer.stop('tthToDisplayName');
                    return name;
                    if (!frequencies.hasOwnProperty(name)) {
                        frequencies[name] = 1;
                    } else {
                        frequencies[name] += 1;
                    }
                    if (mostFrequent === null || frequencies[name] > mostFrequent.value) {
                        mostFrequent = {value: frequencies[name], name};
                    }
                }
            }
            return mostFrequent.name;
        }
    );
};

export const makeTthToUsers = () => {
    return createSelector(
        [getTth, getUsersForTth],
        (tth, users) => {
            let timer = profiler.start('tthToUsers');
            users = users.toJS();
            // short circuit
            timer.stop('tthToUsers');
            return Object.keys(users);
            for (let nick of Object.keys(users)) {
                users.push({
                    nick,
                    filenames: users[nick]
                });
            }
            // console.log('Computed users: ', users);
            return users;
        }
    );
};

export const makeHumanFileSize = () => {
    return createSelector(
        [getSizeForTth],
        (bytes) => {
            let thresh = 1024;
            if(Math.abs(bytes) < thresh) {
                return bytes + ' B';
            }
            let units = ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
            let u = -1;
            do {
                bytes /= thresh;
                ++u;
            } while(Math.abs(bytes) >= thresh && u < units.length - 1);
            return bytes.toFixed(1)+' '+units[u];
        }
    );
};

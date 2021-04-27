import {Post} from 'mattermost-redux/types/posts';

import {id as pluginID} from '../manifest';

function getPluginState(state) {
    return state['plugins-' + pluginID] || {};
}

export function getActivePost(state): Post | null {
    return getPluginState(state).activePost;
}

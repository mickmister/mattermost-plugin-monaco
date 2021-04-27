import {Post} from 'mattermost-redux/types/posts';

import ActionTypes from './action_types';

export function setActivePost(post: Post | null) {
    return {
        type: ActionTypes.SET_ACTIVE_POST,
        data: post,
    };
}

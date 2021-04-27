import {combineReducers} from 'redux';

import {Post} from 'mattermost-redux/types/posts';
import {GenericAction} from 'mattermost-redux/types/actions';

import ActionTypes from './action_types';

function activePost(state: Post | null = null, action: GenericAction) {
    switch (action.type) {
        case ActionTypes.SET_ACTIVE_POST:
            return action.data;
        default:
            return state;
    }
}

export default combineReducers({
    activePost,
});

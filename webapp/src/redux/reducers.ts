import {combineReducers} from 'redux';

import {Post} from 'mattermost-redux/types/posts';
import {GenericAction} from 'mattermost-redux/types/actions';

import ActionTypes from './action_types';
import {EditorState} from 'types/editor_types';

function activePost(state: Post | null = null, action: GenericAction) {
    switch (action.type) {
        case ActionTypes.SET_ACTIVE_POST:
            return action.data;
        default:
            return state;
    }
}

function editorModalState(state: EditorState | null = null, action: GenericAction) {
    switch (action.type) {
        case ActionTypes.SHOW_EDITOR_MODAL:
            return action.data;
        case ActionTypes.HIDE_EDITOR_MODAL:
            return null;
        default:
            return state;
    }
}

type UserPreferences = {
    theme: string;
}

function userPreferences(state: UserPreferences = {theme: 'vs-dark'}, action: GenericAction) {
    switch (action.type) {
        case ActionTypes.SET_MONACO_THEME:
            return {
                ...state,
                theme: action.data,
            };
        case ActionTypes.SET_USER_PREFERENCES:
            return action.data;
        default:
            return state;
    }
}

export default combineReducers({
    activePost,
    editorModalState,
    userPreferences,
});

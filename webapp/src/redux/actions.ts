import {Post} from 'mattermost-redux/types/posts';
import {Client4} from 'mattermost-redux/client';

import ActionTypes from './action_types';
import {getEditorModalState, getUserPreferences} from './selectors';
import {EditorState} from 'types/editor_types';

const preferencesRoute = '/plugins/monaco-editor/preferences';

export function setActivePost(post: Post | null) {
    return {
        type: ActionTypes.SET_ACTIVE_POST,
        data: post,
    };
}

export function showEditorModal(editorState: EditorState, onSubmit: (text: string) => void) {
    return {
        type: ActionTypes.SHOW_EDITOR_MODAL,
        data: {
            editorState,
            onSubmit,
        },
    };
}

export function closeEditorModal(text: string) {
    return (dispatch, getState) => {
        const modalState = getEditorModalState(getState());

        modalState?.onSubmit(text);

        return dispatch({
            type: ActionTypes.HIDE_EDITOR_MODAL,
        });
    };
}

export function setMonacoTheme(theme: string) {
    return async (dispatch, getState) => {
        dispatch({
            type: ActionTypes.SET_MONACO_THEME,
            data: theme,
        });

        const preferences = getUserPreferences(getState());
        const body = {
            ...preferences,
            theme,
        };

        const options = await Client4.getOptions({
            method: 'POST',
            body: JSON.stringify(body),
        });


        fetch(preferencesRoute, options);
    }
}

export function fetchAndSetPreferences() {
    return async (dispatch) => {
        const preferences = await fetch(preferencesRoute).then(r => r.json());

        return dispatch({
            type: ActionTypes.SET_USER_PREFERENCES,
            data: preferences,
        });
    }
}

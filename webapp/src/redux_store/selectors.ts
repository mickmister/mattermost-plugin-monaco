import {EditorState, UserPreferences} from 'types/monaco_plugin_types';

import {id as pluginID} from 'manifest';

function getPluginState(state) {
    return state['plugins-' + pluginID] || {};
}

export function getEditorModalState(state): {editorState: EditorState, onTextChange: (text: string) => void} | null {
    return getPluginState(state).editorModalState;
}

export function getUserPreferences(state): UserPreferences {
    return getPluginState(state).userPreferences;
}

export function getMonacoTheme(state): string {
    return getUserPreferences(state).theme;
}
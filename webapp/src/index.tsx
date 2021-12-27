import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';

import manifest from './manifest';

import {PluginRegistry} from './types/mattermost-webapp';

import reducers from './redux/reducers';
import {fetchAndSetPreferences} from './redux/actions';

import CustomEditor from './components/custom_editor/custom_editor';
import CustomEditorModal from './components/custom_editor_modal/custom_editor_modal';

export default class Plugin {
    store: Store<GlobalState, Action<Record<string, unknown>>> = null as any;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry | any, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        this.store = store;

        try {
            registry.registerReducer(reducers);
        } catch (e) {
            console.error(e);
        }

        this.store.dispatch(fetchAndSetPreferences());

        registry.registerRootComponent(CustomEditorModal);

        registry.registerCustomEditorComponent(
            'Code Editor',
            CustomEditor,
        )
    }

}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

const p = new Plugin();

window.registerPlugin(manifest.id, p);

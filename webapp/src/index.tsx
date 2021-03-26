import React from 'react';
import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {Post} from 'mattermost-redux/types/posts';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import manifest from './manifest';

// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from './types/mattermost-webapp';

// import 'monaco-editor/min/vs/loader';
import MonacoEditor from '@monaco-editor/react';

import './monaco.scss';
import FullScreenModal from './full_screen_modal/full_screen_modal';

export default class Plugin {
    setActivePost = (post: Post) => {};

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry | any, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        // @see https://developers.mattermost.com/extend/plugins/webapp/reference/
        registry.registerRootComponent(Editor);

        registry.registerPostDropdownMenuAction('Edit as code', (postID: string) => {
            const post = getPost(store.getState(), postID);
            this.setActivePost(post);
        }, () => true);
    }
}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

const p = new Plugin();

window.registerPlugin(manifest.id, p);

const Editor: React.FC = () => {
    const [activePost, setActivePost] = React.useState<Post | null>(null);
    p.setActivePost = setActivePost;

    const [theme, setTheme] = React.useState('vs-dark');

    const toggleTheme = () => {
        const newTheme = theme === 'vs-dark' ? 'light' : 'vs-dark';
        setTheme(newTheme);
    }

    const close = () => setActivePost(null);
    return (
        <FullScreenModal
            show={Boolean(activePost)}
            onClose={close}
        >
            <div>
                {/* <button onClick={toggleTheme}>{'Toggle Theme'}</button> */}
                <div style={{
                    paddingTop: '45px',
                    paddingLeft: '28%',
                    paddingRight: '28%',
                }}>
                    <MonacoEditor
                        height='90vh'
                        defaultLanguage='markdown'
                        defaultValue={activePost?.message || ''}
                        theme={theme}
                    />
                </div>
            </div>
        </FullScreenModal>
    );
}

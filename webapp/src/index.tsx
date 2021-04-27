import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {Post} from 'mattermost-redux/types/posts';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {canEditPost} from 'mattermost-redux/utils/post_utils';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import manifest from './manifest';

import {PluginRegistry} from './types/mattermost-webapp';

import reducers from './redux/reducers';
import {setActivePost} from './redux/actions';

import EditorModal from './components/editor/editor_modal';

const canEdit = (state: GlobalState, post: Post): boolean => {
    const config = state.entities.general.config;
    const license = state.entities.general.license;
    const userId = getCurrentUserId(state);
    const channel = getChannel(state, post.channel_id);
    const teamId = channel.team_id || '';

    return canEditPost(state, config, license, teamId, post.channel_id, userId, post);
}

export default class Plugin {
    store: Store<GlobalState, Action<Record<string, unknown>>> = null as any;
    setActivePost = (post: Post) => {};

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry | any, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        this.store = store;
        registry.registerReducer(reducers);


        // @see https://developers.mattermost.com/extend/plugins/webapp/reference/
        registry.registerRootComponent(EditorModal);

        registry.registerPostDropdownMenuAction('Edit as code', (postID: string) => {
            const post = getPost(store.getState(), postID);
            this.store.dispatch(setActivePost(post));
        }, (postID: string) => {
            if (!postID) {
                return false;
            }
            const state = store.getState();
            const post = getPost(state, postID);
            if (!post) {
                return false;
            }

            return canEdit(state, post);
        });

        window.addEventListener('keydown', this.keyBindingListener);
    }

    public async uninitialize() {
        window.removeEventListener('keydown', this.keyBindingListener);
    }

    keyBindingListener = (event: KeyboardEvent) => {
        if (event.key !== 'Enter' && event.key !== 'j') {
            return;
        }

        const cls = '.a11y--focused';
        const focused = document.querySelector(cls);
        if (!focused) {
            return;
        }

        if (focused.getAttribute('data-testid') !== 'postView') {
            return;
        }

        const postID = focused.id.split('_')[1];

        if (event.key === 'j') {
            this.store.dispatch({
                type: 'jira_open_create_modal',
                data: {
                    postId: postID,
                },
            });
            return;
        }


        const post = getPost(this.store.getState(), postID);
        this.setActivePost(post);
    }
}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

const p = new Plugin();

window.registerPlugin(manifest.id, p);

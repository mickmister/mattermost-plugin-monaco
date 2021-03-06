import React from 'react';
import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {Post} from 'mattermost-redux/types/posts';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {canEditPost} from 'mattermost-redux/utils/post_utils';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import manifest from './manifest';

// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from './types/mattermost-webapp';

import FullScreenModal from './full_screen_modal/full_screen_modal';
import Editor from './editor';

const canEdit = (state: GlobalState, post: Post): boolean => {
    const config = state.entities.general.config;
    const license = state.entities.general.license;
    const userId = getCurrentUserId(state);
    const channel = getChannel(state, post.channel_id);
    const teamId = channel.team_id || '';

    return canEditPost(state, config, license, teamId, post.channel_id, userId, post);
}

export default class Plugin {
    setActivePost = (post: Post) => {};

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry | any, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        // @see https://developers.mattermost.com/extend/plugins/webapp/reference/
        registry.registerRootComponent(EditorModal);

        registry.registerPostDropdownMenuAction('Edit as code', (postID: string) => {
            const post = getPost(store.getState(), postID);
            this.setActivePost(post);
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
    }
}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

const p = new Plugin();

window.registerPlugin(manifest.id, p);

const EditorModal: React.FC = () => {
    const [activePost, setActivePost] = React.useState<Post | null>(null);
    p.setActivePost = setActivePost;

    if (!activePost) {
        return null;
    }

    const close = () => setActivePost(null);
    return (
        <FullScreenModal
            show={Boolean(activePost)}
            onClose={close}
        >
            <Editor
                post={activePost}
                close={close}
            />
        </FullScreenModal>
    );
};

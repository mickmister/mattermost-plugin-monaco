import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getActivePost} from 'redux_store/selectors';
import {setActivePost} from 'redux_store/actions';

import FullScreenModal from 'components/full_screen_modal/full_screen_modal';

import Editor from './deno_editor';

const EditorModal: React.FC = () => {
    const activePost = useSelector(getActivePost);
    const dispatch = useDispatch();

    if (!activePost) {
        return null;
    }

    const close = () => dispatch(setActivePost(null));
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

export default EditorModal;

import React from 'react';
import {useSelector} from 'react-redux';
import {getEditorModalState} from '../../redux/selectors';

import FullScreenModal from '../full_screen_modal/full_screen_modal';
import CustomEditorModalInner from './custom_editor_modal_inner';

import {EditorState} from '../../types/monaco_plugin_types';

export default function CustomEditorModal() {
    const editorModalState: {editorState: EditorState, onTextChange: (text: string) => void} | null = useSelector(getEditorModalState);

    // need to use openModal

    if (!editorModalState) {
        return null;
    }

    return (
        <FullScreenModal
            show={Boolean(editorModalState)}
            onClose={close}
        >
            <CustomEditorModalInner
                editorModalState={editorModalState}
            />
        </FullScreenModal>
    );
};

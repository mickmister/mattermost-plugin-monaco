import React, {useEffect} from 'react';

import Editor, {useEditorState} from 'components/editor/editor';
import CustomEditorModalInner from 'components/custom_editor_modal/custom_editor_modal_inner';

type Props = {
    value: string;
    onChange: (e: React.ChangeEvent) => void;
    onConfirm: (text: string) => void;
    channelId: string;
    rootId?: string;
    className: string;
}

export default function CustomEditor(props: Props) {
    const [editorState, setEditorState] = useEditorState({
        language: 'markdown',
        content: props.value,
        contentSource: props.value,
    });

    useEffect(() => {
        setEditorState({
            content: props.value,
            contentSource: props.value,
        });
    }, [props.channelId]);

    const onTextChange = React.useCallback((content = '') => {
        setEditorState({content});
        props.onChange({target: {value: content}} as any);
    }, [setEditorState, props.onChange]);

    return (
        <CustomEditorModalInner
            editorModalState={{
                editorState,
                onTextChange,
            }}
        />
    );
}

import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import Editor, {useEditorState} from 'components/editor/editor';

type Props = {
    value: string;
    onChange: (e: React.ChangeEvent) => void;
    onConfirm: (text: string) => void;
}

export default function CustomEditor(props: Props) {
    const [editorState, setEditorState] = useEditorState({
        language: 'markdown',
        content: props.value,
        contentSource: props.value,
    });

    const currentChannelId = useSelector(getCurrentChannelId);

    useEffect(() => {
        setEditorState({
            content: props.value,
            contentSource: props.value,
        });
    }, [currentChannelId]);

    const onTextChange = (content = '') => {
        setEditorState({content});
        props.onChange({target: {value: content}} as any);
    };

    const cancel = () => {
        props.onConfirm(editorState.contentSource);
    };

    const submit = (text: string) => {
        props.onConfirm(text);
    }

    return (
        <Editor
            onTextChange={onTextChange}
            cancel={cancel}
            save={submit}
            showFullScreenButton={true}
            {...props}
            {...editorState}
        />
    )
}

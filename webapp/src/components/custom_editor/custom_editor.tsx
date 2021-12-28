import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import Editor, {useEditorState} from 'components/editor/editor';

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

    const path = props.rootId || props.channelId;

    return (
        <Editor
            onTextChange={onTextChange}
            cancel={cancel}
            save={submit}
            showFullScreenButton={true}
            path={path}
            {...props}
            {...editorState}
        />
    )
}

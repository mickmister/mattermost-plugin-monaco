import React from 'react';

import Editor, {useEditorState} from 'components/editor/editor';

type Props = {
    value: string;
    onChange: (e: React.ChangeEvent) => void;
    onConfirm: (text: string) => void;
}

export default function CustomEditor(props: Props) {
    const language = 'markdown';
    const contentSource = props.value;
    const content = props.value;

    const [editorState, setEditorState] = useEditorState({language, contentSource, content});

    const onTextChange = (content = '') => {
        props.onChange({target: {value: content}} as any);
        setEditorState({content});
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

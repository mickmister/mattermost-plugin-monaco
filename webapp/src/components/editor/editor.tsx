import React, {useEffect, useState} from 'react';

import config from '@monaco-editor/loader/lib/es/config';
config.paths.vs = '/plugins/monaco-editor/public/vs';

import MonacoEditor from '@monaco-editor/react';
import {useDispatch, useSelector} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {showEditorModal} from 'redux_store/actions';
import {EditorState} from 'types/monaco_plugin_types';

import registerAutocomplete from 'components/autocomplete/autocomplete';

import {registerThemes} from 'themes/themes';

export type EditorProps = EditorState & {
    save: (content: string) => void;
    cancel: () => void;
    onTextChange: (content: string) => void;
    showFullScreenButton: boolean;
    path?: string;
}

export default function Editor(props: EditorProps) {
    const [dirty, setDirty] = useState(false);
    const [savedEditor, setEditor] = useState(null);

    const dispatch = useDispatch();

    const theme = useSelector(getTheme) as {codeTheme: string};

    useEffect(() => {
        if (props.content !== props.contentSource && !dirty) {
            setDirty(true);
        }
    }, [props.content]);

    useEffect(() => {
        setDirty(false);
    }, [props.path]);

    useEffect(() => {
        setDirty(false);
    }, [props.save]);

    const showFullScreen = () => {
        dispatch(showEditorModal({
            content: props.content,
            contentSource: props.content,
            language: 'markdown',
        }, (text: string) => {
            props.onTextChange(text);
        }));
    }

    const style: React.CSSProperties = {
        border: 'solid 1px',
    };

    const buttonStyle = {
        cursor: 'pointer',
        margin: '5px',
    };

    const save = () => props.save(props.content);

    const cancel = () => {
        if (dirty) {
            if (!window.confirm('Do you want to lose your unsaved changes?')) {
                return;
            }
        }

        props.cancel();
    }

    const buttons = (
        <div>
            <button
                type='button'
                className='btn btn-primary comment-btn'
                onClick={save}
                style={buttonStyle}
            >
                {'Save'}
            </button>
            <button
                type='button'
                className='btn btn-primary comment-btn'
                onClick={cancel}
                style={buttonStyle}
            >
                {'Cancel'}
            </button>
            {props.showFullScreenButton && (
                <button
                    type='button'
                    className='btn btn-primary comment-btn'
                    onClick={showFullScreen}
                    style={buttonStyle}
                >
                    {'Full Screen'}
                </button>
            )}
        </div>
    );

    const handleEditorWillMount = (monaco: any) => {
        registerThemes(monaco);
        registerAutocomplete(monaco);
    }

    const handleEditorDidMount = (editor: any, monaco: any) => {
        const lines = props.content.split('\n');
        const numLines = lines.length;
        const lastLine = lines[numLines - 1];
        const lastColumnNum = lastLine.length + 1;

        editor.focus();
        editor.setPosition({column: lastColumnNum, lineNumber: numLines});

        setEditor(editor);

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
            props.save(editor.getValue());
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            props.save(editor.getValue());
        });

        // Use this to view all of the key bindings available. You can then disable them like the indent ones below we're disabling.
        // console.log(editor._standaloneKeybindingService._getResolver()._defaultKeybindings);

        // Make it so Cmd+[ and Cmd+] are still able to move the browser to previous and next page
        editor._standaloneKeybindingService.addDynamicKeybinding('-editor.action.indentLines', null, () => {});
        editor._standaloneKeybindingService.addDynamicKeybinding('-editor.action.outdentLines', null, () => {});

        window.myMonaco = monaco;
        window.myEditor = editor;
    };

    const onChange = (text?: string) => {
        props.onTextChange(text || '');
    };

    const editorHeight = getEditorHeight(props.content);
    const monacoEditor = (
        <MonacoEditor
            height={editorHeight}
            theme={theme.codeTheme}
            // theme={'vs-dark'}
            language={props.language}
            value={props.content}
            path={props.path}
            onChange={onChange}
            onMount={handleEditorDidMount}
            beforeMount={handleEditorWillMount}
            options={{
                wordBasedSuggestions: false,
                renderLineHighlight: 'none',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: {
                    bottom: 200,
                },
                minimap: {
                    enabled: false
                },
            }}
        />
    );

    return (
        <div style={style}>
            {buttons}
            <div style={{height: '10px'}}/>
            {monacoEditor}
        </div>
    );
}

export const useEditorState = (initial?: Partial<EditorState>): [EditorState, (newState: Partial<EditorState> | null) => void] => {
    const original = {
        content: '',
        contentSource: '',
        language: 'markdown',
        ...initial,
    };

    const [state, setState] = useState(original);

    return [state, (newState) => setState(previousState => {
        if (!newState) {
            return original;
        }

        return {
            ...previousState,
            ...newState,
        }
    })];
};

const getEditorHeight = (content: string): string => {
    const LINE_HEIGHT = 18;
    const CONTAINER_GUTTER = 10;

    const minHeight = LINE_HEIGHT * 10 + CONTAINER_GUTTER;
    const maxHeight = LINE_HEIGHT * 45 + CONTAINER_GUTTER;

    const numLines = content.split('\n').length;
    const extraLines = 10;
    let editorHeight = (numLines + extraLines) * LINE_HEIGHT;

    editorHeight = Math.max(minHeight, editorHeight);
    editorHeight = Math.min(maxHeight, editorHeight);
    return editorHeight + 'px';
}

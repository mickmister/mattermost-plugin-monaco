import React, {useEffect, useState} from 'react';

import config from '@monaco-editor/loader/lib/es/config';
config.paths.vs = '/plugins/monaco-editor/public/vs';

import MonacoEditor from '@monaco-editor/react';
import {useDispatch, useSelector} from 'react-redux';

import {Client4} from 'mattermost-redux/client'
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {showEditorModal} from '../../redux/actions';
import {EditorState} from '../../types/editor_types';

import registerAutocomplete from '../autocomplete/autocomplete';

// import * as monaco from 'monaco-editor';

export type EditorProps = EditorState & {
    save: (content: string) => void;
    cancel: () => void;
    onTextChange: (content: string) => void;
    showFullScreenButton: boolean;
}

export default function Editor(props: EditorProps) {
    const [dirty, setDirty] = useState(false);

    const dispatch = useDispatch();

    const teamId = useSelector(getCurrentTeamId);
    const autocompleteUsers = (term: string) => Client4.autocompleteUsers(term, teamId, '');
    const autocompleteChannels = (term: string) => Client4.autocompleteChannels(teamId, term);

    const showFullScreen = () => {
        dispatch(showEditorModal({
            content: props.content,
            contentSource: props.content,
            language: 'markdown',
        }, (text: string) => {
            props.onTextChange(text);
        }));
    }

    useEffect(() => {
        if (props.content !== props.contentSource && !dirty) {
            setDirty(true);
        }
    }, [props.content]);

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

    const handleEditorDidMount = (editor: any, monaco: any) => {
        const lines = props.content.split('\n');
        const numLines = lines.length;
        const lastLine = lines[numLines - 1];
        const lastColumnNum = lastLine.length + 1;

        editor.focus();
        editor.setPosition({column: lastColumnNum, lineNumber: numLines});

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
            props.save(editor.getValue());
        });

        // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_ENTER, () => {
        //     props.save(editor.getValue());
        // });

        // this pointer to autocompleteUsers will not have an updated team id if the user switches teams
        // though the component unmounts when the team switches so maybe that's not a problem?

        registerAutocomplete(monaco, autocompleteUsers, autocompleteChannels);
    };

    const onChange = (text?: string) => {
        props.onTextChange(text || '');
    };

    const editorHeight = getEditorHeight(props.content);
    const monacoEditor = (
        <MonacoEditor
            height={editorHeight}
            theme={'vs-dark'}
            language={props.language}
            value={props.content}
            onChange={onChange}
            onMount={handleEditorDidMount}
            options={{
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

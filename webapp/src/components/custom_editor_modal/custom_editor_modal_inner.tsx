import React, {useState} from 'react';
import {useDispatch} from 'react-redux';

import {closeEditorModal} from '../../redux/actions';

import Editor, {EditorProps, useEditorState} from '../editor/editor';
import {EditorState} from '../../types/editor_types';

import RenderedMarkdown from './rendered_markdown';

type Props = {
    editorModalState: {editorState: EditorState, onSubmit: (text: string) => void};
}

export default function CustomEditorModalInner(props: Props) {
    const editorModalState = props.editorModalState;
    const dispatch = useDispatch();

    const [markdownEditorState, setMarkdownEditorState] = useEditorState({...editorModalState.editorState, language: 'markdown'});

    const [codeEditorState, setCodeEditorState] = useEditorState();
    const [savedCodeBlockIndex, setCodeBlockIndex] = useState(-1);

    let editor: React.ReactNode;

    const getCharIndexesFromCodeBlockIndex = (codeBlockIndex: number): [number | undefined, number | undefined] => {
        const matches = Array.from(markdownEditorState.content.matchAll(/```/g));
        const indexes = matches.map(match => match.index);
        const begin = indexes[codeBlockIndex * 2];
        const end = indexes[codeBlockIndex * 2 + 1];

        return [begin, end];
    }

    const setCodeBlockContentInMarkdownContent = (codeBlockContent: string) => {
        const [begin, end] = getCharIndexesFromCodeBlockIndex(savedCodeBlockIndex);

        const markdownContent = markdownEditorState.content;
        const actualBegin = markdownContent.substring(begin).indexOf('\n') + begin;

        const before = markdownContent.substring(0, actualBegin + 1);
        const after = markdownContent.substring(end - 1);

        const newContent = before + codeBlockContent + after;
        setMarkdownEditorState({content: newContent});
    };

    const clickedCodeBlock = (index: number) => {
        const [begin, end] = getCharIndexesFromCodeBlockIndex(index);

        const markdownContent = markdownEditorState.content;
        const actualBegin = markdownContent.substring(begin).indexOf('\n') + begin;

        let language = markdownContent.substring(begin + 3, actualBegin).trim();
        language = languageMap[language] || language;

        const codeBlockContent = markdownContent.substring(actualBegin + 1, end - 1);
        setCodeEditorState({
            content: codeBlockContent,
            contentSource: codeBlockContent,
            language: language || 'markdown',
        });

        setCodeBlockIndex(index);
    }

    const showCodeBlock = savedCodeBlockIndex !== -1;
    if (showCodeBlock) {
        const editorProps: EditorProps = {
            cancel: () => {
                setCodeBlockContentInMarkdownContent(codeEditorState.contentSource);
                setCodeBlockIndex(-1);
                setCodeEditorState(null);
            },
            save: (text: string) => {
                setCodeBlockIndex(-1);
                setCodeEditorState(null);
            },
            showFullScreenButton: false,
            onTextChange: (content: string) => {
                setCodeBlockContentInMarkdownContent(content);
                setCodeEditorState({content});
            },
            ...codeEditorState,
        };

        editor = (
            <Editor
                {...editorProps}
            />
        );
    } else {
        const editorProps: EditorProps = {
            cancel: () => dispatch(closeEditorModal(markdownEditorState.contentSource)),
            save: (text: string) => dispatch(closeEditorModal(text)),
            showFullScreenButton: false,
            onTextChange: (content: string) => setMarkdownEditorState({content}),
            ...markdownEditorState,
        };

        editor = (
            <Editor
                {...editorProps}
            />
        );
    }

    const renderedMarkdown = (
        <RenderedMarkdown
            content={markdownEditorState.content}
            clickedCodeBlock={clickedCodeBlock}
        />
    )

    return (
        <div>
            <h2>
                {showCodeBlock ? 'Code Block Editor' : 'Markdown Editor'}
            </h2>
            <div>
                <div style={{display: 'inline-block', width: '50%', padding: '20px'}}>
                    {editor}
                </div>
                <div style={{display: 'inline-block', width: '50%', padding: '20px', position: 'absolute'}}>
                    {renderedMarkdown}
                </div>
            </div>
        </div>
    );
};

const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
};

import React from 'react';
import {Post} from 'mattermost-redux/types/posts';
import {editPost} from 'mattermost-redux/actions/posts';
import {useDispatch} from 'react-redux';

import config from '@monaco-editor/loader/lib/es/config';
config.paths.vs = '/plugins/monaco-editor/public/vs';

import MonacoEditor, {Monaco} from '@monaco-editor/react';

import monokai from 'monaco-themes/themes/Monokai.json';

type EditorProps = {
    post: Post;
    close: () => void;
}

const Editor: React.FC<EditorProps> = ({post, close}: EditorProps) => {
    const [text, setText] = React.useState<string>(post.message);

    const dispatch = useDispatch();

    const onMount = (editor, monaco: Monaco) => {
        monaco.editor.defineTheme('monokai', monokai);
    };

    const savePost = () => {
        const postToSave = {
            ...post,
            message: text,
        };
        dispatch(editPost(postToSave));
        close();
    }

    const onChange = (text = '') => {
        setText(text);
    }

    const [theme, setTheme] = React.useState('vs-dark');

    const toggleTheme = () => {
        const newTheme = theme === 'vs-dark' ? 'monokai' : 'vs-dark';
        setTheme(newTheme);
    }

    return (
        <div>
            <div style={{
                paddingTop: '35px',
                paddingLeft: '25%',
                paddingRight: '25%',
            }}>
                <div style={{marginBottom: '10px'}}>
                    <button
                        type='button'
                        className={'btn btn-danger'}
                        onClick={close}
                    >
                        {'Cancel'}
                    </button>
                    <button
                        type='button'
                        className={'btn btn-primary'}
                        onClick={toggleTheme}
                    >
                        {'Toggle Theme'}
                    </button>
                    <button
                        type='button'
                        className={'btn btn-primary'}
                        onClick={savePost}
                    >
                        {'Save'}
                    </button>
                </div>

                <MonacoEditor
                    onMount={onMount}
                    height='90vh'
                    defaultLanguage='markdown'
                    value={text}
                    onChange={onChange}
                    theme={theme}
                />
            </div>
        </div>
    );
}

export default Editor;

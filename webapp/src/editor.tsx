import React from 'react';
import {Post} from 'mattermost-redux/types/posts';
import {editPost} from 'mattermost-redux/actions/posts';
import {useDispatch} from 'react-redux';

import MonacoEditor from '@monaco-editor/react';

type EditorProps = {
    post: Post;
    close: () => void;
}

const Editor: React.FC<EditorProps> = ({post, close}: EditorProps) => {
    const [text, setText] = React.useState<string>(post.message);

    const dispatch = useDispatch();
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
        const newTheme = theme === 'vs-dark' ? 'light' : 'vs-dark';
        setTheme(newTheme);
    }

    return (
        <div>
            <div style={{
                paddingTop: '35px',
                paddingLeft: '28%',
                paddingRight: '28%',
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

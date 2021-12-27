import React from 'react';
import {Post} from 'mattermost-redux/types/posts';
import {editPost} from 'mattermost-redux/actions/posts';
import {useDispatch, useSelector} from 'react-redux';

import config from '@monaco-editor/loader/lib/es/config';
config.paths.vs = '/plugins/monaco-editor/public/vs';

import MonacoEditor from '@monaco-editor/react';

import {getMonacoTheme} from '../../redux/selectors';

import ThemePicker from '../editor/theme-picker';
import {setMonacoTheme} from 'redux/actions';

type EditorProps = {
    post: Post;
    close: () => void;
}

const Editor: React.FC<EditorProps> = ({post, close}: EditorProps) => {
    const dispatch = useDispatch();
    const [monaco, setMonaco] = React.useState(null);

    const [code, setCode] = React.useState<string>(unwrapTripleQuotes(post.message));
    const [testData, setTestData] = React.useState<string>(JSON.stringify({
        message: 'Initial message',
    }));
    const [functionResponse, setFunctionResponse] = React.useState<string>(' ');


    const theme = useSelector(getMonacoTheme);
    const setTheme = (t: string) => dispatch(setMonacoTheme(t));

    const savePost = () => {
        const postToSave = {
            ...post,
            message: code,
        };
        dispatch(editPost(postToSave));
        close();
    }

    const runCode = () => {
        setFunctionResponse('Uploading function');
        const payload = {
            code,
            data: JSON.parse(testData),
        };

        fetch('/plugins/matterzap/store-function', {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then(r => r.text()).then(d => {
            setFunctionResponse(d);
            if (d.startsWith('Success')) {
                const postToSave = {
                    ...post,
                    message: wrapInTripleQuotes(code),
                };
                dispatch(editPost(postToSave));
            }
        });
    }

    const onCodeChange = (text = '') => {
        setCode(text);
    }

    const onTestDataChange = (e) => {
        setTestData(e.target.value);
    }

    const onMount = (editor, _monaco) => {
        setMonaco(_monaco);
    }

    return (
        <div>
            <div style={{
                paddingTop: '35px',
                width: '800px',
                maxWidth: '100%',
                margin: '0 auto',
            }}>
                <div style={{marginBottom: '10px'}}>
                    {/* {monaco && (
                        <ThemePicker
                            selectedTheme={theme}
                            selectTheme={setTheme}
                        />
                    )} */}
                </div>

                {/* <textarea
                    value={testData}
                    onChange={onTestDataChange}
                    style={{backgroundColor: 'black'}}
                /> */}

                <pre
                    style={{
                        border: 0,
                        padding: '10px',
                    }}
                >
                    {functionResponse}</pre>

                <div style={{marginBottom: '10px'}}>
                    <button
                        type='button'
                        className={'btn btn-primary'}
                        onClick={close}
                    >
                        {'Cancel'}
                    </button>
                    <button
                        type='button'
                        className={'btn btn-primary'}
                        onClick={savePost}
                        style={{marginLeft: '5px'}}
                    >
                        {'Save'}
                    </button>
                    <button
                        type='button'
                        className={'btn btn-primary'}
                        onClick={runCode}
                        style={{marginLeft: '5px'}}
                    >
                        {'Deploy'}
                    </button>
                </div>

                <MonacoEditor
                    onMount={onMount}
                    height='90vh'
                    defaultLanguage='typescript'
                    // defaultLanguage='markdown'
                    value={code}
                    onChange={onCodeChange}
                    theme={theme}
                />
            </div>
        </div>
    );
}

export default Editor;

const wrapInTripleQuotes = (code: string): string => {
    return '```ts\n' + code + '\n```';
}

const unwrapTripleQuotes = (code: string): string => {
    return code.replace('```ts\n', '').replace('\n```', '');
}

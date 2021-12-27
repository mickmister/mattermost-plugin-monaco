import {Channel} from 'mattermost-redux/types/channels';

export type EditorState = {
    contentSource: string;
    content: string;
    language: string;
}

export type ChannelNamesMap = {
    [name: string]: {
        display_name: string;
        team_name?: string;
    } | Channel;
};

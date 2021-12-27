import React from 'react';
import {useSelector} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {Team} from 'mattermost-redux/types/teams';

import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {ChannelNamesMap} from '../../types/editor_types';

import './rendered_markdown.scss';

type Props = {
    content: string;
    clickedCodeBlock: (index: number) => void;
}

export default function RenderedMarkdown(props: Props) {
    const channelNamesMap = useSelector<GlobalState, ChannelNamesMap>(getChannelsNameMapInCurrentTeam);
    const currentTeam = useSelector(getCurrentTeam);

    const clickedCodeBlock = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement | undefined;
        if (!target) {
            return;
        }

        const postCodeElement = traverseParents(target, 10, (element => Array.from(element.classList).includes('post-code')));
        if (!postCodeElement) {
            return;
        }

        const allCodeBlocks = Array.from(document.querySelectorAll('.monaco-modal-rendered-markdown .post-code'));
        if (!allCodeBlocks.length) {
            return;
        }

        const index = allCodeBlocks.indexOf(postCodeElement);
        if (index === -1) {
            return;
        }

        props.clickedCodeBlock(index);
    }

    const inner = processMarkdownToComponent(props.content, currentTeam, channelNamesMap);

    return (
        <div
            className='monaco-modal-rendered-markdown'
            onClick={clickedCodeBlock}
        >
            {inner}
        </div>
    );
}

const traverseParents = (target: HTMLElement, limit: number, callback: (element: HTMLElement) => boolean) => {
    let element: HTMLElement = target;
    for (let i = 0; i < limit; i++) {
        if (callback(element)) {
            return element;
        }

        if (!element.parentElement) {
            return null;
        }
        element = element.parentElement;
    }

    return null;
}

const processMarkdownToComponent = (text: string, team: Team, channelNamesMap: ChannelNamesMap): React.ReactNode => {
    const {formatText, messageHtmlToComponent} = (window as any).PostUtils;

    // const DEFAULT_OPTIONS: TextFormattingOptions = {
    //     mentionHighlight: true,
    //     disableGroupHighlight: false,
    //     singleline: false,
    //     emoticons: true,
    //     markdown: true,
    //     atMentions: false,
    //     minimumHashtagLength: 3,
    //     proxyImages: false,
    //     editedAt: 0,
    //     postId: '',
    // };

    const markdownOptions = {
        singleline: false,
        mentionHighlight: false,
        atMentions: true,
        team,
        channelNamesMap,
    };

    const formattedText = formatText(text, markdownOptions);

    // * - mentions - If specified, mentions are replaced with the AtMention component. Defaults to true.
    // * - mentionHighlight - If specified, mentions for the current user are highlighted. Defaults to true.
    // * - disableGroupHighlight - If specified, group mentions are not displayed as blue links. Defaults to false.
    // * - emoji - If specified, emoji text is replaced with the PostEmoji component. Defaults to true.
    // * - images - If specified, markdown images are replaced with the image component. Defaults to true.
    // * - imageProps - If specified, any extra props that should be passed into the image component.
    // * - latex - If specified, latex is replaced with the LatexBlock component. Defaults to true.
    // * - imagesMetadata - the dimensions of the image as retrieved from post.metadata.images.
    // * - hasPluginTooltips - If specified, the LinkTooltip component is placed inside links. Defaults to false.
    // * - channelId = If specified, to be passed along to ProfilePopover via AtMention

    const messageToComponentOptions = {
        mentionHighlight: false,
    }

    return messageHtmlToComponent(formattedText, true, messageToComponentOptions);
}

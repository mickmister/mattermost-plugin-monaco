import {Monaco} from '@monaco-editor/react';
import {Store} from 'redux';

import {UserAutocomplete} from 'mattermost-redux/types/autocomplete';
import {Channel} from 'mattermost-redux/types/channels';
import {GlobalState} from 'mattermost-redux/types/store';
import {getCurrentTeamId as getCurrentTeamIdRedux} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId as getCurrentUserIdRedux} from 'mattermost-redux/selectors/entities/users';

import {Client4} from 'mattermost-redux/client';

let savedStore: Store<GlobalState, any>;

export const setStoreForAutocomplete = (store: any) => {
    savedStore = store;
};

const autocompleteUsers = (term: string) => Client4.autocompleteUsers(term, getCurrentTeamId(), '');
const autocompleteChannels = (term: string) => Client4.autocompleteChannels(getCurrentTeamId(), term);

const getCurrentTeamId = (): string => {
    return getCurrentTeamIdRedux(savedStore.getState());
}

const getCurrentUserId = (): string => {
    return getCurrentUserIdRedux(savedStore.getState());
}

let registeredAutocompleteForCurrentEditor = false;
export default function registerAutocomplete(
    monaco: Monaco,
) {
    if (registeredAutocompleteForCurrentEditor) {
        return;
    }
    registeredAutocompleteForCurrentEditor = true;

    if (window.disposeMonacoUserAutocomplete) {
        window.disposeMonacoUserAutocomplete();
    }

    if (window.disposeMonacoChannelAutocomplete) {
        window.disposeMonacoChannelAutocomplete();
    }

    const disposeMonacoUserAutocomplete = registerUserAutocomplete(monaco, autocompleteUsers);
    if (disposeMonacoUserAutocomplete?.dispose) {
        window.disposeMonacoUserAutocomplete = disposeMonacoUserAutocomplete.dispose;
    }

    const disposeMonacoChannelAutocomplete = registerChannelAutocomplete(monaco, autocompleteChannels);
    if (disposeMonacoChannelAutocomplete?.dispose) {
        window.disposeMonacoChannelAutocomplete = disposeMonacoChannelAutocomplete.dispose;
    }
}

const registerUserAutocomplete = (monaco: Monaco, autocompleteUsers: (term: string) => Promise<UserAutocomplete>) => {
    const trigger = '@';
    return monaco.languages.registerCompletionItemProvider('markdown', {
        triggerCharacters: [trigger],
        provideCompletionItems: async (model, position) => {
            const {range, term} = getAutocompleteMetadata(model, position, trigger);
            const data = await autocompleteUsers(term);

            if (!data.users) {
                return {incomplete: true, suggestions: []};
            }

            const users = data.users;

            const usernameLimit = 25;
            const maxUsernameLength =  Math.min(usernameLimit, Math.max(...users.map((u) => u.username.length)));

            const currentUserId = getCurrentUserId();

            return {
                incomplete: true,
                suggestions: users.map((user) => {
                    const usernameDisplay = user.username.substring(0, maxUsernameLength).padEnd(maxUsernameLength, ' ');

                    const userDetailsParts = [];
                    if (user.first_name) {
                        userDetailsParts.push(user.first_name);
                    }
                    if (user.last_name) {
                        userDetailsParts.push(user.last_name);
                    }
                    if (user.id === currentUserId) {
                        userDetailsParts.push('(you)');
                    } else if (user.nickname) {
                        userDetailsParts.push(`(${user.nickname})`);
                    }

                    const userDetailsDisplay = userDetailsParts.join(' ');

                    return {
                        label: `${trigger}${usernameDisplay}  ${userDetailsDisplay}`,
                        insertText: `${trigger}${user.username} `,
                        filterText: `${trigger}${user.username}`,
                        kind: monaco.languages.CompletionItemKind.Function,
                        range: range,
                    };
                }),
            };
        },
    });
}

const registerChannelAutocomplete = (monaco: Monaco, autocompleteChannels: (term: string) => Promise<Channel[]>) => {
    const trigger = '~';
    return monaco.languages.registerCompletionItemProvider('markdown', {
        triggerCharacters: [trigger],
        provideCompletionItems: async (model, position) => {
            const {range, term} = getAutocompleteMetadata(model, position, trigger);
            const channels = await autocompleteChannels(term);

            const displayNameLimit = 30;
            const maxChannelDisplayNameLength = Math.min(displayNameLimit, Math.max(...channels.map((c) => c.display_name.length)));

            return {
                incomplete: true,
                suggestions: channels.map((channel) => {
                    let displayName = channel.display_name.substring(0, maxChannelDisplayNameLength)
                    if (channel.display_name.length > displayNameLimit) {
                        displayName = displayName.substring(0, displayNameLimit - 3) + '...';
                    }

                    displayName = displayName.padEnd(maxChannelDisplayNameLength, ' ');

                    return {
                        label: `${displayName}  ~${channel.name}`,
                        documentation: channel.display_name,
                        insertText: `${trigger}${channel.name} `,
                        filterText: `${trigger}${channel.name}`,
                        kind: monaco.languages.CompletionItemKind.Function,
                        range: range,
                    };
                }),
            };
        },
    });
}

const getAutocompleteMetadata = (model, position, trigger: string) => {
    const line = model.getValueInRange({startLineNumber: position.lineNumber, startColumn: 0, endLineNumber: position.lineNumber, endColumn: position.column});
    const lastAtSymbolIndex = line.lastIndexOf(trigger);
    const termLength = line.length - lastAtSymbolIndex;

    const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: lastAtSymbolIndex + 1,
        endColumn: lastAtSymbolIndex + 1 + termLength,
    };

    const term = line.substring(lastAtSymbolIndex + 1, lastAtSymbolIndex + 1 + termLength);

    return {range, term};
}

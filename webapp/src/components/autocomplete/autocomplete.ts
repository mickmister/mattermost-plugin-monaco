import {UserAutocomplete} from 'mattermost-redux/types/autocomplete';
import {Channel} from 'mattermost-redux/types/channels';

type AutocompleteItem = {
    label: string;
    kind: number;
    insertText: string;
    filterText: string;
    range: Range;
};

type AutocompleteModel = {
    getValueInRange: (range: Range) => string;
};

type Range = {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
};

type AutocompleteConfig = {
    triggerCharacters?: string[];
    provideCompletionItems: (
        model: AutocompleteModel,
        position: {lineNumber: number; column: number},
        token: any
    ) => Promise<{
        suggestions: AutocompleteItem[];
        incomplete: boolean;
    }>
}

type Monaco = {
    languages: {
        registerCompletionItemProvider: (language: string, config: AutocompleteConfig) => void;
        CompletionItemKind: {
            [kind: string]: number;
        };
    };
};

export default function registerAutocomplete(
    monaco: Monaco,
    autocompleteUsers: (term: string) => Promise<UserAutocomplete>,
    autocompleteChannels: (term: string) => Promise<Channel[]>,
) {
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
    if (window.disposeMonacoUserAutocomplete) {
        return;
    }

    const trigger = '@';
    return monaco.languages.registerCompletionItemProvider('markdown', {
        triggerCharacters: [trigger],
        provideCompletionItems: async (model, position) => {
            const {range, term} = getAutocompleteMetadata(model, position, trigger);
            const data = await autocompleteUsers(term);

            return {
                incomplete: true,
                suggestions: data.users.map((user) => ({
                    label: `${trigger}${user.username} (${user.first_name} ${user.last_name})`,
                    insertText: `${trigger}${user.username} `,
                    filterText: `${trigger}${user.username}`,
                    kind: monaco.languages.CompletionItemKind.Function,
                    range: range,
                })),
            };
        },
    });
}

const registerChannelAutocomplete = (monaco: Monaco, autocompleteChannels: (term: string) => Promise<Channel[]>) => {
    if (window.disposeMonacoChannelAutocomplete) {
        return;
    }

    const trigger = '~';
    return monaco.languages.registerCompletionItemProvider('markdown', {
        triggerCharacters: [trigger],
        provideCompletionItems: async (model, position) => {
            const {range, term} = getAutocompleteMetadata(model, position, trigger);
            const data = await autocompleteChannels(term);

            return {
                incomplete: true,
                suggestions: data.map((channel) => ({
                    label: `${trigger}${channel.name} - ${channel.display_name}`,
                    insertText: `${trigger}${channel.name} `,
                    filterText: `${trigger}${channel.name}`,
                    kind: monaco.languages.CompletionItemKind.Function,
                    range: range,
                })),
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

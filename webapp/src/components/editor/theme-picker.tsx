import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import ReactSelectSetting from '../react_select_setting';

const makeThemeOption = (theme: string) => {
    return {
        label: theme,
        value: theme.replace(/ |\_|\(|\)/gi, '-'),
    };
}

const fetchedThemes = ['vs-dark'];

const ThemePicker = (props) => {
    const {selectedTheme, selectTheme} = props;
    const mmTheme = useSelector(getTheme);

    useEffect(() => {
        if (!fetchedThemes.includes(selectedTheme)) {
            fetchAndSelectTheme(makeThemeOption(selectedTheme));
        }
    }, []);

    const fetchAndSelectTheme = ({label, value}: {label: string, value: string}) => {
        const u = `/plugins/monaco-editor/public/themes/${encodeURIComponent(label)}.json`;
        fetch(u).then((r) => r.json()).then((data) => {
            window.monaco.editor.defineTheme(value, data);
            fetchedThemes.push(value);
            selectTheme(value);
        });
    }

    const setTheme = (option: {label: string, value: string}) => {
        if (fetchedThemes.includes(option.value)) {
            selectTheme(option.value);
            return;
        }

        fetchAndSelectTheme(option);
    }

    const options = themes.map(makeThemeOption);

    let themeValue = 'vs-dark';
    if (fetchedThemes.includes(selectedTheme)) {
        themeValue = selectedTheme;
    }

    const selectedOption = options.find((opt) => opt.value === themeValue);

    return (
        <div style={{width: '400px'}}>
            <span>
                {'Theme '}
            </span>
            <ReactSelectSetting
                value={selectedOption}
                theme={mmTheme}
                onChange={setTheme}
                options={options}
            />
        </div>
    );
};

export default ThemePicker;

const themes = [
    'Active4D',
    'All Hallows Eve',
    'Amy',
    'Birds of Paradise',
    'Blackboard',
    'Brilliance Black',
    'Brilliance Dull',
    'Chrome DevTools',
    'Clouds Midnight',
    'Clouds',
    'Cobalt',
    'Dawn',
    'Dreamweaver',
    'Eiffel',
    'Espresso Libre',
    'GitHub',
    'IDLE',
    'idleFingers',
    'iPlastic',
    'Katzenmilch',
    'krTheme',
    'Kuroir Theme',
    'LAZY',
    'MagicWB (Amiga)',
    'Merbivore Soft',
    'Merbivore',
    'Monokai Bright',
    'Monokai',
    'monoindustrial',
    'Night Owl',
    'Oceanic Next',
    'Pastels on Dark',
    'Slush and Poppies',
    'Solarized-dark',
    'Solarized-light',
    'SpaceCadet',
    'Sunburst',
    'Textmate (Mac Classic)',
    'Tomorrow-Night-Blue',
    'Tomorrow-Night-Bright',
    'Tomorrow-Night-Eighties',
    'Tomorrow-Night',
    'Tomorrow',
    'Twilight',
    'Upstream Sunburst',
    'Vibrant Ink',
    'vs-dark',
    'Xcode_default',
    'Zenburnesque',
];

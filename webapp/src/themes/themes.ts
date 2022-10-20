import {Monaco} from '@monaco-editor/react';

import githubThemeJSON from './github_theme';
import monokaiThemeJSON from './monokai_theme';
import solarizedDarkThemeJSON from './solarized_dark_theme';
import solarizedLightThemeJSON from './solarized_light_theme';

let registeredMonacoThemes = false;
export const registerThemes = (monaco: Monaco) => {
    if (registeredMonacoThemes) {
        return;
    }
    registeredMonacoThemes = true;


    monaco.editor.defineTheme('github', githubThemeJSON);
    monaco.editor.defineTheme('monokai', monokaiThemeJSON);
    monaco.editor.defineTheme('solarized-dark', solarizedDarkThemeJSON);
    monaco.editor.defineTheme('solarized-light', solarizedLightThemeJSON);
}

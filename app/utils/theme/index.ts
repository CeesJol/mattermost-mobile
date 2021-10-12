// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {StyleSheet} from 'react-native';
import tinyColor from 'tinycolor2';

import {Preferences, Screens} from '@constants';
import {mergeNavigationOptions} from '@screens/navigation';
import EphemeralStore from '@store/ephemeral_store';

import type {Options} from 'react-native-navigation';

const MODAL_SCREENS_WITHOUT_BACK = [
    'AddReaction',
    'ChannelInfo',
    'ClientUpgrade',
    'CreateChannel',
    'EditPost',
    'ErrorTeamsList',
    'MoreChannels',
    'MoreDirectMessages',
    'Permalink',
    'SelectTeam',
    'Settings',
    'TermsOfService',
    'UserProfile',
];

const rgbPattern = /^rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)$/;

export function getComponents(inColor: string): {red: number; green: number; blue: number; alpha: number} {
    let color = inColor;

    // RGB color
    const match = rgbPattern.exec(color);
    if (match) {
        return {
            red: parseInt(match[1], 10),
            green: parseInt(match[2], 10),
            blue: parseInt(match[3], 10),
            alpha: match[4] ? parseFloat(match[4]) : 1,
        };
    }

    // Hex color
    if (color[0] === '#') {
        color = color.slice(1);
    }

    if (color.length === 3) {
        const tempColor = color;
        color = '';

        color += tempColor[0] + tempColor[0];
        color += tempColor[1] + tempColor[1];
        color += tempColor[2] + tempColor[2];
    }

    return {
        red: parseInt(color.substring(0, 2), 16),
        green: parseInt(color.substring(2, 4), 16),
        blue: parseInt(color.substring(4, 6), 16),
        alpha: 1,
    };
}

export function makeStyleSheetFromTheme(getStyleFromTheme: (a: any) => any): (a: any) => any {
    let lastTheme: any;
    let style: any;
    return (theme: any) => {
        if (!style || theme !== lastTheme) {
            style = StyleSheet.create(getStyleFromTheme(theme));
            lastTheme = theme;
        }

        return style;
    };
}

export function changeOpacity(oldColor: string, opacity: number): string {
    const {
        red,
        green,
        blue,
        alpha,
    } = getComponents(oldColor);

    return `rgba(${red},${green},${blue},${alpha * opacity})`;
}

export function concatStyles<T>(...styles: T[]) {
    return ([] as T[]).concat(...styles);
}

export function setNavigatorStyles(componentId: string, theme: Theme) {
    const options: Options = {
        topBar: {
            title: {
                color: theme.sidebarHeaderTextColor,
            },
            background: {
                color: theme.sidebarHeaderBg,
            },
            leftButtonColor: theme.sidebarHeaderTextColor,
            rightButtonColor: theme.sidebarHeaderTextColor,
        },
        layout: {
            componentBackgroundColor: theme.centerChannelBg,
        },
    };

    if (!MODAL_SCREENS_WITHOUT_BACK.includes(componentId) && options.topBar) {
        options.topBar.backButton = {
            color: theme.sidebarHeaderTextColor,
        };
    }

    mergeNavigationOptions(componentId, options);
}

export function setNavigationStackStyles(theme: Theme) {
    EphemeralStore.allNavigationComponentIds.forEach((componentId) => {
        if (componentId !== Screens.BOTTOM_SHEET) {
            setNavigatorStyles(componentId, theme);
        }
    });
}

export function getKeyboardAppearanceFromTheme(theme: Theme) {
    return tinyColor(theme.centerChannelBg).isLight() ? 'light' : 'dark';
}

export function hexToHue(hexColor: string) {
    let {red, green, blue} = getComponents(hexColor);
    red /= 255;
    green /= 255;
    blue /= 255;

    const channelMax = Math.max(red, green, blue);
    const channelMin = Math.min(red, green, blue);
    const delta = channelMax - channelMin;
    let hue = 0;

    if (delta === 0) {
        hue = 0;
    } else if (channelMax === red) {
        hue = ((green - blue) / delta) % 6;
    } else if (channelMax === green) {
        hue = ((blue - red) / delta) + 2;
    } else {
        hue = ((red - green) / delta) + 4;
    }

    hue = Math.round(hue * 60);

    if (hue < 0) {
        hue += 360;
    }

    return hue;
}

function blendComponent(background: number, foreground: number, opacity: number): number {
    return ((1 - opacity) * background) + (opacity * foreground);
}

export function blendColors(background: string, foreground: string, opacity: number, hex = false): string {
    const backgroundComponents = getComponents(background);
    const foregroundComponents = getComponents(foreground);

    const red = Math.floor(blendComponent(
        backgroundComponents.red,
        foregroundComponents.red,
        opacity,
    ));
    const green = Math.floor(blendComponent(
        backgroundComponents.green,
        foregroundComponents.green,
        opacity,
    ));
    const blue = Math.floor(blendComponent(
        backgroundComponents.blue,
        foregroundComponents.blue,
        opacity,
    ));
    const alpha = blendComponent(
        backgroundComponents.alpha,
        foregroundComponents.alpha,
        opacity,
    );

    if (hex) {
        let r = red.toString(16);
        let g = green.toString(16);
        let b = blue.toString(16);

        if (r.length === 1) {
            r = '0' + r;
        }
        if (g.length === 1) {
            g = '0' + g;
        }
        if (b.length === 1) {
            b = '0' + b;
        }

        return `#${r + g + b}`;
    }

    return `rgba(${red},${green},${blue},${alpha})`;
}

const themeTypeMap: ThemeTypeMap = {
    Mattermost: 'denim',
    Organization: 'sapphire',
    'Mattermost Dark': 'indigo',
    'Windows Dark': 'onyx',
    Denim: 'denim',
    Sapphire: 'sapphire',
    Quartz: 'quartz',
    Indigo: 'indigo',
    Onyx: 'onyx',
    custom: 'custom',
};

// setThemeDefaults will set defaults on the theme for any unset properties.
export function setThemeDefaults(theme: Theme): Theme {
    const themes = Preferences.THEMES as Record<ThemeKey, Theme>;
    const defaultTheme = themes.denim;

    const processedTheme = {...theme};

    // If this is a system theme, return the source theme object matching the theme preference type
    if (theme.type && theme.type !== 'custom' && Object.keys(themeTypeMap).includes(theme.type)) {
        return Preferences.THEMES[themeTypeMap[theme.type]];
    }

    for (const key of Object.keys(defaultTheme)) {
        if (theme[key]) {
            // Fix a case where upper case theme colours are rendered as black
            processedTheme[key] = theme[key]?.toLowerCase();
        }
    }

    for (const property in defaultTheme) {
        if (property === 'type' || (property === 'sidebarTeamBarBg' && theme.sidebarHeaderBg)) {
            continue;
        }
        if (theme[property] == null) {
            processedTheme[property] = defaultTheme[property];
        }

        // Backwards compatability with old name
        if (!theme.mentionBg && theme.mentionBj) {
            processedTheme.mentionBg = theme.mentionBj;
        }
    }

    if (!theme.sidebarTeamBarBg && theme.sidebarHeaderBg) {
        processedTheme.sidebarTeamBarBg = blendColors(theme.sidebarHeaderBg, '#000000', 0.2, true);
    }

    return processedTheme as Theme;
}
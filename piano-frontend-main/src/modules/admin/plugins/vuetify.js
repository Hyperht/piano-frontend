import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import 'vuetify/styles';

const lightTheme = {
    dark: false,
    colors: {
        primary: '#4680FF',
        secondary: '#5B6B79',
        info: '#3ec9d6',
        success: '#2ca87f',
        warning: '#e58a00',
        error: '#dc2626',
        lightprimary: '#E9F0FF',
        lightsecondary: '#F8F9FA',
        lightsuccess: '#c0e5d9',
        lightinfo: '#c5eff3',
        lighterror: '#f5bebe',
        lightwarning: '#f7dcb3',
        darkText: '#1D2630',
        lightText: '#5B6B79',
        darkprimary: '#3F78FF',
        darksecondary: '#3E4853',
        darkinfo: '#30bccc',
        darksuccess: '#21976c',
        darkwarning: '#de7700',
        darkerror: '#d31c1c',
        borderLight: '#e8ebee',
        inputBorder: '#BEC8D0',
        containerBg: '#F8F9FA',
        surface: '#fff',
        'on-surface-variant': '#fff',
        facebook: '#4267b2',
        twitter: '#1da1f2',
        linkedin: '#0e76a8',
        gray100: '#f3f5f7',
        primary200: '#b8ceff',
        secondary200: '#d8dadd',
        warning200: '#faaf00'
    }
};

const darkTheme = {
    dark: true,
    colors: {
        primary: '#4680FF',
        secondary: '#8A99A8',
        info: '#3ec9d6',
        success: '#2ca87f',
        warning: '#e58a00',
        error: '#dc2626',
        lightprimary: '#1E3A5F',
        lightsecondary: '#2C3440',
        lightsuccess: '#1B4031',
        lightinfo: '#1A3E42',
        lighterror: '#4A2020',
        lightwarning: '#3D2700',
        darkText: '#E6EAF0',
        lightText: '#8A99A8',
        darkprimary: '#5C8FFF',
        darksecondary: '#5A6875',
        darkinfo: '#40D6E3',
        darksuccess: '#35BE8E',
        darkwarning: '#FF9B1A',
        darkerror: '#E63939',
        borderLight: '#2C3440',
        inputBorder: '#3E4853',
        containerBg: '#1A1F2C',
        surface: '#222936',
        'on-surface-variant': '#222936'
    }
};

export default createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases: { ...aliases },
        sets: { mdi }
    },
    theme: {
        defaultTheme: 'lightTheme',
        themes: {
            lightTheme,
            darkTheme
        }
    },
    defaults: {
        VBtn: {},
        VCard: {
            rounded: 'md'
        },
        VTextField: {
            rounded: 'lg'
        },
        VTooltip: {
            location: 'top'
        }
    }
});

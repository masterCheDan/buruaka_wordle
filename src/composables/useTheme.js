// src/composables/useTheme.js
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';

const THEME_STORAGE_KEY = 'baGuessr_themePreference';

// Define available preferences
const availablePreferences = ['light', 'dark', 'auto', 'system'];

// Reactive state for the user's chosen preference
// Load from localStorage or default to 'system'
const themePreference = ref(localStorage.getItem(THEME_STORAGE_KEY) || 'system');

// Reactive state for the system's preferred color scheme
const systemPrefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

// Function to update the theme preference
function setThemePreference(preference) {
    if (!availablePreferences.includes(preference)) {
        console.warn(`Invalid theme preference: ${preference}`);
        return;
    }
    themePreference.value = preference;
    localStorage.setItem(THEME_STORAGE_KEY, preference);
}

// Computed property to determine the effective theme ('light' or 'dark')
const effectiveTheme = computed(() => {
    switch (themePreference.value) {
        case 'light': return 'light';
        case 'dark': return 'dark';
        case 'auto': {
            // Simple time-based auto mode (e.g., dark between 8 PM and 6 AM)
            const currentHour = new Date().getHours();
            // Using JST timezone (UTC+9) based on context
            // Adjust range as needed
            // const isNightTime = currentHour >= 20 || currentHour < 6;
            // Let's use a slightly simpler fixed time for example: 7 PM to 7 AM JST
            const isNightTime = currentHour >= 19 || currentHour < 7;
            return isNightTime ? 'dark' : 'light';
        }
        case 'system':
        default:
            return systemPrefersDark.value ? 'dark' : 'light';
    }
});

// Function to apply the theme class to the <html> element
function applyTheme(theme) { // theme is 'light' or 'dark'
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
}

export function useTheme() {
    // Listener for system preference changes
    const mediaQueryListener = (e) => {
        systemPrefersDark.value = e.matches;
    };

    onMounted(() => {
        // Apply initial theme based on preference and system state
        applyTheme(effectiveTheme.value);

        // Set up listener for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        // Check if addEventListener is supported (modern browsers)
        if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', mediaQueryListener);
        else mediaQuery.addListener(mediaQueryListener);// Fallback for older browsers

        // Note: For 'auto' mode based on time, this won't automatically update
        // unless something else triggers a re-computation of effectiveTheme.
        // More complex solutions involve intervals or Page Visibility API.
    });

    onUnmounted(() => {
        // Clean up listener
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery.removeEventListener) mediaQuery.removeEventListener('change', mediaQueryListener);
        else mediaQuery.removeListener(mediaQueryListener);

    });

    // Watch for changes in the *effective* theme and apply the class
    watch(effectiveTheme, (newTheme) => {
        applyTheme(newTheme);
    }, { immediate: true }); // Apply immediately on setup

    return {
        themePreference,     // The user's setting ('light', 'dark', 'auto', 'system')
        effectiveTheme,      // The currently active theme ('light' or 'dark')
        setThemePreference   // Function to change the preference
    };
}
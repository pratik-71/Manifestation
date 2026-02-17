// Color constants for the app
export const AppColors = {
    // Teal Color Palette
    teal: {
        primary: '#0891b2' as const,
        deep: '#0f766e' as const,
        light: '#5eead4' as const,
        text: '#e0f2fe' as const,
        subtext: '#bae6fd' as const,
        character: '#7dd3fc' as const,
    },
    
    // Manifestation Gold/Purple Palette
    manifestation: {
        primary: '#f59e0b' as const, // Golden Amber
        secondary: '#7c3aed' as const, // Royal Purple
        accent: '#fbbf24' as const, // Bright Gold
        deep: '#170b29' as const, // Deep Midnight Violet
        background: '#0f0518' as const, // Deep Void
        text: '#fef3c7' as const, // Pale Gold
        subtext: 'rgba(254, 243, 199, 0.6)' as const,
        glass: 'rgba(124, 58, 237, 0.12)' as const, // Soft Violet Glass
        border: 'rgba(251, 191, 36, 0.3)' as const,
    },
    
    // Background Gradients
    gradients: {
        teal: ['#000000', '#0891b2'] as const,
        tealDeep: ['#0f766e', '#5eead4'] as const,
        tealLight: ['rgba(8, 145, 178, 0.3)', 'rgba(94, 234, 212, 0.2)'] as const,
        tealOrb: ['rgba(8, 145, 178, 0.1)', 'rgba(94, 234, 212, 0.05)'] as const,
        emerald: ['#000000', '#064e3b', '#10b981'] as const,
        cosmic: ['#020617', '#1e1b4b', '#1e3a5f', '#0d7a7a'] as const,
        purple: ['#020617', '#1e1b4b', '#4c1d95', '#9a3412'] as const,
        // New Mystical Gradient
        mystic: ['#0f0518', '#2e1065', '#170b29'] as const, // Void -> Royal Violet -> Midnight Violet
    },
    
    // Opacity Values
    opacity: {
        light: 0.1,
        medium: 0.2,
        strong: 0.3,
        heavy: 0.4,
        full: 0.5,
    },
    
    // Common Colors
    black: '#000000' as const,
    white: '#ffffff' as const,
    transparent: 'transparent' as const,
};

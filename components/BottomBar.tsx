import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BottomBarProps {
    // Optional props if we want to customize active tab from parent, 
    // though usually pathname check is sufficient.
}

export const BottomBar: React.FC<BottomBarProps> = () => {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = [
        {
            name: 'Home',
            icon: 'home-outline' as const,
            activeIcon: 'home' as const,
            route: '/home',
        },
        {
            name: 'Manifest',
            icon: 'flash-outline' as const, // Bolt icon for action-oriented manifestation
            activeIcon: 'flash' as const,
            route: '/manifest_hub',
        },
        {
            name: 'Space',
            icon: 'planet-outline' as const,
            activeIcon: 'planet' as const,
            route: '/universe_chat',
        },
        {
            name: 'Profile',
            icon: 'person-outline' as const,
            activeIcon: 'person' as const,
            route: '/profile',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.bar}>
                {tabs.map((tab, index) => {
                    const isActive = pathname === tab.route;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.tab}
                            onPress={() => router.push(tab.route as any)}
                        >
                            <Ionicons
                                name={isActive ? tab.activeIcon : tab.icon}
                                size={22}
                                color={isActive ? '#f97316' : 'rgba(255,255,255,0.4)'}
                            />
                            {isActive && <Text style={styles.activeDot}>•</Text>}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 10,
        paddingTop: 0,
        paddingHorizontal: 16,
        backgroundColor: 'transparent',
    },
    bar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(22, 22, 24, 0.95)',
        borderRadius: 32,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
    },
    activeDot: {
        color: '#f97316',
        fontSize: 20,
        position: 'absolute',
        bottom: -10,
        lineHeight: 20,
    }
});

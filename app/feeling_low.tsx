import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeOut,
    SlideInRight,
} from 'react-native-reanimated';
import { BreathingBackground } from '../components/BreathingBackground';
import { GlobalCosmicBackground } from '../components/GlobalCosmicBackground';

const { width } = Dimensions.get('window');

// --- Data Structure (Preserved) ---
type QuestionNode = {
    id: string;
    text: string;
    options: Option[];
};

type Option = {
    text: string;
    icon?: keyof typeof Ionicons.glyphMap;
    nextNodeId?: string;
    result?: ResultContent;
};

type ResultContent = {
    title: string;
    explanation: string;
    quote: string;
};

// 4 Stages: Root -> Level 2 -> Level 3 -> Level 4 -> Result
const QUESTION_TREE: Record<string, QuestionNode> = {
    root: {
        id: "root",
        text: "Which of these feels closest to the weight you are carrying today?",
        options: [
            {
                text: "I am questioning my value",
                icon: "person-outline",
                nextNodeId: "s2_worth_struggle"
            },
            {
                text: "I feel stuck or driftless",
                icon: "compass-outline",
                nextNodeId: "s2_purpose_struggle"
            },
            {
                text: "My connections feel heavy",
                icon: "heart-outline",
                nextNodeId: "s2_connection_struggle"
            }
        ]
    },

    // STAGE 2: Cause
    s2_worth_struggle: {
        id: "s2_worth_struggle",
        text: "What shifted your sense of inner value?",
        options: [
            {
                text: "Seeing someone else's path",
                icon: "eye-outline",
                nextNodeId: "s3_jealousy_reflection"
            },
            {
                text: "A recent closed door",
                icon: "close-circle-outline",
                nextNodeId: "s3_rejection_reflection"
            },
            {
                text: "The voice of my own critic",
                icon: "volume-mute-outline",
                nextNodeId: "s3_self_doubt_reflection"
            }
        ]
    },

    s2_purpose_struggle: {
        id: "s2_purpose_struggle",
        text: "What does this lack of movement feel like?",
        options: [
            {
                text: "I have lost the 'why'",
                icon: "help-outline",
                nextNodeId: "s3_lost_life_reflection"
            },
            {
                text: "I have no fuel to start",
                icon: "flame-outline",
                nextNodeId: "s3_motivation_reflection"
            },
            {
                text: "I am overwhelmed by choice",
                icon: "layers-outline",
                nextNodeId: "s3_overwhelm_reflection"
            }
        ]
    },

    s2_connection_struggle: {
        id: "s2_connection_struggle",
        text: "What is the nature of this heaviness in your relationships?",
        options: [
            {
                text: "Unclear feelings or signals",
                icon: "chatbubbles-outline",
                nextNodeId: "s3_rel_confusion_reflection"
            },
            {
                text: "Fear of being alone",
                icon: "contract-outline",
                nextNodeId: "s3_loneliness_reflection"
            },
            {
                text: "A need for boundaries",
                icon: "shield-half-outline",
                nextNodeId: "s3_boundaries_reflection"
            }
        ]
    },

    // STAGE 3: Deeper Reflection leading to STAGE 4: Results
    s3_jealousy_reflection: {
        id: "s3_jealousy_reflection",
        text: "Does their light feel like it is highlighting your shadow?",
        options: [
            {
                text: "I feel I am lagging",
                result: {
                    title: "Your Time is Coming",
                    explanation: "Seeing someone else succeed just shows that it can happen! For example, if a friend gets a great job, it's a sign that success is possible for you too. You aren't 'late'—you're just on your own special timeline. Some people become famous at 20, while others like Vera Wang start their biggest dreams at 40! Your path is uniquely yours, and the universe hasn't forgotten you.",
                    quote: "Every flower blooms at its own time."
                }
            },
            {
                text: "I want what they have",
                result: {
                    title: "Clear Your Vision",
                    explanation: "That 'sting' of jealousy is actually your heart telling you what you want. For example, if you're jealous of a traveler, it means you're ready for adventure! Use that energy to start planning your own next move. Instead of looking at their plate, start looking at what you can cook in your own kitchen. This feeling is a compass, not a curse, pointing you toward your true desires.",
                    quote: "Let their success inspire your action."
                }
            },
            {
                text: "I feel invisible",
                result: {
                    title: "Be Your Own Fan",
                    explanation: "You don't need everyone to clap for you to be doing a great job. For example, even if nobody saw you workout today, your body still feels stronger. Be proud of the work you do when no one is looking. Just like a beautiful forest grows quietly without needing an audience, your personal growth is happening every single day. You are the most important person in your life—start noticing your own wins!",
                    quote: "Valuing yourself is the best validation."
                }
            }
        ]
    },

    s3_rejection_reflection: {
        id: "s3_rejection_reflection",
        text: "How are you interpreting this closed door?",
        options: [
            {
                text: "As proof of unworthiness",
                result: {
                    title: "The Wrong Key",
                    explanation: "A 'no' doesn't mean you're not good enough; it just means that specific door wasn't yours. Like a key that doesn't fit a lock, you just need to find the doorway that matches your unique shape. Maybe you were rejected for a job you wanted, but it's only because a much better role is waiting for you around the corner. The universe is just making sure you don't settle for less than you deserve.",
                    quote: "When one door closes, the right one opens."
                }
            },
            {
                text: "As a personal failure",
                result: {
                    title: "A Lesson, Not a Loss",
                    explanation: "One mistake doesn't make you a failure. For example, a baby falls many times before walking. This 'fail' is just a step on your way to winning. Keep your head up and try a new way! Think of yourself like a scientist: every experiment that doesn't work is just more data to help you find the right answer. You are learning what doesn't work so you can finally discover what does.",
                    quote: "Failures are stepping stones to success."
                }
            },
            {
                text: "As a loss of time",
                result: {
                    title: "Nothing is Wasted",
                    explanation: "You didn't 'waste' time; you gained experience. For example, even if a relationship ends, you learned what you truly need now. Everything you've been through is making you wiser for what's next. Like a farmer who waits all winter for the seeds to grow, you are growing underground even when you can't see it yet. Every hour spent trying is an hour spent building your inner strength.",
                    quote: "Experience is the best teacher."
                }
            }
        ]
    },

    s3_self_doubt_reflection: {
        id: "s3_self_doubt_reflection",
        text: "Is this doubt trying to protect you from the risk of trying?",
        options: [
            {
                text: "Fear of judgment",
                result: {
                    title: "Be Brave Anyway",
                    explanation: "It's normal to feel scared of what others think, but most people are just worried about themselves! For example, nobody remembers your small mistakes. Your voice is important, so keep using it. Think of the 'spotlight effect'—you feel like everyone is watching your flaws, but really, they are all busy looking at their own reflections. You are free to be yourself without the weight of their opinions.",
                    quote: "What others think is none of your business."
                }
            },
            {
                text: "Fear of mistakes",
                result: {
                    title: "Messy is Okay",
                    explanation: "You don't have to be perfect to start. For example, a first draft of a book is always messy! Give yourself permission to make mistakes as you learn. It means you're actually doing something! Just like a painter puts down a messy first layer of color before the beautiful picture emerges, your 'mess' is the foundation of your future success. Every mistake is just you being brave enough to try.",
                    quote: "Progress over perfection."
                }
            },
            {
                text: "I just feel small",
                result: {
                    title: "You Are Special",
                    explanation: "You don't have to 'do' anything to be valuable. Just like a beautiful sunset is amazing without 'working,' you are enough just by being alive. You are unique and have so much to offer. Think about a small seed: it looks tiny and unimportant, but inside it has everything it needs to become a giant tree. You have that same magic inside of you right now, waiting to bloom.",
                    quote: "You are a masterpiece in progress."
                }
            }
        ]
    },

    s3_lost_life_reflection: {
        id: "s3_lost_life_reflection",
        text: "Does the path ahead look foggy or entirely empty?",
        options: [
            {
                text: "Meaningless void",
                result: {
                    title: "A Fresh Start",
                    explanation: "Feeling lost means you're ready for something new! For example, before a new building goes up, the old one must be cleared away. This empty feeling is just space for your new life to begin. Don't be afraid of the quiet; it’s just the universe hitting the 'reset' button so you can build something even better. This is your chance to decide exactly who you want to be next.",
                    quote: "To find yourself, you must first be lost."
                }
            },
            {
                text: "I am just drifting",
                result: {
                    title: "Take a Breather",
                    explanation: "It's okay to not have a plan right now. For example, even the ocean has a tide that goes out before coming back in. Use this 'slow' time to rest. You'll know when it's time to move again. Think of a leaf floating on a river—it might look like it’s just drifting, but the current is still carrying it exactly where it needs to go. Sometimes you grow the most when you’re standing still.",
                    quote: "It's okay to just 'be' for a while."
                }
            },
            {
                text: "I missed my turn",
                result: {
                    title: "No Wrong Turns",
                    explanation: "In life, every road leads somewhere useful. For example, getting lost on a drive can lead you to a beautiful place you didn't know existed. Trust that where you are is safe and you're learning. You haven't fallen behind; you are just taking the scenic route. This 'wrong' turn might introduce you to people and experiences that the 'right' path never could have given you.",
                    quote: "Trust your journey."
                }
            }
        ]
    },

    s3_motivation_reflection: {
        id: "s3_motivation_reflection",
        text: "Is your spirit tired or just your nervous system?",
        options: [
            {
                text: "Spiritually drained",
                result: {
                    title: "Soul Recharge",
                    explanation: "If you've lost interest, your soul might just be tired. For example, even a phone needs to be plugged in to keep working! Stop forcing yourself and do something that makes you happy today. When you stop pushing, you give your inner battery a chance to fill back up. Whether it’s listening to your favorite song or just sitting in the sun, little acts of joy are the best medicine for a tired soul.",
                    quote: "Rest is a productive activity."
                }
            },
            {
                text: "The tasks feel too big",
                result: {
                    title: "Tiny Steps Win",
                    explanation: "Don't look at the whole mountain; just look at your feet. For example, instead of 'cleaning the whole house,' just clean one small shelf. One tiny thing leads to the next! Think of a giant Lego castle—it looks impossible to build, but it’s really just one brick at a time. Once you get that first brick down, the second one is much easier. You don't need to finish today; you just need to start.",
                    quote: "Small wins add up to big victories."
                }
            },
            {
                text: "I have lost passion",
                result: {
                    title: "Follow the Spark",
                    explanation: "Passions change as we grow, and that's okay! For example, you might have loved drawing as a kid but now you love cooking. Don't feel bad—just follow whatever makes you feel excited today. Like a tree that changes colors in the fall, you are allowed to have different 'seasons' in your life. Your old interests aren't gone; they are just making room for the new, exciting things you are becoming.",
                    quote: "Grow along with your interests."
                }
            }
        ]
    },

    s3_rel_confusion_reflection: {
        id: "s3_rel_confusion_reflection",
        text: "Are you listening to your gut or your fear of change?",
        options: [
            {
                text: "My gut feels heavy",
                result: {
                    title: "Listen Inside",
                    explanation: "That heavy feeling in your stomach is your intuition talking to you. For example, if you feel nervous around someone, your body is telling you to be careful. Trust your feelings—they protect you. Your gut is like a built-in radar that knows the truth before your mind does. It’s okay to pause and listen to that inner voice, even if it’s telling you something hard to hear.",
                    quote: "Your gut never lies."
                }
            },
            {
                text: "I fear the ending",
                result: {
                    title: "Be Your Own Bestie",
                    explanation: "Being alone isn't the same as being lonely. For example, you can have a great time watching a movie by yourself! When you enjoy your own company, you don't have to stay in confusion. Think about the person you love most in the world—you deserve to treat yourself with that same kindness. You are a complete person all on your own, and you don't need anyone else to be whole.",
                    quote: "You are your own home."
                }
            },
            {
                text: "Words aren't working",
                result: {
                    title: "Silent Wisdom",
                    explanation: "Sometimes talking more doesn't help. For example, if two people are shouting, nobody hears anything. Take a step back and just observe quietly. The answer will come when you're calm. Think about two magnets—if they are pushing apart, no amount of force will make them stick. Sometimes you just need to stop, rotate, and give things space to settle on their own.",
                    quote: "Silence can be the best answer."
                }
            }
        ]
    }
};


// --- Stage Progress Component ---
const STAGE_TITLES = ['The Feeling', 'The Source', 'The Insight', 'The Shift'];

const StageProgress = ({ step, totalSteps = 4 }: { step: number; totalSteps?: number }) => {
    const currentTitle = STAGE_TITLES[step - 1] || STAGE_TITLES[0];

    return (
        <View style={styles.progressContainer}>
            <Text style={styles.stageTitle}>{currentTitle}</Text>
            <View style={styles.progressBarContainer}>
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const isActive = index < step;
                    return (
                        <View
                            key={index}
                            style={[
                                styles.progressSegment,
                                isActive && styles.progressSegmentActive,
                            ]}
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default function FeelingLowScreen() {
    const router = useRouter();
    const [currentNodeId, setCurrentNodeId] = useState<string>('root');
    const [result, setResult] = useState<ResultContent | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [showVideoModal, setShowVideoModal] = useState(false);

    const handleWatchCommitment = async () => {
        try {
            const videoPath = `${FileSystem.documentDirectory}future_messages/latest_message.mp4`;
            const fileInfo = await FileSystem.getInfoAsync(videoPath);
            if (!fileInfo.exists) {
                Alert.alert(
                    'No Video Found',
                    "You haven't recorded your commitment video yet. Go to your Profile to record one."
                );
                return;
            }
            setVideoUri(videoPath);
            setShowVideoModal(true);
        } catch (e) {
            Alert.alert('Error', 'Could not load your commitment video.');
        }
    };

    // Simple logic to determine visual step: 1 (root), 2, 3, 4. If result, show 4 full.
    const currentStep = result ? 4 : Math.min(history.length + 1, 4);

    const currentNode = QUESTION_TREE[currentNodeId];

    if (!currentNode && !result) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white', marginTop: 100, textAlign: 'center' }}>
                    Path under construction.
                </Text>
                <TouchableOpacity onPress={() => setCurrentNodeId('root')} style={{ marginTop: 20 }}>
                    <Text style={{ color: 'orange', textAlign: 'center' }}>Reset</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const handleOptionSelect = (option: Option) => {
        if (option.result) {
            setResult(option.result);
        } else if (option.nextNodeId) {
            if (QUESTION_TREE[option.nextNodeId]) {
                setHistory([...history, currentNodeId]);
                setCurrentNodeId(option.nextNodeId);
            } else {
                console.warn("Missing node:", option.nextNodeId);
                setResult({
                    title: "Under Construction",
                    explanation: "This path is being paved. Please try another.",
                    quote: "Patience is a virtue."
                })
            }
        }
    };

    const handleBack = () => {
        if (result) {
            setResult(null);
        } else if (history.length > 0) {
            const prevNode = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setCurrentNodeId(prevNode);
        } else {
            router.back();
        }
    };

    const navigateToChat = () => {
        router.push('/universe_chat');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']} // Deep Navy -> Dark Brown -> Mocha
                opacity={0.8}
            />
            <GlobalCosmicBackground />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      
                        <Text style={styles.headerTitle}>Soul Space</Text>
                    </View>
                    <View style={{ width: 32 }} />
                </View>

                {/* Progress Indicator */}
                <StageProgress step={currentStep} />

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {result ? (
                        <>
                            <Animated.View
                                entering={FadeIn.duration(1200)}
                                style={styles.resultContainer}
                            >
                                <View style={styles.resultHeader}>
                                 
                                    <Text style={styles.resultTitle}>{result.title}</Text>
                                    
                                </View>

                                <View style={styles.masterplanCard}>
                                    <Text style={styles.explanationText}>{result.explanation}</Text>
                                </View>

                                <View style={styles.finalQuoteSection}>
                                    <Text style={styles.quoteText}>"{result.quote}"</Text>
                                </View>
                            </Animated.View>

                            <Animated.View
                                entering={FadeInDown.delay(800).duration(400)}
                                style={styles.footerContainer}
                            >
                                {/* Commitment Video Nudge */}
                                <TouchableOpacity
                                    style={styles.commitmentButton}
                                    onPress={handleWatchCommitment}
                                    activeOpacity={0.85}
                                >
                                    <LinearGradient
                                        colors={['rgba(249,115,22,0.18)', 'rgba(180,83,9,0.10)']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.commitmentGradient}
                                    >
                                        <View style={styles.commitmentIconCircle}>
                                            <Ionicons name="play-circle" size={22} color="#fb923c" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.commitmentLabel}>Did you forget your commitment?</Text>
                                            <Text style={styles.commitmentSub}>Watch your future self — right now.</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color="rgba(249,115,22,0.5)" />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.helpButton}
                                    onPress={navigateToChat}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.helpButtonText}>Still feeling it? Talk to Universe</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.homeButton}
                                    onPress={() => router.replace('/home')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.homeButtonText}>Go Home</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </>
                    ) : (
                        <Animated.View
                            key={currentNodeId}
                            entering={FadeIn.duration(500)}
                            exiting={FadeOut.duration(300)}
                            style={styles.questionContainer}
                        >
                            <Text style={styles.questionText}>{currentNode.text}</Text>

                            <View style={styles.optionsContainer}>
                                {currentNode.options.map((option, index) => (
                                    <Animated.View
                                        key={index}
                                        entering={SlideInRight.delay(index * 120).duration(500).springify()}
                                    >
                                        <TouchableOpacity
                                            style={styles.optionButton}
                                            onPress={() => handleOptionSelect(option)}
                                            activeOpacity={0.8}
                                        >
                                            <LinearGradient
                                                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                                                style={styles.optionGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                {option.icon && (
                                                    <View style={styles.optionIconCircle}>
                                                        <Ionicons name={option.icon} size={22} color="#e2e8f0" />
                                                    </View>
                                                )}
                                                <Text style={styles.optionText}>{option.text}</Text>
                                                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </View>
                        </Animated.View>
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* In-App Commitment Video Player */}
            {showVideoModal && videoUri ? (
                <CommitmentVideoModal
                    uri={videoUri}
                    onClose={() => {
                        setShowVideoModal(false);
                        setVideoUri(null);
                    }}
                />
            ) : null}
        </View>
    );
}

// ─── Commitment Video Modal ───────────────────────────────────────────────────
function CommitmentVideoModal({ uri, onClose }: { uri: string; onClose: () => void }) {
    const player = useVideoPlayer(uri, p => {
        p.loop = false;
        p.play();
    });

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={videoStyles.backdrop}>
                <View style={videoStyles.topBar}>
                    <Text style={videoStyles.topLabel}>Your Commitment to the Future</Text>
                    <TouchableOpacity onPress={onClose} style={videoStyles.closeBtn}>
                        <Ionicons name="close" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={videoStyles.playerWrapper}>
                    <VideoView
                        player={player}
                        style={videoStyles.video}
                        allowsFullscreen
                        allowsPictureInPicture
                        contentFit="contain"
                    />
                </View>
                <Text style={videoStyles.reminder}>
                    You made this promise to yourself. Honor it. 🔥
                </Text>
            </View>
        </Modal>
    );
}

const { width: SCREEN_W } = Dimensions.get('window');

const videoStyles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.97)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    topBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    topLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 13,
        color: '#fb923c',
        flex: 1,
        letterSpacing: 0.3,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    playerWrapper: {
        width: SCREEN_W - 32,
        aspectRatio: 9 / 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    video: {
        flex: 1,
    },
    reminder: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.45)',
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 22,
        maxWidth: '80%',
    },
});
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 10,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },

    // Stage Progress
    progressContainer: {
        width: '100%',
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    stageTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        color: '#f97316',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    progressBarContainer: {
        flexDirection: 'row',
        height: 4,
        gap: 6,
    },
    progressSegment: {
        flex: 1,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    progressSegmentActive: {
        backgroundColor: '#f97316', // Orange active
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 5,
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 60,
    },

    // Question & Options
    questionContainer: {
        width: '100%',
        alignItems: 'center',
        minHeight: 400,
        justifyContent: 'center',
    },
    questionText: {
        fontFamily: 'Comfortaa_600SemiBold', // Make it bolder
        fontSize: 20,
        color: '#f8fafc',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 48,
        textShadowColor: 'rgba(255,255,255,0.1)',
        textShadowRadius: 10,
        maxWidth: '95%',
    },
    optionsContainer: {
        width: '100%',
        gap: 18,
    },
    optionButton: {
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'transparent',
    },
    optionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12, // Taller buttons
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255,255,255,0.02)', // Baseline subtle fill
    },
    optionIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    optionText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        color: '#f1f5f9',
        flex: 1,
        lineHeight: 24,
    },

    // Result Redesign
    resultContainer: {
        alignItems: 'center',
        width: '100%',
        paddingTop: 10,
    },
    resultHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    resultOverline: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        color: '#f97316',
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 12,
        opacity: 0.8,
    },
    resultTitle: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 22,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 48,
    },
    masterplanCard: {
        width: '100%',
        padding: 24,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        marginBottom: 40,
    },
    explanationText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 28,
        textAlign: 'center',
    },
    finalQuoteSection: {
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    quoteText: {
        fontFamily: 'CormorantGaramond_700Bold_Italic',
        fontSize: 22,
        color: '#fbbf24', // Amber/Gold
        textAlign: 'center',
        lineHeight: 34,
        opacity: 0.9,
    },

    // Footer
    footerContainer: {
        width: '100%',
        marginTop: 20,
        alignItems: 'center',
        gap: 20,
    },
    helpButton: {
        paddingVertical: 8,
    },
    helpButtonText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.3)',
        textDecorationLine: 'underline',
    },
    homeButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    homeButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    // Commitment button
    commitmentButton: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.25)',
    },
    commitmentGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
        gap: 14,
    },
    commitmentIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(249,115,22,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.2)',
    },
    commitmentLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 13,
        color: '#fb923c',
        marginBottom: 3,
    },
    commitmentSub: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
    },
});

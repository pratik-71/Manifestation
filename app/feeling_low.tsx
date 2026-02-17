import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    // --- STAGE 1 (ROOT) ---
    root: {
        id: 'root',
        text: "How are you feeling right now?",
        options: [
            { text: "Sad or Heavy", icon: "cloud-outline", nextNodeId: 's2_sadness' },
            { text: "Anxious or Overwhelmed", icon: "pulse-outline", nextNodeId: 's2_anxiety' },
            { text: "Numb or Empty", icon: "ellipse-outline", nextNodeId: 's2_numbness' },
            { text: "Angry or Frustrated", icon: "flame-outline", nextNodeId: 's2_anger' },
        ]
    },

    // --- STAGE 2 (THE SOURCE) ---
    s2_sadness: {
        id: 's2_sadness',
        text: "What is causing this sadness?",
        options: [
            { text: "Grieving a loss", icon: "heart-dislike-outline", nextNodeId: 's3_sad_grief' },
            { text: "Feeling lonely", icon: "person-outline", nextNodeId: 's3_sad_lonely' },
            { text: "Just tired of everything", icon: "battery-dead-outline", nextNodeId: 's3_sad_tired' },
            { text: "Disappointed in myself", icon: "alert-circle-outline", nextNodeId: 's3_sad_disappointed' },
        ]
    },
    s2_anxiety: {
        id: 's2_anxiety',
        text: "Where is your mind focused?",
        options: [
            { text: "The Future", icon: "arrow-forward-outline", nextNodeId: 's3_anx_future' },
            { text: "The Past", icon: "arrow-back-outline", nextNodeId: 's3_anx_past' },
            { text: "What people think", icon: "eye-outline", nextNodeId: 's3_anx_others' },
            { text: "Too much to do", icon: "list-outline", nextNodeId: 's3_anx_overwhelm' },
        ]
    },
    s2_numbness: {
        id: 's2_numbness',
        text: "Why do you feel this way?",
        options: [
            { text: "Too much pain", icon: "shield-outline", nextNodeId: 's3_numb_pain' },
            { text: "Lost my way", icon: "compass-outline", nextNodeId: 's3_numb_purpose' },
            { text: "Burned out", icon: "snow-outline", nextNodeId: 's3_numb_burnout' },
        ]
    },
    s2_anger: {
        id: 's2_anger',
        text: "What triggered this anger?",
        options: [
            { text: "Unfair treatment", icon: "hand-left-outline", nextNodeId: 's3_ang_justice' },
            { text: "Something blocked me", icon: "stop-circle-outline", nextNodeId: 's3_ang_blocked' },
            { text: "Mad at myself", icon: "finger-print-outline", nextNodeId: 's3_ang_self' },
        ]
    },

    // --- STAGE 3 (THE DEEPER WHY) ---
    // SADNESS BRANCH
    s3_sad_grief: {
        id: 's3_sad_grief',
        text: "What kind of loss is it?",
        options: [
            { text: "A person", icon: "people-outline", nextNodeId: 's4_sad_grief_person' },
            { text: "A dream or goal", icon: "star-outline", nextNodeId: 's4_sad_grief_dream' },
            { text: "A part of myself", icon: "body-outline", nextNodeId: 's4_sad_grief_self' },
        ]
    },
    s3_sad_lonely: {
        id: 's3_sad_lonely',
        text: "How does the loneliness feel?",
        options: [
            { text: "Misunderstood", icon: "ear-outline", nextNodeId: 's4_sad_lonely_und' },
            { text: "Isolated", icon: "hand-left-outline", nextNodeId: 's4_sad_lonely_push' },
            { text: "Craving connection", icon: "magnet-outline", nextNodeId: 's4_sad_lonely_crave' },
        ]
    },
    s3_sad_tired: {
        id: 's3_sad_tired',
        text: "What kind of tired?",
        options: [
            { text: "Physical", icon: "bed-outline", nextNodeId: 's4_sad_tired_body' },
            { text: "Emotional", icon: "infinite-outline", nextNodeId: 's4_sad_tired_soul' },
            { text: "Mental", icon: "hardware-chip-outline", nextNodeId: 's4_sad_tired_mind' },
        ]
    },
    s3_sad_disappointed: {
        id: 's3_sad_disappointed',
        text: "Where did it go wrong?",
        options: [
            { text: "Broke a promise", icon: "close-circle-outline", nextNodeId: 's4_sad_dis_promise' },
            { text: "Behind in life", icon: "time-outline", nextNodeId: 's4_sad_dis_lagging' },
            { text: "Made a mistake", icon: "alert-outline", nextNodeId: 's4_sad_dis_mistake' },
        ]
    },

    // ANXIETY BRANCH
    s3_anx_future: {
        id: 's3_anx_future',
        text: "What are you afraid of?",
        options: [
            { text: "Failing", icon: "trending-down-outline", nextNodeId: 's4_anx_fut_fail' },
            { text: "Losing something", icon: "lock-open-outline", nextNodeId: 's4_anx_fut_loss' },
            { text: "The Unknown", icon: "help-outline", nextNodeId: 's4_anx_fut_unknown' },
        ]
    },
    s3_anx_past: {
        id: 's3_anx_past',
        text: "What happened?",
        options: [
            { text: "A big mistake", icon: "alert-circle-outline", nextNodeId: 's4_anx_past_mistake' },
            { text: "Missing the past", icon: "refresh-outline", nextNodeId: 's4_anx_past_nostalgia' },
            { text: "Feeling ashamed", icon: "eye-off-outline", nextNodeId: 's4_anx_past_shame' },
        ]
    },
    s3_anx_others: {
        id: 's3_anx_others',
        text: "Who are you worried about?",
        options: [
            { text: "Society in general", icon: "globe-outline", nextNodeId: 's4_anx_oth_society' },
            { text: "Parents or Authority", icon: "person-outline", nextNodeId: 's4_anx_oth_parent' },
            { text: "Myself", icon: "mic-off-outline", nextNodeId: 's4_anx_oth_self' },
        ]
    },
    s3_anx_overwhelm: {
        id: 's3_anx_overwhelm',
        text: "What is the main problem?",
        options: [
            { text: "Too many tasks", icon: "layers-outline", nextNodeId: 's4_anx_over_volume' },
            { text: "Need to be perfect", icon: "diamond-outline", nextNodeId: 's4_anx_over_perf' },
            { text: "Can't start", icon: "shuffle-outline", nextNodeId: 's4_anx_over_start' },
        ]
    },

    // NUMBNESS
    s3_numb_pain: { id: 's3_numb_pain', text: "What caused the pain?", options: [{ text: "Heartbreak", icon: "heart-dislike-outline", nextNodeId: 's4_gen_release' }, { text: "Failure", icon: "trending-down-outline", nextNodeId: 's4_gen_perspective' }, { text: "Everything", icon: "layers-outline", nextNodeId: 's4_gen_courage' }] },
    s3_numb_purpose: { id: 's3_numb_purpose', text: "What is missing?", options: [{ text: "A Goal", icon: "compass-outline", nextNodeId: 's4_gen_action' }, { text: "Excitement", icon: "flame-outline", nextNodeId: 's4_gen_spark' }, { text: "Meaning", icon: "heart-outline", nextNodeId: 's4_gen_service' }] },
    s3_numb_burnout: { id: 's3_numb_burnout', text: "How long has it been?", options: [{ text: "Too long", icon: "warning-outline", nextNodeId: 's4_gen_rest' }, { text: "Always felt like this", icon: "infinite-outline", nextNodeId: 's4_gen_identity' }, { text: "Since a recent event", icon: "arrow-down-outline", nextNodeId: 's4_gen_heal' }] },

    // ANGER
    s3_ang_justice: { id: 's3_ang_justice', text: "What felt wrong?", options: [{ text: "Review: Trust Broken", icon: "shield-outline", nextNodeId: 's4_gen_boundaries' }, { text: "My Worth", icon: "diamond-outline", nextNodeId: 's4_gen_worth' }, { text: "The Truth", icon: "eye-outline", nextNodeId: 's4_gen_truth' }] },
    s3_ang_blocked: { id: 's3_ang_blocked', text: "What stopped you?", options: [{ text: "Someone else", icon: "person-outline", nextNodeId: 's4_gen_navigate' }, { text: "Bad luck", icon: "alert-circle-outline", nextNodeId: 's4_gen_adapt' }, { text: "Fear", icon: "help-circle-outline", nextNodeId: 's4_gen_confront' }] },
    s3_ang_self: { id: 's3_ang_self', text: "Why are you mad at yourself?", options: [{ text: "I knew better", icon: "book-outline", nextNodeId: 's4_gen_growth' }, { text: "I feel weak", icon: "body-outline", nextNodeId: 's4_gen_strength' }, { text: "Wasted time", icon: "time-outline", nextNodeId: 's4_gen_now' }] },


    // --- STAGE 4 (THE TRANSITION) & RESULTS ---
    s4_sad_grief_person: {
        id: 's4_sad_grief_person',
        text: "What do you want to do with your love for them?",
        options: [
            { text: "Keep it inside", result: { title: "It's Okay to Hold On", explanation: "That love isn't gone just because they are. It's living safely inside you now. You don't have to let go until you're ready. Carry it gently.", quote: "Love knows not its own depth until the hour of separation." } },
            { text: "Share it", result: { title: "Share Your Love", explanation: "The most beautiful tribute you can offer is to let their love flow through you into the world. Be kind, be generous, be them for someone else.", quote: "The only cure for grief is action." } },
            { text: "Not sure yet", result: { title: "Take Your Time", explanation: "There is no map for this landscape. It's okay to stand still and just breathe for a while. You don't need to know the next step today.", quote: "Breathe. You are doing enough." } }
        ]
    },

    s4_sad_grief_dream: {
        id: 's4_sad_grief_dream',
        text: "Is the dream gone forever?",
        options: [
            { text: "Yes", result: { title: "New Beginnings", explanation: "When one door closes, it doesn't mean the house is empty. It means there's a different room waiting for you to discover it. This end is the soil for a new seed.", quote: "Every end is a new beginning in disguise." } },
            { text: "Not sure", result: { title: "Change Direction", explanation: "Sometimes the destination isn't what matters, but who you become on the journey. You aren't lost; you are just recalibrating.", quote: "Rejection is often redirection." } },
            { text: "No, just delayed", result: { title: "Patience", explanation: "The timeline might be different than you planned, but the dream is still yours. Rest, then keep going.", quote: "Rivers know this: there is no hurry. We shall get there some day." } }
        ]
    },
    s4_sad_grief_self: {
        id: 's4_sad_grief_self',
        text: "Do you miss who you were?",
        options: [
            { text: "Yes", result: { title: "Growing Pains", explanation: "You are shedding a skin that no longer fits. It hurts to leave the old you behind, but the you that is emerging is stronger, wiser, and more capable.", quote: "You must be willing to let go of the life you planned so as to have the life that is waiting for you." } },
            { text: "Maybe", result: { title: "Be Yourself", explanation: "You don't have to be who you were yesterday. You only have to be true to who you are in this exact moment. That is enough.", quote: "Become who you are." } },
            { text: "I don't know who I am", result: { title: "Discovery", explanation: "That's a beautiful place to be. You are a blank canvas. You get to decide who you want to be now.", quote: "Life isn't about finding yourself. Life is about creating yourself." } }
        ]
    },

    // Default/Generic S4s for coverage - UPGRADED TO 3 OPTIONS
    s4_gen_release: {
        id: 's4_gen_release',
        text: "Ready to let go?",
        options: [
            { text: "Yes", result: { title: "Let It Out", explanation: "Crying is not weakness; it is the soul's way of cleaning the windows so you can see the light again. Let it flow. You are safe.", quote: "The cure for anything is salt water: sweat, tears or the sea." } },
            { text: "No", result: { title: "Be Patient", explanation: "If you need to hold on a little longer, that is okay. Healing happens on its own timeline, not a schedule. Be gentle with your heart.", quote: "Patience is power." } },
            { text: "I don't know how", result: { title: "Just Breathe", explanation: "You don't need a technique. Just sit with the feeling. Acknowledge it. Giving it space is the first step to letting it go.", quote: "What you resist, persists." } }
        ]
    },
    s4_gen_perspective: {
        id: 's4_gen_perspective',
        text: "Can you learn from this?",
        options: [
            { text: "Yes", result: { title: "Learn and Grow", explanation: "Every scar is a lesson, and every lesson makes you wiser. You are turning pain into power. This experience is refining you.", quote: "I have not failed. I've just found 10,000 ways that won't work." } },
            { text: "It's hard", result: { title: "Growing Stronger", explanation: "The strongest steel is forged in the hottest fire. This difficulty is building muscles you didn't know you had. Keep standing.", quote: "Pain is weakness leaving the body." } },
            { text: "Not yet", result: { title: "Survive First", explanation: "You don't need to find the lesson right now. Just getting through the day is victory enough. Wisdom will come later.", quote: "Survival is a form of resistance." } }
        ]
    },
    s4_gen_courage: {
        id: 's4_gen_courage',
        text: "Just take one step.",
        options: [
            { text: "Okay", result: { title: "Start Small", explanation: "A massive mountain is climbed one small step at a time. Ignore the peak. Just look at your feet and take one step.", quote: "Just start." } },
            { text: "I'm stuck", result: { title: "Wiggle", explanation: "If you can't walk, crawl. If you can't crawl, just wiggle your toes. Any movement breaks the paralysis of fear.", quote: "Action cures fear." } },
            { text: "I needs rest", result: { title: "Rest is Action", explanation: "Sometimes the most courageous thing you can do is stop and recharge. Rest so you can rise again.", quote: "Rest is resistance." } }
        ]
    },
    s4_gen_action: {
        id: 's4_gen_action',
        text: "Can you do one small thing?",
        options: [
            { text: "Move a little", result: { title: "Move Your Body", explanation: "Your emotions are physical. Shake your hands, take a walk, or just stretch. Changing your body changes your mind.", quote: "Motion creates emotion." } },
            { text: "Drink water", result: { title: "Nourish", explanation: "Start with the basics. Hydrate. It's a small act of love for yourself that tells your body you care.", quote: "Self-care is divine." } },
            { text: "Tidy up", result: { title: "Clear Space", explanation: "Cleaning just one corner of your room can clear a corner of your mind. Outer order brings inner calm.", quote: "As within, so without." } }
        ]
    },
    s4_gen_spark: {
        id: 's4_gen_spark',
        text: "What did you enjoy before?",
        options: [
            { text: "Making things", result: { title: "Create Something", explanation: "You were born to create. Draw, write, cook, build. It doesn't have to be good; it just has to be yours.", quote: "Art is the survival of the soul." } },
            { text: "Nature", result: { title: "Connect", explanation: "Go outside. touch a tree, look at the sky. Remember that you are part of a vast, beautiful living system.", quote: "Nature does not hurry, yet everything is accomplished." } },
            { text: "Music", result: { title: "Listen", explanation: "Let music carry the weight for a while. Put on your favorite song and let it wash over you.", quote: "Music begins where words end." } }
        ]
    },
    s4_gen_service: {
        id: 's4_gen_service',
        text: "Can you help someone?",
        options: [
            { text: "Yes", result: { title: "Help Others", explanation: "When we help others, we forget our own troubles for a moment. We realize we still have power to bring light.", quote: "Service is the rent we pay for being." } },
            { text: "No energy", result: { title: "Help Yourself", explanation: "If you can't help others right now, you are the one who needs help. Be the person you would save.", quote: "You cannot pour from an empty cup." } },
            { text: "Maybe later", result: { title: "Intention", explanation: "Just the wish to be helpful is a beautiful thing. Hold that intention until you have the strength to act.", quote: "Kindness is a language which the deaf can hear and the blind can see." } }
        ]
    },
    s4_gen_rest: {
        id: 's4_gen_rest',
        text: "Can you rest now?",
        options: [
            { text: "Yes", result: { title: "Rest Now", explanation: "Close your eyes. Drop your shoulders. The world will keep spinning without you for a few minutes. You are allowed to stop.", quote: "Rest is resistance." } },
            { text: "Too busy", result: { title: "Micro-Rest", explanation: "Take 60 seconds. Just 60. Close your eyes and breathe deep. You have one minute to spare for your sanity.", quote: "Pause." } },
            { text: "Feel guilty", result: { title: "You Are Worthy", explanation: "Productivity is not your value. You deserve rest simply because you exist, not because you earned it.", quote: "You are a human being, not a human doing." } }
        ]
    },
    s4_gen_identity: {
        id: 's4_gen_identity',
        text: "Is your job everything?",
        options: [
            { text: "No", result: { title: "You Are More", explanation: "You are a universe of thoughts, feelings, and dreams. Your job is just one small planet in your galaxy.", quote: "Your worth is inherent." } },
            { text: "It feels like it", result: { title: "Expand", explanation: "Rediscover the parts of you that don't have a price tag. Who are you when no one is watching? That is the real you.", quote: "I am large, I contain multitudes." } },
            { text: "I want purpose", result: { title: "Purpose is Being", explanation: "Your purpose isn't a job title. It's how you love, how you listen, and how you show up. You are already living it.", quote: "To be is to do." } }
        ]
    },
    s4_gen_heal: {
        id: 's4_gen_heal',
        text: "Does it still hurt?",
        options: [
            { text: "Yes", result: { title: "Healing Takes Time", explanation: "A wound doesn't heal the moment you bandage it. Treat yourself with the care you'd give a physical injury. Time is the medicine.", quote: "Time heals what reason cannot." } },
            { text: "A little", result: { title: "Progress", explanation: "The sharpness is fading. That means you are healing. Celebrate the small relief; it will grow.", quote: "This too shall pass." } },
            { text: "I'm numb", result: { title: "Feel Again", explanation: "Numbness is a shield. When you are safe, you can slowly lower it and let yourself feel again. It's safe to feel.", quote: "The only way out is through." } }
        ]
    },

    // Anxiety Specific S4s
    s4_anx_fut_fail: {
        id: 's4_anx_fut_fail',
        text: "What if it works out?",
        options: [
            { text: "That would be good", result: { title: "Think Positive", explanation: "Your brain is designed to protect you by showing danger. Hack it by forcing it to visualize success. Visualizing the best case releases the same chemistry as experiencing it.", quote: "What if it turns out better than you could have ever imagined?" } },
            { text: "It won't", result: { title: "Challenge It", explanation: "That is fear talking, not fact. You cannot predict the future. Leave room for the possibility of a miracle.", quote: "Worry is a misuse of imagination." } },
            { text: "I'll survive", result: { title: "Resilience", explanation: "Even if the worst happens, you have survived 100% of your bad days so far. You are stronger than you think.", quote: "You can handle it." } }
        ]
    },
    s4_anx_fut_loss: {
        id: 's4_anx_fut_loss',
        text: "Can you keep everything?",
        options: [
            { text: "No", result: { title: "Let Go", explanation: "Clinging to things causes blisters. Loosening your grip brings relief. Nothing in this world is permanent except your soul.", quote: "This too shall pass." } },
            { text: "I want to", result: { title: "Appreciate", explanation: "Love what you have while you have it, but hold it lightly. Gratitude turns what we have into enough.", quote: "Gratitude is the memory of the heart." } },
            { text: "It hurts", result: { title: "Grief is Love", explanation: "The pain of losing something is the shadow of the love you had for it. Honor the love, not the loss.", quote: "Grief is the price we pay for love." } }
        ]
    },
    s4_anx_fut_unknown: {
        id: 's4_anx_fut_unknown',
        text: "Can you trust the process?",
        options: [
            { text: "I'll try", result: { title: "Trust", explanation: "Life has supported you this far. Trust that the ground will be there when you take the next step.", quote: "Leap and the net will appear." } },
            { text: "It's dark", result: { title: "Inner Light", explanation: "When you can't see the path outside, look inside. Your intuition is a compass that works in the dark.", quote: "You are the light." } },
            { text: "I need a plan", result: { title: "One Step", explanation: "You don't need to see the whole staircase. You just need to see the first step. Take that one.", quote: "A journey of a thousand miles begins with a single step." } }
        ]
    },

    s4_anx_past_mistake: {
        id: 's4_anx_past_mistake',
        text: "Did you learn something?",
        options: [
            { text: "Yes", result: { title: "A Lesson", explanation: "Then it wasn't a mistake; it was a masterclass. You paid for wisdom with that experience. Keep the wisdom, lose the guilt.", quote: "Experience is what you get when you didn't get what you wanted." } },
            { text: "No", result: { title: "Look Closer", explanation: "There is always something to learn. Even if it's just 'I don't want to do that again.' That is valuable knowledge.", quote: "Failure is success in progress." } },
            { text: "I regret it", result: { title: "Forgive Yourself", explanation: "You did the best you could with what you knew then. You know more now. Be kind to your younger self.", quote: "Forgiveness is giving up the hope that the past could have been any different." } }
        ]
    },
    s4_anx_past_nostalgia: {
        id: 's4_anx_past_nostalgia',
        text: "Do you miss the feeling?",
        options: [
            { text: "Yes", result: { title: "Feel Good Again", explanation: "You felt that happiness once, which means you are capable of feeling it. You are the source, not the past.", quote: "The best is yet to come." } },
            { text: "I miss them", result: { title: "Cherish", explanation: "Be glad it happened, not sad it's over. The love you felt is still yours to keep.", quote: "Don't cry because it's over, smile because it happened." } },
            { text: "It was better", result: { title: "Now is Power", explanation: "The past is a memory. THe future is a fantasy. The only reality is now. Make this moment beautiful.", quote: "Be here now." } }
        ]
    },
    s4_anx_past_shame: {
        id: 's4_anx_past_shame',
        text: "Does shame help?",
        options: [
            { text: "No", result: { title: "Let Shame Go", explanation: "Shame is a heavy coat that keeps you warm but weighs you down. It's time to take it off. You are not your actions.", quote: "You are enough." } },
            { text: "I deserve it", result: { title: "Compassion", explanation: "No one 'deserves' to suffer. Punishing yourself won't fix the past. Healing yourself will fix the future.", quote: "Be kind to yourself." } },
            { text: "I can't hide", result: { title: "Vulnerability", explanation: "You don't need to hide. Your flaws make you human, and your humanity makes you beautiful.", quote: "There is a crack in everything, that's how the light gets in." } }
        ]
    },

    s4_anx_oth_society: {
        id: 's4_anx_oth_society',
        text: "Does it really matter?",
        options: [
            { text: "No", result: { title: "Ignore Them", explanation: "The opinions of others are none of your business. Live your truth. Those who matter don't mind, and those who mind don't matter.", quote: "Lions don't lose sleep over sheep." } },
            { text: "Yes", result: { title: "Perspective", explanation: "In 100 years, no one will remember this awkward moment. You are free to make mistakes.", quote: "This too shall pass." } },
            { text: "I want to belong", result: { title: "Find Your Tribe", explanation: "Don't change to fit in. Be yourself to stand out. Your vibe attracts your tribe.", quote: "Belong to yourself first." } }
        ]
    },
    s4_anx_oth_parent: {
        id: 's4_anx_oth_parent',
        text: "Are you an adult?",
        options: [
            { text: "Yes", result: { title: "Take Charge", explanation: "You are the author of your story now. You hold the pen. Write a chapter that makes YOU happy.", quote: "You are the captain of your soul." } },
            { text: "Kind of", result: { title: "Independence", explanation: "It's time to cut the cord. Respect their advice, but follow your own intuition. You know what's best for you.", quote: "Trust yourself." } },
            { text: "No", result: { title: "Patience", explanation: "One day you will be free to make all your own choices. For now, cultivate your inner world. That is always yours.", quote: "Freedom is a state of mind." } }
        ]
    },
    s4_anx_oth_self: {
        id: 's4_anx_oth_self',
        text: "Be kind to yourself?",
        options: [
            { text: "I will", result: { title: "Love Yourself", explanation: "Talk to yourself like you would talk to a best friend. Be gentle. Be encouraging. You are doing great.", quote: "Self-love is the best love." } },
            { text: "It's hard", result: { title: "Practice", explanation: "Self-love is a practice, not a destination. Start with one kind thought today.", quote: "You are a work of art." } },
            { text: "I'm trying", result: { title: "Keep Going", explanation: "Trying is enough. Every effort counts. You are planting seeds of kindness that will harvest later.", quote: "A little progress each day adds up to big results." } }
        ]
    },

    s4_anx_over_volume: {
        id: 's4_anx_over_volume',
        text: "Can you do one thing?",
        options: [
            { text: "Yes", result: { title: "One Thing", explanation: "Forget the mountain. Pick up one pebble. Do that one email, wash that one dish. Momentum starts with one thing.", quote: "A journey of a thousand miles begins with a single step." } },
            { text: "Where to start?", result: { title: "Anywhere", explanation: "It doesn't matter where you start, only that you start. Pick the easiest thing and do it badly if you have to.", quote: "Done is better than perfect." } },
            { text: "No", result: { title: "Rest", explanation: "If you can't do one thing, then your one thing is to rest. Recharge untl you can.", quote: "Rest to rebuild." } }
        ]
    },
    s4_anx_over_perf: {
        id: 's4_anx_over_perf',
        text: "Does it need to be perfect?",
        options: [
            { text: "No", result: { title: "Good Enough", explanation: "Perfection is the enemy of done. Embrace the messy, imperfect action. That's where life happens.", quote: "Strive for progress, not perfection." } },
            { text: "Yes", result: { title: "Why?", explanation: "Who are you trying to impress? You are worthy even if you make mistakes. Your value is not in your performance.", quote: "You are enough." } },
            { text: "I fear judgment", result: { title: "Be Brave", explanation: "Create for yourself, not for the audience. Their judgment says more about them than you.", quote: "Dance like nobody's watching." } }
        ]
    },
    s4_anx_over_start: {
        id: 's4_anx_over_start',
        text: "What's the first step?",
        options: [
            { text: "Breathe", result: { title: "Just Breathe", explanation: "Before you do, be. Take a deep breath. Center yourself. Action effectively comes from calm.", quote: "Breathe." } },
            { text: "Make a list", result: { title: "Brain Dump", explanation: "Get it all out of your head onto paper. You don't have to do it all, just capture it. Your mind needs space.", quote: "Clear your mind." } },
            { text: "Set a timer", result: { title: "5 Minutes", explanation: "Commit to just 5 minutes of work. You can do anything for 5 minutes. Often, that's all you need to keep going.", quote: "Small starts lead to big finishes." } }
        ]
    },

    // Anger Specific S4s
    s4_gen_boundaries: {
        id: 's4_gen_boundaries',
        text: "Need to say no?",
        options: [
            { text: "Yes", result: { title: "Say No", explanation: "No is a complete sentence. You protect your energy by defining what you allow into your life.", quote: "Givers need to set limits because takers rarely do." } },
            { text: "I feel guilty", result: { title: "It's Okay", explanation: "Disappointing others is better than destroying yourself. Your well-being is your priority.", quote: "You can't pour from an empty cup." } },
            { text: "They will be mad", result: { title: "Let Them", explanation: "Their reaction is their responsibility. Your boundary is your responsibility. Stand firm.", quote: "Peace over popularity." } }
        ]
    },
    s4_gen_worth: {
        id: 's4_gen_worth',
        text: "Does this change your worth?",
        options: [
            { text: "No", result: { title: "You Are Valuable", explanation: "Your value is not determined by how people treat you. You are a diamond even if they treat you like rocks.", quote: "Know your worth." } },
            { text: "It feels like it", result: { title: "Reclaim It", explanation: "Take back your power. Do not give them the remote control to your self-esteem.", quote: "No one can make you feel inferior without your consent." } },
            { text: "I'm angry", result: { title: "Use Anger", explanation: "Anger is fuel. Use it to build a better boundary, not to burn down the house.", quote: "Channel your fire." } }
        ]
    },
    s4_gen_truth: {
        id: 's4_gen_truth',
        text: "Speak up?",
        options: [
            { text: "Yes", result: { title: "Speak Truth", explanation: "Your voice matters. Speak clearly, calmly, and firmly. The truth has its own power.", quote: "The truth will set you free." } },
            { text: "Later", result: { title: "Cool Down", explanation: "Write it down first. Speak when you are calm so you can be heard, not just reacted to.", quote: "Respond, don't react." } },
            { text: "Scared", result: { title: "Be Brave", explanation: "Do it afraid. Your integrity is worth the temporary discomfort of confrontation.", quote: "Silence is consent." } }
        ]
    },
    s4_gen_navigate: {
        id: 's4_gen_navigate',
        text: "Find another way?",
        options: [
            { text: "Maybe", result: { title: "Be Flexible", explanation: "Water flows around the rock. Be like water. If the door is locked, look for a window.", quote: "Be like water." } },
            { text: "I'm stuck", result: { title: "Pivot", explanation: "This isn't a dead end; it's a detour. Detours often lead to better scenic routes.", quote: "Rejection is redirection." } },
            { text: "Force it", result: { title: "Don't Force", explanation: "If it doesn't open, it's not your door. forcing it breaks the key. Step back.", quote: "Flow, don't force." } }
        ]
    },
    s4_gen_adapt: {
        id: 's4_gen_adapt',
        text: "Can you adapt?",
        options: [
            { text: "Yes", result: { title: "Adapt", explanation: "Biology says the most adaptable survive. You are evolving effectively right now.", quote: "Bend so you don't break." } },
            { text: "It's unfair", result: { title: "Acceptance", explanation: "Accepting reality doesn't mean liking it. It means you stop fighting the rain and open an umbrella.", quote: "It is what it is." } },
            { text: "I hate change", result: { title: "Growth", explanation: "Change is the only constant. Embrace the new energy. It brings new gifts.", quote: "Change is good." } }
        ]
    },
    s4_gen_confront: {
        id: 's4_gen_confront',
        text: "What's the worst that can happen?",
        options: [
            { text: "Not much", result: { title: "Be Brave", explanation: "The fear of the thing is often worse than the thing itself. Face it and the ghost disappears.", quote: "Daring greatly." } },
            { text: "Rejection", result: { title: "So What?", explanation: "If they reject you, they are clearing space for people who accept you. It's a favor.", quote: "Rejection is protection." } },
            { text: "Conflict", result: { title: "Peace", explanation: "Conflict is sometimes the price of peace. Clear the air so you can breathe freely.", quote: "Peace requires courage." } }
        ]
    },
    s4_gen_growth: {
        id: 's4_gen_growth',
        text: "Are you learning?",
        options: [
            { text: "Yes", result: { title: "Growing", explanation: "You are not the same person you were yesterday. You are wiser. That is worth the pain.", quote: "Growth is painful but necessary." } },
            { text: "It hurts", result: { title: "Expansion", explanation: "Your heart is not breaking; it is stretching to hold more compassion and wisdom.", quote: "The wound is the place where the light enters you." } },
            { text: "Why me?", result: { title: "For You", explanation: "Life doesn't happen to you; it happens for you. This challenge is your gym.", quote: "Amor Fati - Love your fate." } }
        ]
    },
    s4_gen_strength: {
        id: 's4_gen_strength',
        text: "Ask for help?",
        options: [
            { text: "Okay", result: { title: "Connect", explanation: "We are social creatures. Asking for help is not weakness; it is wisdom. Let others support you.", quote: "Together we go far." } },
            { text: "I'm alone", result: { title: "Reach Out", explanation: "You are never as alone as you think. Reach out. People want to help.", quote: "You are not alone." } },
            { text: "I can do it", result: { title: "Stronger Together", explanation: "You can do it alone, but you don't have to. Shared burdens are lighter.", quote: "Ideally, we carry each other." } }
        ]
    },
    s4_gen_now: {
        id: 's4_gen_now',
        text: "Focus on now?",
        options: [
            { text: "Yes", result: { title: "Be Here", explanation: "The past is gone. The future is not here. Your power is in this exact second. Breathe into it.", quote: "Be here now." } },
            { text: "Mind racing", result: { title: "Grounding", explanation: "Name 5 things you can see. 4 things you can hear. Bring your mind back to your body.", quote: "Ground yourself." } },
            { text: "I'm angry", result: { title: "Release", explanation: "Feel the anger, then release it. Holding it is drinking poison and expecting the other to die.", quote: "Let it go." } }
        ]
    },

    // SADNESS > LONELY S4s
    s4_sad_lonely_und: {
        id: 's4_sad_lonely_und',
        text: "Can you be real?",
        options: [
            { text: "Scary", result: { title: "Be Real", explanation: "Vulnerability is the price of admission for intimacy. If you want connection, you must be seen.", quote: "Authenticity attracts." } },
            { text: "I try", result: { title: "Keep Trying", explanation: "The right people will love the real you. Don't dim your light to fit into small rooms.", quote: "Shine bright." } },
            { text: "No one cares", result: { title: "You Care", explanation: "You care. Start there. Be your own best audience. The world will catch up.", quote: "You matter." } }
        ]
    },
    s4_sad_lonely_push: {
        id: 's4_sad_lonely_push',
        text: "Putting up walls?",
        options: [
            { text: "Yes", result: { title: "Open Up", explanation: "Walls keep pain out, but they also keep love out. Put a door in that wall.", quote: "Open your heart." } },
            { text: "Trapped", result: { title: "Freedom", explanation: "The door is unlocked from the inside. You can step out whenever you are ready.", quote: "Free yourself." } },
            { text: "Safe", result: { title: "Venture Out", explanation: "Safety is good for a while, but ships aren't built to stay in the harbor. Sail out.", quote: "Courage, dear heart." } }
        ]
    },
    s4_sad_lonely_crave: {
        id: 's4_sad_lonely_crave',
        text: "Give love?",
        options: [
            { text: "I'll try", result: { title: "Be a Friend", explanation: "The best way to find a friend is to be one. Radiate the warmth you wish to feel.", quote: "Attract what you are." } },
            { text: "Empty", result: { title: "Self-Love", explanation: "Fill your own cup first. Treat yourself to a date. Fall in love with your own life.", quote: "You are the one." } },
            { text: "How?", result: { title: "Small Acts", explanation: "Smile at a stranger. Text a friend. Appreciation is love in action.", quote: "Love is a verb." } }
        ]
    },

    // SADNESS > TIRED S4s
    s4_sad_tired_body: {
        id: 's4_sad_tired_body',
        text: "Sleep soon?",
        options: [
            { text: "Yes", result: { title: "Sleep Well", explanation: "Your body is a temple, and it needs maintenance. Wrap yourself in blankets and drift away.", quote: "Rest to rebuild." } },
            { text: "Can't sleep", result: { title: "Rest Eyes", explanation: "Just lying in the dark with your eyes closed is mostly as good as sleep. No pressure.", quote: "Drift." } },
            { text: "Too wired", result: { title: "Unplug", explanation: "Turn off the screens. Let your nervous system settle down. The digital world can wait.", quote: "Disconnect to reconnect." } }
        ]
    },
    s4_sad_tired_soul: {
        id: 's4_sad_tired_soul',
        text: "Stop pretending?",
        options: [
            { text: "Yes", result: { title: "Be You", explanation: "It is exhausting to wear a mask. Take it off. The air feels better on your own skin.", quote: "Just be you." } },
            { text: "Safety", result: { title: "Safe Space", explanation: "Find one place or person where you don't have to perform. Be messy there.", quote: "Come as you are." } },
            { text: "I forget how", result: { title: "Rediscover", explanation: "Listen to the quiet voice inside. That is you. Follow it.", quote: "Listen to your soul." } }
        ]
    },
    s4_sad_tired_mind: {
        id: 's4_sad_tired_mind',
        text: "Quiet time?",
        options: [
            { text: "Yes", result: { title: "Quiet", explanation: "Silence is not empty; it is full of answers. Give yourself the gift of silence.", quote: "Silence is golden." } },
            { text: "Racing thoughts", result: { title: "Observe", explanation: "Watch your thoughts like clouds passing in the sky. You are the sky, not the clouds.", quote: "Observe, don't absorb." } },
            { text: "Bored", result: { title: "Be Bored", explanation: "Boredom is the birthplace of creativity. Let yourself be bored.", quote: "Stillness speaks." } }
        ]
    },

    // SADNESS > DISAPPOINTED S4s
    s4_sad_dis_promise: {
        id: 's4_sad_dis_promise',
        text: "Try again?",
        options: [
            { text: "Yes", result: { title: "Start Again", explanation: "The sun rises every morning, and so can you. Nothing is wasted if you start again.", quote: "Begin again." } },
            { text: "Too hard", result: { title: "Gentle Start", explanation: "You don't have to sprint. Just stand up. That is enough for today.", quote: "One day at a time." } },
            { text: "Scared", result: { title: "Courage", explanation: "Courage is not the absence of fear, but walking forward while your knees shake.", quote: "Feel the fear and do it anyway." } }
        ]
    },
    s4_sad_dis_lagging: {
        id: 's4_sad_dis_lagging',
        text: "Your own pace?",
        options: [
            { text: "Yes", result: { title: "Your Pace", explanation: "You are not late. You are exactly where you are supposed to be. Flowers bloom when they are ready, not when you tell them to.", quote: "Trust the timing." } },
            { text: "Feeling behind", result: { title: "No Race", explanation: "Life is a journey, not a race. There is no one to catch up to.", quote: "Run your own race." } },
            { text: "Comparison", result: { title: "Focus Inward", explanation: "Comparison is the thief of joy. Look at your own path; it's beautiful.", quote: "Stay in your lane." } }
        ]
    },
    s4_sad_dis_mistake: {
        id: 's4_sad_dis_mistake',
        text: "Does it define you?",
        options: [
            { text: "No", result: { title: "Move On", explanation: "You are not your mistakes. You are the person who learns from them.", quote: "Fail forward." } },
            { text: "Yes", result: { title: "Release Label", explanation: "Peel that label off. You are a complex, growing human being, not a single error.", quote: "I am not what happened to me." } },
            { text: "Guilt", result: { title: "Make Amends", explanation: "If you need to apologize, do it. Then forgive yourself. Punishment is not penance.", quote: "Forgive yourself." } }
        ]
    },

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
                colors={['#0f172a', '#1e1b4b', '#020617']}
                opacity={0.95}
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
                    <Text style={styles.headerTitle}>Soul Space</Text>
                    <View style={{ width: 32 }} />
                </View>

                {/* Progress Indicator */}
                <StageProgress step={currentStep} />

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {result ? (
                        <Animated.View
                            entering={FadeInDown.duration(800).springify()}
                            style={styles.resultContainer}
                        >
                            {/* REMOVED BIG FANCY ICON AS REQUESTED */}

                            <Text style={styles.resultTitle}>{result.title}</Text>

                            <View style={styles.explanationContainer}>
                                <Text style={styles.explanationText}>{result.explanation}</Text>
                            </View>

                            <View style={styles.quoteContainer}>
                                <MaterialIcons name="format-quote" size={32} color="rgba(249,115,22,0.6)" style={{ marginBottom: 16 }} />
                                <Text style={styles.quoteText}>{result.quote}</Text>
                            </View>
                        </Animated.View>
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

                {result && (
                    <Animated.View
                        entering={FadeInDown.delay(800).duration(400)}
                        style={styles.footerContainer}
                    >
                        <TouchableOpacity
                            style={styles.helpButton}
                            onPress={navigateToChat}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.05)']}
                                style={styles.helpButtonGradient}
                            >
                                <Text style={styles.helpButtonText}>Still feeling it? Talk to Universe</Text>
                                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#38bdf8" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.homeButton}
                            onPress={() => router.replace('/home')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.homeButtonText}>Go Home</Text>
                            <Ionicons name="home-outline" size={16} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
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
        paddingBottom: 120,
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

    // Result
    resultContainer: {
        alignItems: 'center',
        width: '100%',
        paddingTop: 20,
    },
    resultTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 32,
        color: '#fff',
        marginBottom: 32,
        textAlign: 'center',
    },
    explanationContainer: {
        width: '100%',
        marginBottom: 32,
        paddingHorizontal: 10,
    },
    explanationText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 20, // Bigger
        color: '#e2e8f0',
        lineHeight: 34,
        textAlign: 'center',
    },
    quoteContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    quoteText: {
        fontFamily: 'Comfortaa_700BoldItalic',
        fontSize: 20,
        color: '#f97316',
        textAlign: 'center',
        lineHeight: 32,
        opacity: 0.9,
    },

    // Footer
    footerContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        alignItems: 'center',
        gap: 16,
    },
    helpButton: {
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)', // Cyan hint
        width: '100%',
        maxWidth: 300,
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    helpButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    helpButtonText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: '#e0f2fe',
    },
    homeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    homeButtonText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
    }
});

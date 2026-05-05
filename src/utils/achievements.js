import { 
    TreePine, Zap, Flame, Clock, 
    Award, Shield, Rocket, 
    Coffee, Sun, Moon, Target 
} from 'lucide-react';

export const BADGES = [
    {
        id: 'seedling',
        name: 'Seedling',
        description: 'Plant your first tree',
        icon: TreePine,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        check: (stats) => stats.treesPlanted >= 1
    },
    {
        id: 'sessions-10',
        name: 'Dedicated',
        description: 'Complete 10 sessions',
        icon: Zap,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        check: (stats) => stats.sessionsCount >= 10
    },
    {
        id: 'hours-5',
        name: 'Deep Worker',
        description: '5 hours total focus',
        icon: Clock,
        color: 'text-brand',
        bg: 'bg-brand/10',
        check: (stats) => stats.totalFocusTime >= 5 * 3600
    },
    {
        id: 'streak-3',
        name: 'On Fire',
        description: '3 day focus streak',
        icon: Flame,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        check: (stats) => stats.streak >= 3
    },
    {
        id: 'century-club',
        name: 'Century Club',
        description: '100 trees planted',
        icon: Award,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        check: (stats) => stats.treesPlanted >= 100
    },
    {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Focus before 8 AM',
        icon: Sun,
        color: 'text-amber-400',
        bg: 'bg-amber-400/10',
        check: (stats) => stats.earlyBird
    },
    {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Focus after 11 PM',
        icon: Moon,
        color: 'text-indigo-400',
        bg: 'bg-indigo-400/10',
        check: (stats) => stats.nightOwl
    },
    {
        id: 'overachiever',
        name: 'Overachiever',
        description: '8+ sessions in one day',
        icon: Rocket,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        check: (stats) => stats.maxSessionsPerDay >= 8
    },
    {
        id: 'consistent',
        name: 'Consistent',
        description: '7 day streak',
        icon: Shield,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        check: (stats) => stats.streak >= 7
    },
    {
        id: 'marathon',
        name: 'Focus Marathon',
        description: '4 hours in one day',
        icon: Target,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        check: (stats) => stats.totalFocusTime >= 4 * 3600
    }
];

export const getUnlockedBadges = (stats) => {
    return BADGES.filter(badge => badge.check(stats)).map(badge => badge.id);
};

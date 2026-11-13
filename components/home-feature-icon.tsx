import { Glasses, Zap, Building2, Globe, Bot, ScrollText, ShieldCheck, Video, BarChart3, TrendingUp, Languages, Star, Coins, Lock, Gem, Sparkles, type LucideIcon } from 'lucide-react';
import type { FeatureIconKey } from '@/lib/home-features';

export const FEATURE_ICONS: Record<FeatureIconKey, LucideIcon> = {
  glasses: Glasses, zap: Zap, building: Building2, globe: Globe, bot: Bot, scroll: ScrollText, shield: ShieldCheck,
  video: Video, chart: BarChart3, trending: TrendingUp, languages: Languages, star: Star, coins: Coins, lock: Lock, gem: Gem, sparkles: Sparkles,
};

// The icons the built-in strip uses, in order.
export const DEFAULT_ICON_ORDER: FeatureIconKey[] = ['glasses', 'zap', 'building', 'globe', 'bot', 'scroll', 'shield', 'video', 'chart', 'trending', 'languages'];

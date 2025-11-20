import { IconSymbol } from '@/components/ui/IconSymbol';

export const tabIconMap = {
  index: (color: string, size: number) => (
    <IconSymbol name="house.fill" size={size} color={color} />
  ),
  wallet: (color: string, size: number) => (
    <IconSymbol name="creditcard.fill" size={size} color={color} />
  ),
  profile: (color: string, size: number) => (
    <IconSymbol name="person.crop.circle.fill" size={size} color={color} />
  ),
  notifications: (color: string, size: number) => (
    <IconSymbol name="bell.fill" size={size} color={color} />
  ),
  leaderboard: (color: string, size: number) => (
    <IconSymbol name="chart.bar.fill" size={size} color={color} />
  ),
};

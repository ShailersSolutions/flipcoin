import { IconSymbol } from '@/components/ui/IconSymbol';

export const tabIconMap = {
  index: (color: string, size: number) => (
    <IconSymbol name="house.fill" size={size} color={color} />
  ),
  notifications: (color: string, size: number) => (
    <IconSymbol name="bell.fill" size={size} color={color} />
  ),
  'admin-profile': (color: string, size: number) => (
    <IconSymbol name="person.crop.circle.fill" size={size} color={color} />
  ),
  users: (color: string, size: number) => (
    <IconSymbol name="person.2.fill" size={size} color={color} />
  ),
};

import { StyleSheet } from 'react-native';
import { radius, spacing } from './theme';

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  gap8: { gap: spacing.xs },
  gap12: { gap: spacing.sm },
  gap16: { gap: spacing.md },
});

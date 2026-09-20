import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSettings } from '@/hooks/useSettings';
import { font, radius, spacing, weight } from '@/constants/theme';

interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  hint?: string;
  error?: string;
  suffix?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  editable?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  hint,
  error,
  suffix,
  autoCapitalize,
  multiline,
  editable = true,
  style,
  inputStyle,
}: AppInputProps) {
  const { palette, isRTL } = useSettings();
  return (
    <View style={[{ gap: 4 }, style]}>
      <Text
        style={[
          styles.label,
          { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left' },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: editable ? palette.surface : palette.surfaceAlt,
            borderColor: error ? palette.loss : palette.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.textSubtle}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
          editable={editable}
          multiline={multiline}
          style={[
            {
              flex: 1,
              color: palette.text,
              fontSize: font.body,
              paddingVertical: 10,
              paddingHorizontal: 12,
              textAlign: isRTL ? 'right' : 'left',
              minHeight: multiline ? 80 : 44,
              textAlignVertical: multiline ? 'top' : 'center',
              includeFontPadding: false,
            },
            inputStyle,
          ]}
        />
        {suffix ? (
          <Text
            style={{
              color: palette.textSubtle,
              fontSize: font.caption,
              paddingHorizontal: 12,
              fontWeight: weight.medium,
            }}
          >
            {suffix}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.hint, { color: palette.loss, textAlign: isRTL ? 'right' : 'left' }]}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: palette.textSubtle, textAlign: isRTL ? 'right' : 'left' }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: font.caption,
    fontWeight: weight.semibold,
    marginBottom: 4,
  },
  inputWrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  hint: {
    fontSize: font.micro,
    marginTop: 2,
  },
});

import { ScrollView, StyleSheet, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ukColors, ukSpace } from "@/lib/theme";

/**
 * Shared scrollable screen wrapper that respects the device safe areas.
 *
 * The top inset (notch / Dynamic Island / status bar) is added on top of the
 * standard horizontal padding, and the bottom inset (home indicator / gesture
 * bar) is reserved at the end of the content so nothing is clipped on narrow
 * or notched devices. This is the React Native counterpart of the prototype's
 * `--safe-top` / `--safe-bottom` CSS variables.
 */
export function ScreenScroll({ contentContainerStyle, style, ...props }: ScrollViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.root, style]}
      contentContainerStyle={[
        {
          paddingTop: insets.top + ukSpace.lg,
          paddingHorizontal: ukSpace.lg,
          paddingBottom: insets.bottom + ukSpace.xl,
        },
        contentContainerStyle,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ukColors.bg },
});

/**
 * Theme - Birleşik Design System
 */

import { colors } from "./colors";
import { spacing, borderRadius, iconSize, componentSize } from "./spacing";
import { typography, textStyles } from "./typography";
import { shadows, cardShadow, modalShadow, buttonShadow } from "./shadows";

export const theme = {
  colors,
  spacing,
  borderRadius,
  iconSize,
  componentSize,
  typography,
  textStyles,
  shadows,
} as const;

export {
  colors,
  spacing,
  borderRadius,
  iconSize,
  componentSize,
  typography,
  textStyles,
  shadows,
  cardShadow,
  modalShadow,
  buttonShadow,
};

export type Theme = typeof theme;

export const UI_THEME_IDS = ["stalker", "viking", "zone"] as const;

export type UiThemeId = (typeof UI_THEME_IDS)[number];

export function isUiThemeId(v: string): v is UiThemeId {
  return (UI_THEME_IDS as readonly string[]).includes(v);
}

export const UI_THEME_IDS_FOR_ZOD = UI_THEME_IDS as unknown as [
  UiThemeId,
  ...UiThemeId[],
];

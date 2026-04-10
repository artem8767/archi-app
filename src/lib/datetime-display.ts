/** Параметри для next-intl `format.dateTime`: дата + час у 24-годинному форматі. */
export const dateTimeShort24h = {
  dateStyle: "short" as const,
  timeStyle: "short" as const,
  hourCycle: "h23" as const,
};

/** Лише час, 24 години (наприклад у чаті). */
export const timeShort24h = {
  timeStyle: "short" as const,
  hourCycle: "h23" as const,
};

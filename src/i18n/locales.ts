export const locales = ['th', 'en'] as const;
export type Locale = typeof locales[number];

// ค่าเริ่มต้น
export const defaultLocale: Locale = 'th';

// ถ้าต้องการ prefix เสมอ: 'always' | 'as-needed' | 'never'
export const localePrefix = 'always' as const;
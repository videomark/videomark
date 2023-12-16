import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';

const { SODIUM_MARKETING_SITE_URL } = import.meta.env;

/**
 * ヘルプページの URL。
 */
export const helpURL = new URL(`${SODIUM_MARKETING_SITE_URL}/${get(locale)}/help/extension`);

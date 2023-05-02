import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';
import { isExtension, isVmBrowser } from './runtime';

const { SODIUM_MARKETING_SITE_URL } = import.meta.env;

/**
 * ヘルプページの URL。カスタムブラウザーか拡張機能かによって URL が異なる。
 */
export const helpURL = ((base) => {
  if (isVmBrowser()) {
    return new URL('android', base);
  }

  if (isExtension()) {
    return new URL('extension', base);
  }

  return base;
})(new URL(`${SODIUM_MARKETING_SITE_URL}/${get(locale)}/help/`));

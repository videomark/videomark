<script>
  import { AppShell } from '@sveltia/ui';
  import { onMount } from 'svelte';
  import { isLoading, locale } from 'svelte-i18n';
  import History from '$lib/pages/routes/history.svelte';
  import Onboarding from '$lib/pages/routes/onboarding.svelte';
  import Popup from '$lib/pages/routes/popup.svelte';
  import Settings from '$lib/pages/routes/settings.svelte';
  import { initAppLocales } from '$lib/services/i18n';
  import { selectedPageName } from '$lib/services/navigation';

  const pages = {
    history: History,
    onboarding: Onboarding,
    popup: Popup,
    settings: Settings,
  };

  const CurrentPage = $derived(pages[$selectedPageName]);

  const selectPage = () => {
    const [, pageName] =
      window.location.hash.match(new RegExp(`^#\\/(${Object.keys(pages).join('|')})\\b`)) || [];

    if (pageName && pageName in pages) {
      selectedPageName.set(pageName);
    } else {
      // 404
      selectedPageName.set();
    }
  };

  onMount(() => {
    selectPage();
  });

  initAppLocales(chrome.i18n.getUILanguage());
</script>

<svelte:window onhashchange={() => selectPage()} />

{#if !$isLoading && $locale}
  <AppShell>
    <CurrentPage />
  </AppShell>
{/if}

<style lang="scss" global>
  :root {
    --sui-base-hue: 22 !important;
    --video-background-color: #111; /* hardcoded */

    @media (max-width: 767px) {
      --page-padding: 16px;
    }

    @media (min-width: 768px) {
      --page-padding: 32px;
    }
  }

  :global(button.secondary) {
    color: var(--sui-highlight-foreground-color) !important;
  }
</style>

<script>
  import History from '$lib/pages/routes/history.svelte';
  import Onboarding from '$lib/pages/routes/onboarding.svelte';
  import Popup from '$lib/pages/routes/popup.svelte';
  import Settings from '$lib/pages/routes/settings.svelte';
  import { initAppLocales } from '$lib/services/i18n';
  import { selectedPageName } from '$lib/services/navigation';
  import { AppShell } from '@sveltia/ui';
  import { onMount } from 'svelte';
  import { isLoading, locale } from 'svelte-i18n';

  const pages = {
    history: History,
    onboarding: Onboarding,
    popup: Popup,
    settings: Settings,
  };

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

  initAppLocales();
</script>

<svelte:window on:hashchange={() => selectPage()} />

{#if !$isLoading && $locale}
  <AppShell>
    <svelte:component this={pages[$selectedPageName]} />
  </AppShell>
{/if}

<style lang="scss" global>
  :root {
    --base-hue: 22 !important;
    --video-background-color: #111; // !hardcoded
  }

  button.secondary {
    color: var(--highlight-foreground-color) !important;
  }
</style>

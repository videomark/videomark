<script>
  import { storage } from '$lib/services/storage';
  import { Button, Icon } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';

  const { SODIUM_MARKETING_SITE_URL } = import.meta.env;
  const pages = ['visualize', 'dropdown', 'history', 'privacy'];
  let currentIndex = 0;

  $: isLastPage = currentIndex === pages.length - 1;

  const agreeTerms = () => {
    storage.set('AgreedTerm', true);
    chrome.action.setPopup({ popup: '/index.html#/popup' });
    window.location.replace('#/history');
  };
</script>

<div class="row">
  <div class="col">
    <img src="/images/onboarding/{pages[currentIndex]}.png" alt="" />
  </div>
  <div class="col">
    <h2>{@html $_(`onboarding.${pages[currentIndex]}.title`)}</h2>
    <p>{$_(`onboarding.${pages[currentIndex]}.description`)}</p>
    {#if isLastPage}
      <p class="extra">
        {@html $_(`onboarding.${pages[currentIndex]}.extra`).replaceAll(
          /<a (.+?)>/g,
          `<a href="${SODIUM_MARKETING_SITE_URL}/${$locale}/$1" target="_blank">`,
        )}
      </p>
    {/if}
    <p class="nav" role="navigation">
      {#each pages as page, index}
        <Button
          pressed={index === currentIndex}
          on:click={() => {
            currentIndex = index;
          }}
        >
          <Icon name="circle" label={$_(`onboarding.${page}.title`)} />
        </Button>
      {/each}
    </p>
    <p class="action">
      {#if isLastPage}
        <Button
          class="primary pill"
          on:click={() => {
            agreeTerms();
          }}
        >
          {$_('onboarding.navigation.start')}
        </Button>
      {:else}
        <Button
          class="primary pill"
          on:click={() => {
            currentIndex += 1;
          }}
        >
          {$_('onboarding.navigation.next')}
        </Button>
      {/if}
    </p>
  </div>
</div>

<style lang="scss">
  h2 {
    word-break: keep-all; // `<wbr>` 対応
  }

  .row {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: 64px;
    min-height: 400px;

    .col:last-of-type {
      width: 45%;
    }
  }

  .nav {
    display: flex;
    justify-content: center;
    gap: 8px;

    :global(button .icon) {
      font-size: var(--font-size--large);
      font-variation-settings: 'FILL' 1;
    }

    :global(button[aria-pressed='true']) {
      color: var(--primary-accent-color);
      cursor: default;
    }
  }

  .action {
    :global(button) {
      min-width: 160px;
    }
  }

  img {
    width: 100%;
  }

  .extra {
    font-size: var(--font-size--small);
    color: var(--tertiary-foreground-color);

    :global(a) {
      color: inherit;
      text-decoration: underline;
    }
  }
</style>
<script>
  import { Button, Icon } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';
  import { storage } from '$lib/services/storage';

  const { SODIUM_MARKETING_SITE_URL } = import.meta.env;
  const pages = ['visualize', 'dropdown', 'history', 'privacy'];
  let currentIndex = 0;

  $: currentPage = pages[currentIndex];
  $: isLastPage = currentIndex === pages.length - 1;
  $: imageExtension = currentPage === 'privacy' ? 'svg' : `${$locale}.png`;

  const agreeTerms = () => {
    storage.set('AgreedTerm', true);
    (chrome.action ?? chrome.browserAction).setPopup({ popup: '/index.html#/popup' });
    window.location.replace('#/history');
  };
</script>

<div class="row">
  <div class="col">
    <img src="/images/onboarding/{currentPage}.{imageExtension}" alt="" />
  </div>
  <div class="col">
    <h2>{@html $_(`onboarding.${currentPage}.title`)}</h2>
    <p>{$_(`onboarding.${currentPage}.description`)}</p>
    {#if isLastPage}
      <p class="extra">
        {@html $_(`onboarding.${currentPage}.extra`).replaceAll(
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
          <Icon name="circle" label={$_(`onboarding.${page}.title`).replace('<wbr>', '')} />
        </Button>
      {/each}
    </p>
    <p class="action">
      {#if isLastPage}
        <Button
          variant="primary"
          pill
          on:click={() => {
            agreeTerms();
          }}
        >
          {$_('onboarding.navigation.start')}
        </Button>
      {:else}
        <Button
          variant="primary"
          pill
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
    word-break: keep-all; /* `<wbr>` 対応 */
  }

  .row {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: 64px;
    min-height: 400px;

    @media (max-width: 1023px) {
      flex-direction: column;
      gap: 32px;
    }

    .col:last-of-type {
      flex: none;
      width: 40%;

      @media (max-width: 1023px) {
        width: 100%;
        max-width: 640px;
      }
    }
  }

  .nav {
    display: flex;
    justify-content: center;
    gap: 8px;

    :global(button .icon) {
      font-size: 16px;
      font-variation-settings: 'FILL' 1;

      @media (any-pointer: coarse) {
        font-size: 24px;
      }
    }

    :global(button[aria-pressed='true']) {
      color: var(--sui-primary-accent-color);
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
    max-width: 560px;
  }

  .extra {
    font-size: var(--sui-font-size-small);
    color: var(--sui-tertiary-foreground-color);

    :global(a) {
      color: inherit;
      text-decoration: underline;
    }
  }
</style>

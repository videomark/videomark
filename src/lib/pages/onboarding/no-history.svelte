<script>
  import { onMount } from 'svelte';
  import { _, json, locale } from 'svelte-i18n';
  import PlatformList from '$lib/pages/common/platform-list.svelte';
  import { getBrowserName } from '$lib/services/runtime';

  let browserName = 'chrome';

  onMount(() => {
    browserName = getBrowserName();
  });
</script>

<div class="row">
  <div class="col">
    <section>
      <h2>{$_('history.empty')}</h2>
      <PlatformList />
    </section>
  </div>
  <div class="col">
    <section class="toolbar-instruction {browserName}">
      <h2>{$_('onboarding.addToToolbar.title')}</h2>
      <div>
        <img src="/images/onboarding/toolbar-{browserName}.{$locale}.png" alt="" />
      </div>
      <ol>
        {#each $json(`onboarding.addToToolbar.${browserName}`) as step}
          <li>
            {@html step.replace(
              /<icon (.+?)>(.+?)<\/icon>/,
              '<span class="sui icon material-symbols-outlined" aria-label="$2">$1</span>',
            )}
          </li>
        {/each}
      </ol>
    </section>
  </div>
</div>

<style lang="scss">
  .row {
    display: flex;
    align-items: center;
    gap: 64px;
    min-height: 400px;

    @media (max-width: 1023px) {
      flex-direction: column;
    }

    .col {
      width: calc(50% - 16px);

      @media (max-width: 1023px) {
        width: 100%;
        max-width: 640px;
      }
    }
  }

  .toolbar-instruction {
    background-color: var(--primary-background-color-translucent);
    border-radius: 8px;
    padding: 32px;

    h2 {
      font-size: var(--font-size--xxx-large);
    }

    img {
      width: 80%;
    }

    ol {
      margin: 16px 0 0;
      padding: 0;
    }

    li {
      margin: 4px 0 0;
      padding: 0;
      list-style-position: inside;

      :global(.icon) {
        vertical-align: bottom;
      }
    }

    &.chrome {
      li :global(.icon) {
        font-variation-settings: 'FILL' 1;
      }
    }
  }
</style>

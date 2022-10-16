<script>
  import PopupPlatformList from '$lib/pages/popup/popup-platform-list.svelte';
  import { getBrowserName } from '$lib/services/runtime';
  import { onMount } from 'svelte';
  import { _, json } from 'svelte-i18n';

  let browserName = 'chrome';

  onMount(() => {
    browserName = getBrowserName();
  });
</script>

<div class="row">
  <div class="col">
    <section>
      <h2>{$_('history.empty')}</h2>
      <PopupPlatformList />
    </section>
  </div>
  <div class="col">
    <section class="toolbar-instruction {browserName}">
      <h2>{$_('onboarding.addToToolbar.title')}</h2>
      <div>
        <img src="/images/onboarding/add-to-toolbar.png" alt="" />
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

    .col {
      width: calc(50% - 16px);
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

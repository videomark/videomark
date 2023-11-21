<script>
  import { Button, Group } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';
  import { openTab } from '$lib/services/navigation';
  import { videoPlatforms } from '$lib/services/video-platforms';

  const { SODIUM_MARKETING_SITE_URL } = import.meta.env;
</script>

<Group class="buttons" aria-label={$_('platformList.title')}>
  <div class="buttons">
    {#each videoPlatforms.filter(({ experimental, deprecated }) => !(experimental || deprecated)) as { id, url } (id)}
      <Button variant="secondary" pill class="close-popup" on:click={() => openTab(url)}>
        {$_(`platforms.${id}`)}
      </Button>
    {/each}
  </div>
</Group>
<div class="limitations">
  <Button
    variant="link"
    class="close-popup"
    on:click={() => openTab(`${SODIUM_MARKETING_SITE_URL}/${$locale}/spec`)}
  >
    {$_('platformList.limitations')}
  </Button>
</div>

<style lang="scss">
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    :global(button) {
      margin: 0;
      width: calc(50% - 4px);
    }
  }

  .limitations {
    margin: 16px 0 0;
    text-align: center;

    :global(button) {
      color: var(--sui-tertiary-foreground-color) !important;
    }
  }
</style>

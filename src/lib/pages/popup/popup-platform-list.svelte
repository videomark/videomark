<script>
  import { Button, Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import PlatformList from '$lib/pages/common/platform-list.svelte';
  import { viewingHistory } from '$lib/services/history';
  import { goBack } from '$lib/services/navigation';
</script>

<div class="platforms">
  <p>{$_('popup.compatiblePlatforms.description')}</p>
  <PlatformList />
</div>
{#if $viewingHistory?.length}
  <footer>
    <Button onclick={() => goBack('#/popup')}>
      {#snippet startIcon()}
        <Icon name="arrow_back" />
      {/snippet}
      {$_('popup.backToHistory')}
    </Button>
  </footer>
{/if}

<style lang="scss">
  .platforms {
    padding: 0 16px 16px;

    p {
      margin: 0 0 16px;
    }
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    margin: auto 0 0;
    height: 40px;
    background-color: var(--sui-secondary-background-color);
    white-space: nowrap;

    :global(button) {
      font-size: var(--sui-font-size-small);
    }
  }
</style>

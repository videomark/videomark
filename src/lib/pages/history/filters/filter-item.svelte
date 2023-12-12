<script>
  import { Button, Icon } from '@sveltia/ui';
  import { isSmallScreen } from '$lib/services/runtime';

  export let buttonLabel = '';
  export let dropdownLabel = '';
</script>

{#if $isSmallScreen}
  <!-- Shown in a Drawer -->
  <section>
    <header>
      <h4>{dropdownLabel}</h4>
    </header>
    <slot />
  </section>
{:else}
  <!-- Shown in a Toolbar -->
  <Button variant="ghost" label={buttonLabel} aria-haspopup="dialog">
    <Icon slot="end-icon" name="arrow_drop_down" />
    <section slot="popup">
      <header>
        <h4>{dropdownLabel}</h4>
      </header>
      <slot />
    </section>
  </Button>
{/if}

<style lang="scss">
  section {
    padding: 16px;

    header {
      margin: 0 0 12px;
    }

    :global(.row) {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0 0;

      & > :global(.label) {
        flex: none;
        width: 64px;
      }
    }

    &:not(:first-of-type) {
      margin-top: 16px;
    }
  }
</style>

<script>
  import { Button, Icon } from '@sveltia/ui';

  export let buttonLabel = '';
  export let dropdownLabel = '';
</script>

<Button variant="ghost" label={buttonLabel} aria-haspopup="dialog">
  <Icon slot="end-icon" name="arrow_drop_down" />
  <section slot="popup" class="popup">
    <header>
      <h4>{dropdownLabel}</h4>
    </header>
    <slot />
  </section>
</Button>

<style lang="scss">
  .popup {
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
  }
</style>

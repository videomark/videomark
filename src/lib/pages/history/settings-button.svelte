<script>
  import { Button, Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import { openTab } from '$lib/services/navigation';
</script>

<Button
  variant="ghost"
  iconic
  aria-label={$_('settings.title')}
  on:click={() => openTab('#/settings')}
>
  <Icon slot="start-icon" name="settings" />
</Button>

<script>
  import { Button, Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import { openTab } from '$lib/services/navigation';
</script>

<Button variant="ghost" iconic on:click={() => openTab('#/settings')}>
  <Icon slot="start-icon" name="settings" label={$_('settings.title')} />
</Button>

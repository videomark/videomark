<script>
  import { Button, Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import { openTab } from '$lib/services/navigation';
</script>

<Button class="ghost" on:click={() => openTab('#/settings')}>
  <Icon slot="start-icon" name="settings" />
  {$_('settings.title')}
</Button>

<script>
  import { Button, Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import { goto } from '$lib/services/navigation';
</script>

<Button
  variant="ghost"
  iconic
  aria-label={$_('settings.title')}
  onclick={() => {
    goto('#/settings');
  }}
>
  {#snippet startIcon()}
    <Icon name="settings" />
  {/snippet}
</Button>

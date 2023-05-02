<script>
  import HistoryLayout from '$lib/pages/layouts/history-layout.svelte';
  import SettingItem from '$lib/pages/settings/setting-item.svelte';
  import { openTab } from '$lib/services/navigation';
  import { session } from '$lib/services/sessions';
  import { defaultSettings, settings } from '$lib/services/settings';
  import { storage } from '$lib/services/storage';
  import { Button, Checkbox, Dialog, Icon, Option, Select, Switch } from '@sveltia/ui';
  import { onMount } from 'svelte';
  import { _, locale } from 'svelte-i18n';

  const { SODIUM_MARKETING_SITE_URL } = import.meta.env;

  let openResetDialog = false;
  let loadedSettings;
  let expiries = [];
  let resolutions = [];
  let bitrates = [];
  let quotaMarks = [];

  $: {
    if ($locale) {
      expiries = [0, 1, 30, 365].map((v) => ({
        value: v * 24 * 60 * 60 * 1000,
        label:
          v === 0
            ? $_('settings.sessionOnly')
            : new Intl.NumberFormat($locale, {
                style: 'unit',
                unit: 'day',
                useGrouping: false,
              }).format(v),
      }));

      resolutions = [0, 144, 240, 360, 480, 720, 1080, 1440, 2160].map((v) => ({
        value: v,
        label: v === 0 ? $_('settings.noLimit') : `${v}p`,
      }));

      bitrates = [0, 128, 256, 512, 1024, 2560, 5120, 10240, 20480].map((v) => ({
        value: v * 1024,
        label:
          v === 0
            ? $_('settings.noLimit')
            : `${new Intl.NumberFormat($locale, {
                useGrouping: false,
              }).format(v)} kbps`,
      }));

      quotaMarks = [0, 1, 2, 3, 5, 7, 10, 20, 30].map((v) => ({
        value: v * 1024,
        label:
          v === 0
            ? $_('settings.noLimit')
            : new Intl.NumberFormat($locale, {
                style: 'unit',
                unit: 'gigabyte',
                useGrouping: false,
              }).format(v),
      }));
    }
  }

  const clearHistoryItems = {
    settings: false,
    sessionId: false,
    graphCache: false,
    history: false,
  };

  $: {
    if (clearHistoryItems.history) {
      clearHistoryItems.graphCache = true;
    }
  }

  const clearHistory = async () => {
    if (clearHistoryItems.settings) {
      $settings = { ...defaultSettings };
    }

    if (clearHistoryItems.sessionId) {
      $session.id = window.crypto.randomUUID();
      $session.expiries = Date.now() + $settings.expires_in;
    }

    if (clearHistoryItems.graphCache) {
      localStorage.removeItem('statsData');
      localStorage.removeItem('statsDataIndex');
    }

    if (clearHistoryItems.history) {
      const storageCache = await storage.getAll();
      const baseKeys = ['version', 'session', 'settings', 'AgreedTerm'];

      Object.keys(storageCache).forEach((key) => {
        if (!baseKeys.includes(key)) {
          delete storageCache[key];
        }
      });

      await storage.clear();
      await storage.setAll(storageCache);
    }
  };

  onMount(() => {
    (async () => {
      loadedSettings = JSON.parse(JSON.stringify($settings));
    })();
  });
</script>

<HistoryLayout>
  <h1 slot="header">{$_('settings.title')}</h1>
  <Button slot="header-extras" class="ghost" on:click={() => openTab('#/history')}>
    <Icon slot="start-icon" name="arrow_back" />
    {$_('settings.backToHistory')}
  </Button>
  <div class="settings">
    <section>
      <header>
        <h2>{$_('settings.contents')}</h2>
      </header>
      <SettingItem
        title={$_('settings.displayOnPlayer')}
        description={loadedSettings &&
        loadedSettings.display_on_player !== $settings.display_on_player
          ? $_('settings.requirePageReload')
          : undefined}
      >
        <Switch bind:checked={$settings.display_on_player} />
      </SettingItem>
    </section>
    <section>
      <header>
        <h2>{$_('settings.history')}</h2>
      </header>
      <SettingItem title={$_('settings.showDuplicateVideos')}>
        <Switch bind:checked={$settings.show_duplicate_videos} />
      </SettingItem>
    </section>
    <section>
      <header>
        <h2>{$_('settings.privacy')}</h2>
      </header>
      <SettingItem title={$_('settings.sessionId')}>
        {$session.id || ''}
      </SettingItem>
      <SettingItem title={$_('settings.sessionPersistence')}>
        <Select
          position="bottom-right"
          label={expiries.find(({ value }) => value === $settings.expires_in)?.label}
          bind:value={$settings.expires_in}
        >
          {#each expiries as { label, value }}
            <Option class="secondary" {label} {value} selected={value === $settings.expires_in} />
          {/each}
        </Select>
      </SettingItem>
      <SettingItem title={$_('settings.clearData')}>
        <Button
          class="tertiary"
          on:click={() => {
            openResetDialog = true;
          }}
        >
          {$_('settings.clear')}
        </Button>
      </SettingItem>
    </section>
    <section>
      <header>
        <h2>
          {$_('settings.dataSaver')}
          <span class="experimental">
            <Icon name="science" />
            {$_('settings.experimental')}
          </span>
        </h2>
        <p>
          {@html $_('settings.dataSaverDescription').replace(
            '<a>',
            `<a href="${SODIUM_MARKETING_SITE_URL}/${$locale}/spec" target="_blank">`,
          )}
        </p>
      </header>
      <SettingItem title={$_('settings.maxResolution')}>
        <Select
          position="bottom-right"
          label={resolutions.find(
            ({ value }) =>
              value === ($settings.resolution_control_enabled ? $settings.resolution_control : 0),
          )?.label}
          bind:value={$settings.resolution_control}
          on:change={({ detail: { value } }) => {
            $settings.resolution_control_enabled = value > 0;
          }}
        >
          {#each resolutions as { value, label } (value)}
            <Option
              {label}
              {value}
              selected={value ===
                ($settings.resolution_control_enabled ? $settings.resolution_control : 0)}
            />
          {/each}
        </Select>
      </SettingItem>
      <SettingItem title={$_('settings.maxBitrate')}>
        <Select
          position="bottom-right"
          label={bitrates.find(
            ({ value }) =>
              value === ($settings.bitrate_control_enabled ? $settings.bitrate_control : 0),
          )?.label}
          bind:value={$settings.bitrate_control}
          on:change={({ detail: { value } }) => {
            $settings.bitrate_control_enabled = value > 0;
          }}
        >
          {#each bitrates as { value, label } (value)}
            <Option
              {label}
              {value}
              selected={value ===
                ($settings.bitrate_control_enabled ? $settings.bitrate_control : 0)}
            />
          {/each}
        </Select>
      </SettingItem>
      <SettingItem title={$_('settings.bandwidthQuota')}>
        <Select
          position="bottom-right"
          label={quotaMarks.find(
            ({ value }) =>
              value === ($settings.control_by_traffic_volume ? $settings.browser_quota : 0),
          )?.label}
          bind:value={$settings.browser_quota}
          on:change={({ detail: { value } }) => {
            $settings.control_by_traffic_volume = value > 0;
          }}
        >
          {#each quotaMarks as { value, label } (value)}
            <Option
              {label}
              {value}
              selected={value ===
                ($settings.control_by_traffic_volume ? $settings.browser_quota : 0)}
            />
          {/each}
        </Select>
      </SettingItem>
      <SettingItem title={$_('settings.maxBitratePerQuota')}>
        <Select
          position="bottom-right"
          label={bitrates.find(
            ({ value }) =>
              value === ($settings.control_by_browser_quota ? $settings.browser_quota_bitrate : 0),
          )?.label}
          bind:value={$settings.browser_quota_bitrate}
          disabled={!$settings.control_by_traffic_volume}
          on:change={({ detail: { value } }) => {
            $settings.control_by_browser_quota = value > 0;
          }}
        >
          {#each bitrates.slice(1) as { value, label } (value)}
            <Option
              {label}
              {value}
              selected={value ===
                ($settings.control_by_browser_quota ? $settings.browser_quota_bitrate : 0)}
            />
          {/each}
        </Select>
      </SettingItem>
      <SettingItem title={$_('settings.primeTimeControl')}>
        <Switch bind:checked={$settings.peak_time_limit_enabled} />
      </SettingItem>
    </section>
  </div>
</HistoryLayout>

<Dialog
  title={$_('settings.clearDialog.title')}
  bind:open={openResetDialog}
  okLabel={$_('settings.clearDialog.confirm')}
  okDisabled={!Object.values(clearHistoryItems).some((v) => v)}
  on:ok={() => {
    clearHistory();
  }}
>
  <div class="dialog-content">
    <div class="description">{$_('settings.clearDialog.description')}</div>
    <div>
      <Checkbox bind:checked={clearHistoryItems.settings}>
        {$_('settings.clearDialog.settings')}
      </Checkbox>
    </div>
    <div>
      <Checkbox bind:checked={clearHistoryItems.sessionId}>
        {$_('settings.clearDialog.sessionId')}
      </Checkbox>
    </div>
    <div>
      <Checkbox bind:checked={clearHistoryItems.history}>
        {$_('settings.clearDialog.history')}
      </Checkbox>
    </div>
    <div>
      <Checkbox disabled={clearHistoryItems.history} bind:checked={clearHistoryItems.graphCache}>
        {$_('settings.clearDialog.graphCache')}
      </Checkbox>
    </div>
  </div>
</Dialog>

<style lang="scss">
  h1 {
    display: flex;
    height: 40px;
    align-items: center;
    font-size: var(--font-size--xxx-large);
  }

  .settings {
    margin: 0 auto;
    max-width: 800px;
    text-align: left;

    h2 {
      font-size: var(--font-size--large);

      .experimental {
        margin: 0 4px;
        border: 1px solid var(--success-border-color);
        border-radius: 8px;
        padding: 2px 8px;
        text-transform: uppercase;
        color: var(--success-foreground-color);
        background-color: var(--success-background-color);
        font-size: var(--font-size--x-small);
        font-weight: normal;
        vertical-align: 2px;

        :global(.icon) {
          font-size: var(--font-size--small);
          vertical-align: -2px;
        }
      }

      & + p {
        margin: 0;
        color: var(--tertiary-foreground-color);
      }
    }
  }

  section {
    margin: 24px 0 0;

    & > header {
      margin: 8px 0;
    }
  }

  .dialog-content {
    div {
      margin: 0 0 8px;

      &.description {
        margin: 0 0 16px;
      }
    }
  }
</style>

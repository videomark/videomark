<script>
  import {
    Button,
    Checkbox,
    CheckboxGroup,
    Dialog,
    Icon,
    Option,
    Select,
    Switch,
  } from '@sveltia/ui';
  import { onMount } from 'svelte';
  import { _, json, locale } from 'svelte-i18n';
  import DefaultLayout from '$lib/pages/layouts/default-layout.svelte';
  import SettingItem from '$lib/pages/settings/setting-item.svelte';
  import { viewingHistory } from '$lib/services/history';
  import { deleteItemsNow } from '$lib/services/history/index';
  import { goBack } from '$lib/services/navigation';
  import { getSessionType, overwritePersonalSession, session } from '$lib/services/sessions';
  import { defaultSettings, settings } from '$lib/services/settings';

  const { SODIUM_MARKETING_SITE_URL } = import.meta.env;

  let openResetDialog = false;
  let loadedSettings;
  let expiries = [];
  /** 動画の最大計測単位(ミリ秒単位) */
  let maxVideoTTLs = [];
  let resolutions = [];
  let bitrates = [];
  let quotaMarks = [];
  let timeRanges = [];

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

      maxVideoTTLs = [5, 10, 20, 30, 60] // min
        .map((min) => ({
          value: min * 60 * 1000, // msec
          label: new Intl.NumberFormat($locale, { style: 'unit', unit: 'minute' }).format(min),
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

      // each time range is represented in hours, 0 = all
      timeRanges = [0, 1, 24, 168, 730].map((v, index) => ({
        value: v,
        label: Object.entries($json('settings.clearDialog.timeRangeOptions'))[index][1].toString(),
      }));
    }
  }

  const clearHistoryItems = {
    range: 0,
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
      let filteredKeys;

      // getting keys within selected time range
      if (clearHistoryItems.range === 0) {
        filteredKeys = $viewingHistory.map(({ key }) => key); // all keys
      } else {
        filteredKeys = $viewingHistory.filter(
          (item) =>
            (Math.abs(Date.now() - new Date(item.startTime)) / (1000 * 60 * 60)).toFixed(1) <=
            clearHistoryItems.range,
        );
      }

      deleteItemsNow(filteredKeys);
    }
  };

  onMount(async () => {
    loadedSettings = JSON.parse(JSON.stringify($settings));

    // 自動計測向けのセッション ID の設定機能
    const sessionId = new URLSearchParams(window.location.search).get('session_id');

    if (sessionId) {
      // NOTE: オーバーフロー無く十分に長い適当な期間
      const expiresIn = 10 * 365 * 24 * 60 * 60 * 1000;

      await overwritePersonalSession(sessionId, expiresIn);

      $settings.expires_in = expiresIn;
    }
  });

  $: {
    // 自動計測向けの初期設定
    const bot = new URLSearchParams(window.location.search).get('bot') === 'true';

    if ($settings.show_latest_qoe_enabled && bot) {
      $settings.show_latest_qoe_enabled = false;
    }
  }

  $: $session.type = getSessionType($session.id);
  $: $session.expires = Date.now() + $settings.expires_in;
</script>

<DefaultLayout compact={true}>
  <h1 slot="header">{$_('settings.title')}</h1>
  <Button slot="header-extras" variant="ghost" on:click={() => goBack('#/history')}>
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
      <SettingItem
        title={$_('settings.show_latest_qoe_enabled')}
        description={loadedSettings &&
        loadedSettings.show_latest_qoe_enabled !== $settings.show_latest_qoe_enabled
          ? $_('settings.requirePageReload')
          : undefined}
      >
        <Switch bind:checked={$settings.show_latest_qoe_enabled} />
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
      <div
        role="none"
        on:click={(e) => {
          // 自動計測向けのセッション ID の設定機能
          if (e.detail === 3) {
            // eslint-disable-next-line no-alert
            const sessionId = window.prompt($_('settings.personalSessionPrompt'))?.trim();

            if (sessionId) {
              window.location.search = `?${new URLSearchParams({
                session_id: sessionId,
              })}`;
            }
          }
        }}
      >
        <SettingItem id="session-id" title={$_('settings.sessionId')}>
          {$session.id || ''}
        </SettingItem>
      </div>
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
          variant="tertiary"
          on:click={() => {
            openResetDialog = true;
          }}
        >
          {$_('settings.clear')}
        </Button>
      </SettingItem>
    </section>
    <details>
      <summary>{$_('settings.advancedSettings')}</summary>
      <section>
        <header>
          <h2>{$_('settings.history')}</h2>
        </header>
        <SettingItem title={$_('settings.maxVideoTtl')}>
          <Select
            position="bottom-right"
            label={maxVideoTTLs.find(({ value }) => value === $settings.max_video_ttl)?.label}
            bind:value={$settings.max_video_ttl}
          >
            {#each maxVideoTTLs as { label, value }}
              <Option {label} {value} selected={value === $settings.max_video_ttl} />
            {/each}
          </Select>
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
                value ===
                ($settings.control_by_browser_quota ? $settings.browser_quota_bitrate : 0),
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
    </details>
  </div>
</DefaultLayout>

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
    <SettingItem title={$_('settings.clearDialog.timeRange')}>
      <Select
        position="bottom-right"
        label={$_('settings.clearDialog.timeRange')}
        bind:value={clearHistoryItems.range}
      >
        {#each timeRanges as { value, label } (value)}
          <Option {label} {value} selected={value === clearHistoryItems.range} />
        {/each}
      </Select>
    </SettingItem>
    <CheckboxGroup orientation="vertical">
      <Checkbox bind:checked={clearHistoryItems.settings}>
        {$_('settings.clearDialog.settings')}
      </Checkbox>
      <Checkbox bind:checked={clearHistoryItems.sessionId}>
        {$_('settings.clearDialog.sessionId')}
      </Checkbox>
      <Checkbox bind:checked={clearHistoryItems.history}>
        {$_('settings.clearDialog.history')}
      </Checkbox>
      <Checkbox disabled={clearHistoryItems.history} bind:checked={clearHistoryItems.graphCache}>
        {$_('settings.clearDialog.graphCache')}
      </Checkbox>
    </CheckboxGroup>
  </div>
</Dialog>

<style lang="scss">
  h1 {
    display: flex;
    height: 40px;
    align-items: center;
    font-size: var(--sui-font-size-xxx-large);
  }

  .settings {
    margin: 0 auto;
    max-width: 800px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 24px;

    h2 {
      font-size: var(--sui-font-size-large);

      .experimental {
        margin: 0 4px;
        border: 1px solid var(--sui-success-border-color);
        border-radius: 8px;
        padding: 2px 8px;
        text-transform: uppercase;
        color: var(--sui-success-foreground-color);
        background-color: var(--sui-success-background-color);
        font-size: var(--sui-font-size-x-small);
        font-weight: normal;
        vertical-align: 2px;

        :global(.icon) {
          font-size: var(--sui-font-size-small);
          vertical-align: -2px;
        }
      }

      & + p {
        margin: 0;
        color: var(--sui-tertiary-foreground-color);
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

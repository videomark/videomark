<script>
  /** @type {string | undefined} */
  export let src;
</script>

{#if src}
  <img
    loading="lazy"
    {src}
    alt=""
    class="thumbnail"
    on:error={() => {
      src = '';
    }}
  />
{:else}
  <div class="thumbnail fallback"></div>
{/if}

<style lang="scss">
  .thumbnail {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    background-color: var(--video-background-color);
    transition: all 0.5s;
  }

  .fallback {
    position: relative;

    &::after {
      position: absolute;
      inset: 0;
      background-image: url(/images/logo.svg);
      background-position: center;
      background-repeat: no-repeat;
      background-size: 40%;
      filter: grayscale(1) opacity(0.1);
      content: '';
    }
  }
</style>

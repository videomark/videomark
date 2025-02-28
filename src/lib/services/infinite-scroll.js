/** @type {import('svelte/action').Action}  */
export default function scroll(node) {
  const options = { threshold: 1 }; // threshold: 1 = entire element must be visible to trigger

  const callback = (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.dispatchEvent(new CustomEvent('InfiniteScroll'));
      }
    });
  };

  const observer = new IntersectionObserver(callback, options);

  observer.observe(node);

  return {
    destroy() {
      // disconnecting the observer when the component is no longer loaded
      observer.disconnect();
    },
  };
}

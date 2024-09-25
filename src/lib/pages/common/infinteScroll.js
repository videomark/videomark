// TODO: find correct place for this function
/** @type {import('svelte/action').Action}  */
export default function scroll(node) {
  const options = { threshold: 1 };

  const callback = (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.dispatchEvent(new CustomEvent('infiniteScroll'));
      }
    });
  };

  const observer = new IntersectionObserver(callback, options);

  observer.observe(node);

  return {
    destory() {
      observer.destory();
    },
  };
}

export default async () => {
  await new Promise((resolve) => {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    else resolve();
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
};

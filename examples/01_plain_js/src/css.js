
export const loadStyle = (path) => {

  const loaded = new Promise((resolve, reject) => {
    const existingLink = document.querySelector(`link[href="${path}"]`);
    if (existingLink) return resolve();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    link.type = 'text/css';
    link.onload = () => {
      console.log(`Stylesheet loaded: ${path}`);
      resolve();
    };
    link.onerror = () => {
      console.error(`Failed to load stylesheet: ${path}`);
      reject(new Error(`Failed to load stylesheet: ${path}`));
    };
    document.head.appendChild(link);
  });

  const unload = () => {
    const existingLink = document.querySelector(`link[href="${path}"]`);
    if (existingLink) {
      console.log(`Unloading stylesheet: ${path}`);
      existingLink.remove();
    } else {
      console.warn(`Stylesheet not found for unload: ${path}`);
    }
  };

  return {loaded, unload};
}

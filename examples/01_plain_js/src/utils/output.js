import DOMPurify from '../../node_modules/dompurify/dist/purify.es.mjs';

const batchTypesets = [];
let typesetting = null;

export const renderOutput = (html, container, selector) => {
  let target = container;
  if (selector) target = container.querySelector(selector);
  if (!target) throw new Error('Target container not found');

  const purifiedHtml = DOMPurify.sanitize(html);
  target.innerHTML = purifiedHtml;

  batchTypesets.push(target);

  if (!typesetting) typesetting = typesetMath();
};

async function typesetMath() {
  // debounce
  await new Promise(r => setTimeout(r, 10));

  const toProcess = batchTypesets.splice(0, batchTypesets.length);
  console.log(toProcess, batchTypesets);

  if (toProcess.length > 0) {
    console.log('Typesetting math in', toProcess);
    await MathJax.typesetPromise(toProcess);
  }

  typesetting = null;
}

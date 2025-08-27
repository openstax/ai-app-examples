import React from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { assertString } from "@/utils/assertions";
import './ModelOutput.css';

declare global {
  interface Window {
    MathJax: {
      typesetPromise: (elements: Element[]) => Promise<void>;
    };
  }
}

const batchTypesets: Element[] = [];
let typesetting: Promise<void> | null = null;

export const ModelOutput = (props: { value: string, className: string }) => {
  const className = 'model-output ' + (props.className || '');
  const ref = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (ref.current) {
      let content = props.value;

      content = assertString(marked.parse(content), new Error('Marked should return a string'));
      content = DOMPurify.sanitize(content);

      console.log('Rendered content', content);
      ref.current.innerHTML = content;

      if (!batchTypesets.includes(ref.current)) {
        batchTypesets.push(ref.current);
      }

      if (!typesetting) typesetting = typesetMath();
    }
  }, [props.value]);

  return <div ref={ref} className={className} />;
};

async function typesetMath(): Promise<void> {
  // debounce
  await new Promise(r => setTimeout(r, 100));

  const toProcess = batchTypesets.splice(0, batchTypesets.length);

  if (toProcess.length > 0) {
    console.log('Typesetting math in', toProcess);
    await window.MathJax.typesetPromise(toProcess);
  }

  if (batchTypesets.length > 0) {
    typesetting = typesetMath();
  } else {
    typesetting = null;
  }
}

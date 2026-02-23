"use client";

import React, { useMemo } from 'react';

interface PreviewIframeProps {
  html: string;
}

export function PreviewIframe({ html }: PreviewIframeProps) {
  // We use srcdoc to render the full HTML document including <head> and <body>
  // Sandbox disables JS execution by not including 'allow-scripts'
  return (
    <div className="w-full h-full border rounded-lg bg-white overflow-hidden shadow-inner animate-fade-in">
      <iframe
        title="Live Preview"
        className="w-full h-full"
        srcDoc={html}
        sandbox="allow-popups-to-escape-sandbox allow-forms allow-modals"
      />
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

type ContactMapEmbedProps = {
  src: string;
  title: string;
  className?: string;
};

/**
 * Google Maps iframe disuntik atribut oleh beberapa ekstensi browser,
 * sehingga markup SSR tidak cocok dengan DOM klien (hydration mismatch).
 * Render iframe hanya setelah mount agar tidak dibandingkan dengan HTML server.
 */
export function ContactMapEmbed({ src, title, className }: ContactMapEmbedProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  if (!show) {
    return (
      <div
        className={className}
        aria-hidden
        role="presentation"
      />
    );
  }

  return (
    <iframe
      title={title}
      src={src}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}

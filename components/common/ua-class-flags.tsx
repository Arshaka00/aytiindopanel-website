"use client";

import { useEffect } from "react";

export function UaClassFlags() {
  useEffect(() => {
    try {
      const ua = navigator.userAgent;
      if (/Android/i.test(ua)) document.documentElement.classList.add("ua-android");
      if (/iPhone/i.test(ua)) document.documentElement.classList.add("ua-iphone");
    } catch {
      // noop
    }
  }, []);

  return null;
}

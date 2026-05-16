"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";

export type NavigationTransitionContextValue = {
  navigate: (destination: string) => void;
  replace: (destination: string) => void;
  back: () => void;
};

const NavigationTransitionContext = createContext<NavigationTransitionContextValue | null>(null);

export function useNavigationTransition(): NavigationTransitionContextValue {
  const v = useContext(NavigationTransitionContext);
  if (!v) {
    throw new Error("useNavigationTransition harus di dalam NavigationTransitionProvider");
  }
  return v;
}

export function useNavigationTransitionOptional(): NavigationTransitionContextValue | null {
  return useContext(NavigationTransitionContext);
}

function resolveDestination(destination: string): string {
  if (typeof window === "undefined") return destination;
  try {
    const url = new URL(destination, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return destination;
  }
}

type NavigationTransitionProviderProps = {
  children: React.ReactNode;
  /** Diteruskan dari layout (CMS performance); tidak memengaruhi overlay — overlay navigasi tidak dipakai. */
  disabled?: boolean;
};

/**
 * Navigasi App Router tanpa overlay loading.
 * Overlay branding hanya pada **load / refresh dokumen** ({@link GlobalLoader}).
 */
export function NavigationTransitionProvider({
  children,
  disabled: _disabled = false,
}: NavigationTransitionProviderProps) {
  const router = useRouter();

  const navigate = useCallback(
    (destination: string) => {
      router.push(resolveDestination(destination), { scroll: false });
    },
    [router],
  );

  const replace = useCallback(
    (destination: string) => {
      router.replace(resolveDestination(destination), { scroll: false });
    },
    [router],
  );

  const back = useCallback(() => {
    router.back();
  }, [router]);

  const ctx = useMemo(() => ({ navigate, replace, back }), [navigate, replace, back]);

  return (
    <NavigationTransitionContext.Provider value={ctx}>
      {children}
    </NavigationTransitionContext.Provider>
  );
}

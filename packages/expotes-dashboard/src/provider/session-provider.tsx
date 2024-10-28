"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { TeamSelecterDialog } from "@/components/team/selecter";
import { useSDK, useSDKMutation } from "@/lib/api";
import { usePersistStore } from "@/store/persist";
import { sdk } from "@expotes/sdk";
import type { IUserDto } from "@expotes/sdk/structures";
import { usePathname, useRouter } from "next/navigation";

const SessionContext = createContext<{
  user: IUserDto | null;
  isLoading: boolean;
}>({
  user: null,
  isLoading: true,
});

/**
 * 获取当前登录的用户, 应该被用来判断用户是否登录
 * @returns 当前登录的用户, 未登录时返回 null
 */
export const useSession = <T extends boolean = false>(
  optional: T = false as T
): T extends true ? IUserDto | null : IUserDto => {
  const data = useContext(SessionContext);
  if (!optional && !data.isLoading && data === null) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return data.user as T extends true ? IUserDto | null : IUserDto;
};

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setIsLogin } = usePersistStore();

  const swr = useSDK(sdk.v1.user.me, [], {
    onError: (error) => {
      if (error.status === 400 || error.status === 401) {
        // 过期
        setIsLogin(false);
      }
    },
    onErrorRetry: (error) => {
      if (error.status === 400) {
        // 未登录
        setIsLogin(false);
        return null;
      }
    },
    keepPreviousData: true,
  });

  if (swr.isLoading) {
    return null;
  }

  return (
    <SessionContext.Provider value={{ user: swr.data ?? null, ...swr }}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * 用于保护路由, 当用户未登录时, 重定向到登录页面
 * @returns
 */
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isReady, setIsReady] = useState(false);
  const user = useSession();

  useEffect(() => {
    if ((pathname === "/app" || pathname.startsWith("/app/")) && !user) {
      router.push("/auth/login");
      return;
    }
    if (
      (pathname.startsWith("/auth/login") ||
        pathname.startsWith("/auth/signup")) &&
      user
    ) {
      router.push("/app");
      return;
    }
    setIsReady(true);
  }, [user, pathname, router]);

  if (!user && !isReady) {
    return null;
  }

  return <>{children}</>;
}

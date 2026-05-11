import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase/client";

const emailOtpTypes = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email"
]);

function collectAuthParams(url: string) {
  const params = new URLSearchParams();
  const [withoutHash, hash = ""] = url.split("#");
  const query = withoutHash.includes("?")
    ? withoutHash.slice(withoutHash.indexOf("?") + 1)
    : "";

  for (const part of [query, hash]) {
    if (!part) {
      continue;
    }
    const nextParams = new URLSearchParams(part);
    nextParams.forEach((value, key) => params.set(key, value));
  }

  return params;
}

async function handleAuthUrl(url: string) {
  const params = collectAuthParams(url);
  const type = params.get("type");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const tokenHash = params.get("token_hash");

  if (params.get("error") || params.get("error_code")) {
    if (__DEV__) {
      console.warn("Supabase auth link error", {
        error: params.get("error"),
        errorCode: params.get("error_code"),
        description: params.get("error_description")
      });
    }
    router.replace("/login");
    return;
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (error) {
      throw error;
    }
    router.replace(type === "recovery" ? "/reset-password" : "/");
    return;
  }

  if (tokenHash && type && emailOtpTypes.has(type as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType
    });
    if (error) {
      throw error;
    }
    router.replace(type === "recovery" ? "/reset-password" : "/");
  }
}

export function AuthLinkBridge() {
  const lastHandledUrl = useRef<string | null>(null);

  useEffect(() => {
    const processUrl = (url: string | null) => {
      if (!url || lastHandledUrl.current === url) {
        return;
      }
      lastHandledUrl.current = url;
      void handleAuthUrl(url).catch((error) => {
        if (__DEV__) {
          console.warn("Could not handle auth link", error);
        }
        router.replace("/login");
      });
    };

    Linking.getInitialURL().then(processUrl).catch((error) => {
      if (__DEV__) {
        console.warn("Could not read initial URL", error);
      }
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      processUrl(url);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/reset-password");
      }
    });

    return () => {
      subscription.remove();
      authListener.subscription.unsubscribe();
    };
  }, []);

  return null;
}

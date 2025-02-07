import React from "react";
import { SessionProvider } from "next-auth/react";

export default function SessionProviderAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
  );
}

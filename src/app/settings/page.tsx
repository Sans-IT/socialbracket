import MaxWidthSize from "@/components/MaxWidthDiv";
import { auth } from "@/lib/auth";
import Image from "next/image";
import React from "react";
import SettingsForm from "./SettingsForm";
import { redirect } from "next/navigation";
import { authPages } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
};

export default async function Settings() {
  const session = await auth();

  if (!session?.user) {
    redirect(authPages.signIn);
  }

  return (
    <MaxWidthSize className="sm:max-w-2xl">
      <SettingsForm session={session} />
    </MaxWidthSize>
  );
}

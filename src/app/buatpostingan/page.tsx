import { auth } from "@/lib/auth";
import React from "react";
import AddPostForm from "./add-post-form";
import { redirect } from "next/navigation";
import { authPages } from "@/lib/utils";

export default async function BuatPostingan() {
  const session = await auth();

  if (!session?.user) {
    redirect(authPages.signIn);
  }

  return <AddPostForm session={session} />;
}

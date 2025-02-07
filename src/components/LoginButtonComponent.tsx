"use client";
import React from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";
import { Icons } from "./Icon";
import { GithubIcon } from "lucide-react";

export default function LoginButtonComponent() {
  return (
    <div className="space-y-2 my-3 w-fit mx-auto">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("google")}
      >
        <Icons.google />
        Login with Google
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("github")}
      >
        <GithubIcon />
        Login with Github
      </Button>
    </div>
  );
}

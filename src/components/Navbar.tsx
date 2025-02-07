import React from "react";
import MaxWidthDiv from "./MaxWidthDiv";
import Image from "next/image";
import UserAccountNav from "./UserAccountNav";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import ModeToggle from "./ModeToggle";
import SearchBar from "./searchBar";
import { auth } from "@/lib/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <div className="z-40 sticky top-0 bg-background/80 backdrop-blur">
      <MaxWidthDiv className="flex justify-between items-center border-b border-secondary py-2 gap-2">
        <div className="flex items-center justify-between gap-1">
          <Link
            href={"/"}
            className={cn("flex items-center justify-between gap-2")}
          >
            <Image
              src={"/SocialBracket.png"}
              alt="logo"
              width={45}
              height={45}
              className="w-fit"
            />
            <h1 className="font-bold text-xl hidden sm:block">
              Social Bracket
            </h1>
          </Link>
        </div>
        <SearchBar />
        <div className="flex justify-between gap-3 items-center">
          <ModeToggle />
          {session?.user ? (
            <UserAccountNav />
          ) : (
            <Link href={"/sign-in"} className={cn(buttonVariants())}>
              Sign in
            </Link>
          )}
        </div>
      </MaxWidthDiv>
    </div>
  );
}

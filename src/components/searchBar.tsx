"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyboardEvent, useState } from "react";
import { Input } from "./ui/input";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || ""); // State untuk menyimpan input

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("search", query); // Update query params hanya ketika Enter ditekan
      router.replace(`/?${currentParams.toString()}`);
    }
  };

  return (
    <Input
      className="sm:w-1/2 bg-secondary"
      placeholder="Search"
      value={query}
      onChange={(e) => setQuery(e.target.value)} // Update state saat input berubah
      onKeyDown={handleKeyDown} // Trigger hanya ketika Enter ditekan
    />
  );
}

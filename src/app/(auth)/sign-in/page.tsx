import LoginButtonComponent from "@/components/LoginButtonComponent";
import Image from "next/image";
import Link from "next/link";

export default function SignIn() {
  return (
    <div className="z-50 grid lg:grid-cols-2 absolute inset-0 bg-background">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center">
              <Image src={"/logo.svg"} width={35} height={35} alt="logo" />
            </div>
            Social Bracket
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs text-center font-bold">
            Login Terlebih dahulu !
            <LoginButtonComponent />
            {/* <LoginForm /> */}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/logo.svg"
          alt="Image"
          width={500}
          height={500}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

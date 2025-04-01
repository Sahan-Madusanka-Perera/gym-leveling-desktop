import Image from "next/image"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center justify-center w-full">
            <Image
              src="/images/logo.png"
              height={150}
              width={150}
              alt="Login Image"
              className="object-contain dark:brightness-[0.2] dark:grayscale"
              priority
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/images/login-image.png"
          alt="Login Image"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          priority 
        />
      </div>
    </div>
  )
}

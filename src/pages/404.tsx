import { Cat } from "lucide-react";
import Link from "next/link";

export default function Component() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center py-10">
      <div className="grid gap-4 px-4 text-center md:gap-8 lg:gap-16">
        <div className="flex flex-col items-center gap-2">
          <Cat height={160} width={160} />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Uh oh! Nothing here
            </h1>
            <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {"You just hit a route that doesn't exist... the sadness."}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2 min-[400px]:flex-row">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border  border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
            href="/"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

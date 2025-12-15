import { LaunchTokenFormProvider } from "@/components/launch-token/form/form-context";
import { cn } from "@/libs/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "World.fun Alpha",
  description:
    "Create and launch your own token on World.fun Alpha. Set up fundraising, configure tokenomics, and bring your world to life.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LaunchTokenFormProvider>
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          "min-h-[calc(100dvh-72px)]",
          "px-4"
        )}
      >
        {children}
      </div>
    </LaunchTokenFormProvider>
  );
}

"use client";

import { cn } from "@/libs/utils";
import { Button, Text } from "@/components/ui";
import Image from "next/image"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { WalletConnectButton } from "../wallet-connect-button";
import { useAuthStore } from "@/libs/stores";
import { useAccount } from "wagmi";
import { motion, useReducedMotion } from "motion/react"; // motion.one react integration
import { useRouter } from "next/navigation";

const LaunchStep = ({ step, title }: { step: string; title: string }) => {
  return (
    <>
      <div className="h-[1px] w-full bg-gradient-to-r from-white/30 to-[#99999933]" />

      <Text
        variant="base"
        className={cn("text-light", "pt-2 pb-3", "flex gap-4")}
      >
        <span className="opacity-50 w-10">0{step}.</span> {title}
      </Text>
    </>
  );
};

export const Instruction = () => {
  const router = useRouter();
  const walletAddress = useAuthStore.getState().user?.username; // eslint-disable-line @typescript-eslint/no-unused-vars
  const { isConnected } = useAccount();
  const shouldReduceMotion = useReducedMotion();

  // Numeric cubic-bezier array accepted by motion library
  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const steps: Array<{ step: string; title: string }> = [
    { step: "1", title: "Connect Wallet" },
    { step: "2", title: "Choose Token Type" },
    { step: "3", title: "Choose Funding Type" },
    { step: "4", title: "Submit World/Agent Info" },
    { step: "5", title: "Launch World/Agent" },
  ];

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.55, ease }}
      className={cn(
        "max-w-[380px]",
        "rounded-2xl border border-light/15 relative overflow-hidden",
        "mx-2 p-4 md:p-6 pt-0 md:pt-0",
        "bg-darkest-bg/90 backdrop-blur-sm",
        "z-10 group",
        "transition-shadow duration-500",
        "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_32px_-8px_rgba(0,0,0,0.65)]"
      )}
    >
      {/* Subtle animated gradient sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute -inset-[1px] rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_60%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.05),transparent_65%)]" />
      </div>

      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={
          shouldReduceMotion ? undefined : { duration: 0.5, ease, delay: 0.02 }
        }
      >
        <Text variant="xl" weight="semi" className="text-light pt-4">
          Welcome to World.fun Alpha
        </Text>
      </motion.div>

      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={
          shouldReduceMotion ? undefined : { duration: 0.5, ease, delay: 0.08 }
        }
      >
        <Text
          variant="base"
          className={cn("text-light opacity-50", "pt-2 pb-5.5")}
        >
          Connect wallet to start launching your World/Agent
        </Text>
      </motion.div>

      {/* Steps with manual stagger */}
      <ol className="list-none m-0 p-0">
        {steps.map((s, idx) => (
          <motion.li
            key={s.step}
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 0.45, ease, delay: 0.14 + idx * 0.07 }
            }
          >
            <LaunchStep step={s.step} title={s.title} />
          </motion.li>
        ))}
      </ol>

      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 0.45, ease, delay: 0.14 + steps.length * 0.07 }
        }
        className="mt-2"
      >
        {!isConnected ? (
          <WalletConnectButton className="w-full mt-6" />
        ) : (
          <Button
            variant="grey"
            className={cn(
              "w-full mt-2.5 !p-3.5 h-11.5 relative",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light/40",
              "transition-colors"
            )}
            onClick={() => router.push("/launch-token?step=token-type")}
            asChild={false}
          >
            <motion.span
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              whileTap={shouldReduceMotion ? undefined : { y: 0 }}
              transition={
                shouldReduceMotion ? undefined : { duration: 0.25, ease }
              }
              className="block"
            >
              <Text variant="base" className="text-light">
                Choose Token Type
              </Text>
            </motion.span>
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
};

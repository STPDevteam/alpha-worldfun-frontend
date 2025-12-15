"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./animations.css";
import { GlowingEffect } from "@/components/ui/glowing-effect";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HowItWorksPageContent = (): React.ReactElement => {
  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroControls = useAnimation();
  const heroInView = useInView(heroRef, { once: true, margin: "-20%" });

  useEffect(() => {
    if (heroInView) {
      heroControls.start("visible");
    }
  }, [heroInView, heroControls]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Hero text entrance
    const heroText = heroRef.current?.querySelector("h1");
    if (heroText) {
      gsap.fromTo(
        heroText,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.3,
        }
      );
    }

    // Page entrance
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
    );

    // Reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    if (prefersReducedMotion.matches) {
      gsap.set("*", { duration: 0.01 });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      {/* PAGE CONTAINER (no absolute; vertical stack) */}
      <main
        ref={containerRef}
        className="relative sm:mx-auto sm:mt-[81px]
          w-[calc(100%-24px)] mx-auto
          max-w-[1150px]
          p-6 lg:px-10 md:pt-[73px]
          flex flex-col
          rounded-lg
          bg-[#101010]
          gap-5 xl:gap-0
          min-h-screen"
      >
        {/* HERO */}
        <motion.section
          ref={heroRef}
          className="w-full xl:w-[1010px] xl:h-[240px]"
          initial={{ opacity: 0, y: 30 }}
          animate={heroControls}
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
            },
          }}
        >
          <h1
            className="font-bdo-grotesk font-normal text-[32px] sm:text-4xl md:text-5xl lg:text-[60px] 
            leading-tight lg:leading-[1.167] tracking-[-0.03em] text-white transition-all duration-700 hover:text-opacity-90"
          >
            World.fun Alpha is a permissionless launchpad for Autonomous Worlds
            & Agents.
          </h1>
        </motion.section>

        <div
          className="mx-auto w-full xg:mt-[90px] lg:max-w-[1070px]
            flex items-center justify-between
            border-b border-[#293033] py-2"
        />
        {/* MAIN CONTENT FRAME */}
        <motion.section
          className="w-full bg-[#101010] px-0 pb-6"
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.8,
              delay: 1.5,
              ease: [0.25, 0.1, 0.25, 1],
            },
          }}
        >
          <div className="flex flex-col">
            {/* How it Works */}
            <motion.div
              className="pt-6 lg:pt-10 w-full flex flex-col gap-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
              }}
              viewport={{ once: true, margin: "-20%" }}
            >
              <motion.h2
                className="font-dm-mono font-medium text-xl lg:text-[24px] leading-[1.333] tracking-[-0.03em] text-[#E0E0E0] w-full transition-colors duration-300 hover:text-white"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, delay: 0.1 },
                }}
                viewport={{ once: true }}
              >
                How It Works
              </motion.h2>
              <motion.p
                className="font-dm-mono font-normal text-sm lg:text-[16px] leading-[1.25] tracking-[0.02em] text-[#646E71] w-full transition-colors duration-300 hover:text-[#8A9499]"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, delay: 0.3 },
                }}
                viewport={{ once: true }}
              >
                World.fun Alpha is a permissionless launchpad where anyone can
                tokenize ideas, agents, and utilities to fund their Autonomous
                World journey.
              </motion.p>
            </motion.div>

            {/* How to Participate */}
            <motion.div
              className="pt-8 lg:pt-12 w-full xl:w-[928px] flex flex-col gap-4"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
              }}
              viewport={{ once: true, margin: "-20%" }}
            >
              <motion.h2
                className="font-dm-mono font-medium text-xl lg:text-[24px] leading-[1.333] tracking-[-0.01em] text-[#E0E0E0]
                  w-full transition-colors duration-300 hover:text-white mb-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, delay: 0.2 },
                }}
                viewport={{ once: true }}
              >
                How to Participate
              </motion.h2>

              {/* Steps */}
              <div className="w-full xl:w-[960px] xl:h-[230px]">
                {/* Mobile: horizontal scroll */}
                <div
                  className="flex overflow-x-auto overflow-y-hidden gap-3 xl:hidden hide-scrollbar pb-1"
                  style={{
                    WebkitOverflowScrolling: "touch",
                    overscrollBehaviorX: "none",
                    overscrollBehaviorY: "none",
                    touchAction: "pan-x",
                  }}
                >
                  <motion.div
                    className="flex gap-3 min-w-max"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
                    }}
                    viewport={{ once: true }}
                  >
                    {/* Step 1 */}
                    <motion.div
                      className="step-card motion-element flex flex-col 
                        rounded-lg border-[0.5px] border-[#646E71]
                        w-[223px] h-[223px] gap-3 p-4 flex-shrink-0 transition-all duration-300 
                        hover:border-[#8A9499] hover:bg-[#1A1A1A] 
                        hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, delay: 0.1 },
                      }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      viewport={{ once: true }}
                    >
                      <div className="flex flex-col gap-1">
                        <h3 className="font-dm-mono font-medium text-[16px] leading-[1.25] text-white transition-colors duration-300 hover:text-[#F0F0F0]">
                          Step 1: Create
                        </h3>
                        <p className="font-dm-mono font-light text-[14px] leading-[1.286] tracking-[-0.03em] text-[#646E71] transition-colors duration-300 hover:text-[#8A9499]">
                          Tokenize your imagination. Launch a World Idea, World Agent, or Utility Agent — each representing a simulation, character, or service. No approval required.
                        </p>
                      </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div
                      className="step-card motion-element flex flex-col w-[223px] h-[223px] gap-3 p-4 border-[0.5px] border-[#646E71] rounded-lg flex-shrink-0 transition-all duration-300 hover:border-[#8A9499] hover:bg-[#1A1A1A] hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, delay: 0.2 },
                      }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      viewport={{ once: true }}
                    >
                      <div className="flex flex-col gap-1">
                        <h3 className="font-dm-mono font-medium text-[16px] leading-[1.25] text-white transition-colors duration-300 hover:text-[#F0F0F0]">
                          Step 2: Contribute
                        </h3>
                        <p className="font-dm-mono font-normal text-[14px] leading-[1.286] text-[#646E71] transition-colors duration-300 hover:text-[#8A9499]">
                          Back the worlds and agents you believe in. Directly fund them using $AWE and receive their tokens instantly upon contribution.
                        </p>
                      </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                      className="step-card motion-element flex flex-col w-[223px] h-[223px] gap-3 p-4 border-[0.5px] border-[#646E71] rounded-lg flex-shrink-0 transition-all duration-300 hover:border-[#8A9499] hover:bg-[#1A1A1A] hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, delay: 0.3 },
                      }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      viewport={{ once: true }}
                    >
                      <div className="flex flex-col gap-1">
                        <h3 className="font-dm-mono font-medium text-[16px] leading-[1.25] text-white transition-colors duration-300 hover:text-[#F0F0F0]">
                          Step 3: Graduate
                        </h3>
                        <p className="font-dm-mono font-normal text-[14px] leading-[1.286] text-[#646E71] transition-colors duration-300 hover:text-[#8A9499]">
                          When a world or agent receives traction, it can &quot;graduate&quot; - migrating to Aerodrome to enable open trading and deeper liquidity.
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Desktop grid */}
                <motion.div
                  className="hidden xl:grid xl:grid-cols-4 gap-3"
                  initial={{ opacity: 0 }}
                  whileInView={{
                    opacity: 1,
                    transition: {
                      duration: 0.6,
                      staggerChildren: 0.1,
                      delayChildren: 0.2,
                    },
                  }}
                  viewport={{ once: true, margin: "-20%" }}
                >
                  {[
                    {
                      title: "Step 1: Create",
                      desc: "Tokenize your imagination. Launch a World Idea, World Agent, or Utility Agent — each representing a simulation, character, or service. No approval required.",
                      delay: 0.1,
                    },
                    {
                      title: "Step 2: Contribute",
                      desc: "Back the worlds and agents you believe in. Directly fund  them using $AWE and receive their tokens instantly upon contribution.",
                      delay: 0.2,
                    },
                    {
                      title: "Step 3: Graduate",
                      desc: 'When a world or agent receives traction, it can "graduate" - migrating to Aerodrome to enable open trading and deeper liquidity.',
                      delay: 0.3,
                    },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      className="step-card motion-element w-[223px] h-[223px] flex flex-col gap-3 p-4
                        border-[0.5px] border-[#646E71] rounded-lg transition-all duration-300
                        hover:border-[#8A9499] hover:bg-[#1A1A1A] hover:shadow-xl cursor-pointer group relative"
                      initial={{ opacity: 0, y: 40, scale: 0.95 }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.6,
                          delay: s.delay,
                          ease: [0.25, 0.1, 0.25, 1],
                        },
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.03,
                        transition: { duration: 0.2 },
                      }}
                      viewport={{ once: true }}
                    >
                      <GlowingEffect
                        disabled={false}
                        proximity={120}
                        spread={50}
                        blur={0}
                        movementDuration={0.3}
                        borderWidth={2}
                      />

                      <div className="flex flex-col gap-1">
                        <h3 className="font-dm-mono font-medium text-[16px] leading-[1.25] text-white transition-colors duration-300 group-hover:text-[#F0F0F0]">
                          {s.title}
                        </h3>
                        <p className="font-dm-mono text-[14px] leading-[1.286] text-[#646E71] transition-colors duration-300 group-hover:text-[#8A9499]">
                          {s.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* About Us */}
            <motion.div
              className="pt-6 lg:pt-12 pb-8 md:pb-12 lg:pb-16 w-full xl:w-[1020px] flex flex-col gap-5"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
              }}
              viewport={{ once: true, margin: "-20%" }}
            >
              <motion.h2
                className="font-dm-mono font-medium text-xl lg:text-[24px] leading-[1.333] tracking-[-0.01em] text-[#E0E0E0] w-full transition-colors duration-300 hover:text-white"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, delay: 0.2 },
                }}
                viewport={{ once: true }}
              >
                About Us
              </motion.h2>
              <motion.p
                className="font-dm-mono font-light text-sm lg:text-[16px] leading-[1.25] tracking-[0.04em] text-[#646E71] w-full whitespace-pre-line transition-colors duration-300 hover:text-[#8A9499]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    delay: 0.4,
                    ease: [0.25, 0.1, 0.25, 1],
                  },
                }}
                viewport={{ once: true }}
              >{`World.fun is the discovery platform for Autonomous Worlds and AI agents — a place to explore the most original, interactive, and experimental onchain experiences.

World.fun Alpha serves as the permissionless launchpad within this ecosystem, empowering anyone to create and fund new World Ideas, World Agents, and Utility Agents powered by the AWESOME MCP platform.

Together, they form the home of the Autonomous World economy — where imagination becomes investable, and worlds, agents, and utilities come alive onchain.`}</motion.p>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </>
  );
};

export default HowItWorksPageContent;

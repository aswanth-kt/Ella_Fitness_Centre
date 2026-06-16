"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";

export default function Banner({ handleJoinClick }) {
  const containerRef = useRef(null);

  // Track scroll within the tall container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Overlay fades in as soon as you scroll (0 → 0.15 of container)
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const overlayY = useTransform(scrollYProgress, [0, 0.15], [40, 0]);

  return (
      <div ref={containerRef} className="relative h-[250vh]">

        {/* LAYER 1: Full-screen banner (stays in place) */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Swap this for your actual <video> or <img> */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/your-hero-video.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          {/* Dark scrim so text is readable */}
          <div className="absolute inset-0 bg-black/55" />
        </div>

        {/* LAYER 2: Sticky overlay — fades in on scroll */}
        <motion.div
          style={{ opacity: overlayOpacity, y: overlayY }}
          className="sticky top-0 h-screen w-full flex items-center
                    -mt-[100vh]" // pulls it back up to overlap the banner
        >
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                          w-full text-left pt-12 md:pt-0">
            <div className="max-w-2xl">

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-gold/10
                          border border-gold/30 px-3 py-1 rounded-full
                          text-gold text-xs font-semibold tracking-wider
                          uppercase mb-6"
              >
                <Flame className="h-4 w-4" />
                <span>DISCIPLINE · DEDICATION · DOMINANCE</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-serif text-5xl md:text-7xl font-extrabold
                          tracking-tight text-white leading-tight"
              >
                WHERE DISCIPLINE <br />
                <span className="text-gold-gradient">MEETS DOMINANCE</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 text-lg md:text-xl text-gray-300 font-light
                          leading-relaxed"
              >
                Step into D'Core Fitness Zone, Noida's home for relentless
                training. Our certified master coaches and sports-science-backed
                programs are built to forge raw strength, sharpen every muscle,
                and turn discipline into a way of life.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-10 flex flex-col sm:flex-row space-y-4
                          sm:space-y-0 sm:space-x-4"
              >
                <button
                  onClick={handleJoinClick}
                  className="bg-gradient-to-r from-premium-yellow to-gold
                            text-deep-black font-bold text-center py-4 px-8
                            rounded-full shadow-lg shadow-gold/35
                            hover:scale-105 transition-transform duration-300
                            flex items-center justify-center space-x-2"
                >
                  <span>START YOUR TRANSFORMATION</span>
                  <ChevronRight className="h-5 w-5" />
                </button>

                <a>
                  href="#plans"
                  className="glass border border-gold/30 text-white font-semibold
                            text-center py-4 px-8 rounded-full hover:bg-gold/10
                            hover-gold-shadow transition-all duration-300
                            flex items-center justify-center space-x-2"
                >
                  <span>EXPLORE MEMBERSHIPS</span>
                </a>
              </motion.div>

            </div>
          </div>
        </motion.div>

      </div>
  );
}
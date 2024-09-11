import { Button, Input } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight'

const Hero = () => {
  const [animationStage, setAnimationStage] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationStage(1)
    }, 1000)

    return () => {
      clearTimeout(timer1)
    }
  }, [])

  return (
    <HeroHighlight>
      <motion.h1
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="mx-auto max-w-4xl px-4 text-center text-2xl font-bold leading-relaxed text-neutral-700 md:text-4xl lg:text-5xl lg:leading-snug dark:text-white"
      >
        <div className="flex w-full flex-col items-center justify-center gap-3 px-6 sm:mt-20 sm:flex-row">
          <div className="flex w-full flex-col items-center gap-5">
            <h1 className="inline w-full overflow-hidden text-[128px] font-bold">
              <div className="flex w-full justify-center">
                <AnimatePresence>
                  <motion.span
                    initial={{ x:0 }}
                    animate={{ x: 169 }}
                    transition={{ type: 'spring', duration: 1, delay: 2 }}
                    className="inline-block"
                  >
                    Expo
                  </motion.span>
                  <motion.span
                    initial={{ scale: 1, opacity: 1, y: 0 }}
                    animate={{ scale: 0.2, opacity: 0, y: 30 }}
                    transition={{ type: 'easeOut', duration: 0.45, delay: 2 }}
                    className="inline-block"
                  >
                    &nbsp;Upda
                  </motion.span>
                  <motion.span
                    initial={{ x: 0 }}
                    animate={{ x: -169 }}
                    transition={{ type: 'spring', duration: 1, delay: 2 }}
                    className="inline-block"
                  >
                    tes
                  </motion.span>
                </AnimatePresence>
              </div>
            </h1>
            <h2 className="text-primary inline text-5xl font-bold">
              Best OpenSource Expo OTA
            </h2>
            <h2 className="text-primary inline text-5xl font-bold">
              Alternative to Expo Updates
            </h2>
          </div>
        </div>
      </motion.h1>
    </HeroHighlight>
  )
}

export default Hero

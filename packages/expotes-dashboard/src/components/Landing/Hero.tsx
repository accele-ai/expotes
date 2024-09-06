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
                  {animationStage === 0 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      className="inline-block"
                    >
                      Expo Updates
                    </motion.span>
                  )}
                  {animationStage === 1 && (
                    <>
                      <motion.span
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="inline-block"
                      >
                        Exp
                      </motion.span>
                      <motion.span
                        initial={{ x: 200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="inline-block"
                      >
                        otes
                      </motion.span>
                    </>
                  )}
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

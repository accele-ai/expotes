import FAQ from '@/components/Landing/FAQ'
import { Features1 } from '@/components/Landing/Feature'
import Hero from '@/components/Landing/Hero'
import Pricing from '@/components/Landing/Pricing'
import { Trusted } from '@/components/Landing/Trusted'

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Hero />
      {/* <Trusted /> */}
      <Features1 />
      <Pricing />
      <FAQ />
    </div>
  )
}

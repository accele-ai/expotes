import { cn } from "@/libs/cn";
import { Button, Cards } from "nextra/components";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Slider } from "./ui/slider";

const calculateTier = (remainingMaus: number, limit: number, rate: number) => {
  if (remainingMaus <= 0) return { sum: 0, remaining: 0 };

  const mausInTier = Math.min(remainingMaus, limit);
  const tierSum = mausInTier * rate;
  const remaining = Math.max(0, remainingMaus - limit);

  return { sum: tierSum, remaining };
};

const EAS_PRICING = {
  "on-demand": {
    base: 0,
    mau: {
      include: 1000,
      tiers: [
        { limit: 199000, rate: 0.005 }, // First 199k MAUs after free tier
        { limit: 300000, rate: 0.00375 }, // Next 300k MAUs
        { limit: 500000, rate: 0.0034 }, // Next 500k MAUs
        { limit: 1000000, rate: 0.003 }, // Next 1M MAUs
        { limit: 1000000, rate: 0.0024 }, // Next 1M MAUs
        { limit: 3000000, rate: 0.0022 }, // Next 3M MAUs
        { limit: 4000000, rate: 0.0016 }, // Next 4M MAUs
        { limit: 10000000, rate: 0.0014 }, // Next 10M MAUs
        { limit: 15000000, rate: 0.00115 }, // Next 15M MAUs
        { limit: 25000000, rate: 0.001 }, // Next 25M MAUs
        { limit: 40000000, rate: 0.0009 }, // Next 40M MAUs
      ],
    },
    updates: 0,
    bandwidth: {
      include: 100, // Base 100 GiB
      perMau: 0.04, // 40 MiB = 0.04 GiB per MAU
      rate: 0.1, // $0.10 per GiB
    },
    storage: {
      include: 20, // Base 20 GiB
      rate: 0.05, // $0.05 per GiB
    },
  },
  pro: {
    base: 99,
    mau: {
      include: 50000,
      tiers: [
        { limit: 150000, rate: 0.005 }, // Next 150k MAUs
        { limit: 300000, rate: 0.00375 }, // Next 300k MAUs
        { limit: 500000, rate: 0.0034 }, // Next 500k MAUs
        { limit: 1000000, rate: 0.003 }, // Next 1M MAUs
        { limit: 1000000, rate: 0.0024 }, // Next 1M MAUs
        { limit: 3000000, rate: 0.0022 }, // Next 3M MAUs
        { limit: 4000000, rate: 0.0016 }, // Next 4M MAUs
        { limit: 10000000, rate: 0.0014 }, // Next 10M MAUs
        { limit: 15000000, rate: 0.00115 }, // Next 15M MAUs
        { limit: 25000000, rate: 0.001 }, // Next 25M MAUs
        { limit: 40000000, rate: 0.0009 }, // Next 40M MAUs
      ],
    },
    updates: 0,
    bandwidth: {
      include: 1024,
      perMau: 0.04,
      rate: 0.1,
    },
    storage: {
      include: 1024,
      rate: 0.05,
    },
  },
  enterprise: {
    base: 999,
    mau: {
      include: 1000000,
      tiers: [
        { limit: 1000000, rate: 0.003 }, // Next 1M MAUs
        { limit: 1000000, rate: 0.0024 }, // Next 1M MAUs
        { limit: 3000000, rate: 0.0022 }, // Next 3M MAUs
        { limit: 4000000, rate: 0.0016 }, // Next 4M MAUs
        { limit: 10000000, rate: 0.0014 }, // Next 10M MAUs
        { limit: 15000000, rate: 0.00115 }, // Next 15M MAUs
        { limit: 25000000, rate: 0.001 }, // Next 25M MAUs
        { limit: 40000000, rate: 0.0009 }, // Next 40M MAUs
      ],
    },
    updates: 0,
    bandwidth: {
      include: 10240,
      perMau: 0.04,
      rate: 0.1,
    },
    storage: {
      include: 10240,
      rate: 0.05,
    },
  },
} as const;

/**
 * Calculate the price of the product
 * @param maus - Monthly Active Users
 * @param updates - Number of updates per month
 * @param bandwidth - Bandwidth in GB
 * @param storage - Storage in GB
 */
const calculate = (
  plan: "on-demand" | "pro" | "enterprise",
  maus: number,
  updates: number,
  bandwidth: number,
  storage: number
) => {
  const pricing = EAS_PRICING[plan];
  const tiers = pricing.mau.tiers;
  let sum = pricing.base;

  let remainingMaus = maus - pricing.mau.include;

  for (const tier of tiers) {
    if (remainingMaus <= 0) break;
    const result = calculateTier(remainingMaus, tier.limit, tier.rate);
    sum += result.sum;
    remainingMaus = result.remaining;
  }

  // Remaining MAUs over 100M
  if (remainingMaus > 0) {
    sum += remainingMaus * 0.00085;
  }

  /* Updates */
  sum += updates * pricing.updates;

  /* Bandwidth */
  const bandwidthConfig = pricing.bandwidth;
  const bandwidthAllowance =
    bandwidthConfig.include +
    Math.max(0, maus - pricing.mau.include) * bandwidthConfig.perMau;

  let bandwidthCost = 0;
  if (bandwidth > bandwidthAllowance) {
    bandwidthCost = (bandwidth - bandwidthAllowance) * bandwidthConfig.rate;
  }

  sum += bandwidthCost;

  /* Storage */
  const storageConfig = pricing.storage;
  let storageCost = 0;
  if (storage > storageConfig.include) {
    storageCost = (storage - storageConfig.include) * storageConfig.rate;
  }

  sum += storageCost;

  return sum;
};

const PriceCalculator = () => {
  const [plan, setPlan] = useState<"on-demand" | "pro" | "enterprise">(
    "on-demand"
  );
  const [maus, setMaus] = useState(1000);
  const [updates, setUpdates] = useState(100);
  const [bandwidth, setBandwidth] = useState(100);
  const [storage, setStorage] = useState(20);

  const price = useMemo(
    () => calculate(plan, maus, updates, bandwidth, storage),
    [plan, maus, updates, bandwidth, storage]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">EAS Update Price Calculator</CardTitle>
        <CardDescription>
          Calculate the price of your project based on your plan and usage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row gap-2 items-center">
            <span className="w-24 font-bold">Plan</span>
            <Button
              variant="outline"
              className={cn(
                "w-32",
                plan === "on-demand" && "bg-primary-100/50 border-primary-200"
              )}
              onClick={() => setPlan("on-demand")}
            >
              On Demand
            </Button>
            <Button
              variant="outline"
              className={cn(
                "w-32",
                plan === "pro" && "bg-primary-100/50 border-primary-200"
              )}
              onClick={() => setPlan("pro")}
            >
              Pro
            </Button>
            <Button
              variant="outline"
              className={cn(
                "w-32",
                plan === "enterprise" && "bg-primary-100/50 border-primary-200"
              )}
              onClick={() => setPlan("enterprise")}
            >
              Enterprise
            </Button>
            <span className="ml-auto">
              ${EAS_PRICING[plan].base.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24 font-bold">MAUS</span>
            <Slider
              value={[maus]}
              onValueChange={(value) => setMaus(value[0])}
              max={1000000}
              step={1000}
              className="w-[60%]"
            />
            <span className="ml-auto">{maus.toLocaleString()}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24 font-bold">Updates</span>
            <Slider
              value={[updates]}
              onValueChange={(value) => setUpdates(value[0])}
              max={10000}
              step={10}
              className="w-[60%]"
            />
            <span className="ml-auto">{updates.toLocaleString()}</span>
          </div>
          <div className="flex flex-row gap-2">
            <p className="w-24 font-bold">Bandwidth</p>
            <Slider
              value={[bandwidth]}
              onValueChange={(value) => setBandwidth(value[0])}
              max={1024000}
              step={10}
              className="w-[60%]"
            />
            <span className="ml-auto">{bandwidth.toLocaleString()} GB</span>
          </div>
          <div className="flex flex-row gap-2 w-full">
            <p className="w-24 font-bold">Storage</p>
            <Slider
              value={[storage]}
              onValueChange={(value) => setStorage(value[0])}
              max={102400}
              step={10}
              className="w-[60%]"
            />
            <span className="ml-auto">{storage.toLocaleString()} GB</span>
          </div>
          <div className="flex flex-row gap-2 justify-between w-full">
            <p className="w-16 font-bold text-md">Price</p>
            <p className="text-md font-bold">${price.toLocaleString()}/m</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceCalculator;

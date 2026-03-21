const PERKS = [
  {
    weight: 4,
    title: "Harvest note",
    description: "Storage and ripeness guidance is included with your box."
  },
  {
    weight: 8,
    title: "VIP packaging",
    description: "We add extra protective packing for a more premium unboxing."
  },
  {
    weight: 12,
    title: "Priority dispatch",
    description: "Your order moves into our priority packing queue."
  }
];

export function getCartPerkState(totalWeightKg) {
  const weight = Number(totalWeightKg) || 0;
  const currentPerks = PERKS.filter((perk) => weight >= perk.weight);
  const nextPerk = PERKS.find((perk) => weight < perk.weight) || null;
  const previousWeight = currentPerks.length ? currentPerks[currentPerks.length - 1].weight : 0;
  const progressTarget = nextPerk?.weight || previousWeight || 1;
  const progressValue = nextPerk ? Math.max(weight - previousWeight, 0) : progressTarget;
  const progressBase = nextPerk ? Math.max(progressTarget - previousWeight, 1) : progressTarget;
  const progressPercent = Math.min(Math.round((progressValue / progressBase) * 100), 100);

  return {
    currentPerks,
    nextPerk,
    remainingWeightKg: nextPerk ? Math.max(nextPerk.weight - weight, 0) : 0,
    progressPercent
  };
}

export { PERKS };

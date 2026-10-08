export const FREE_PLAN = {
  freeStories: 2,
  freeVideoExports: 0,
  lifetimePrice: 89,
  lifetimeStoriesPerYear: 100,
  lifetimeVideosPerMonth: 4,
  lifetimeArtStyles: 6,
  lifetimeNarrationVoices: 6,
  storyPackPrice: 4.99,
  videoPackPrice: 2.99,
};

export type UserPlan = 'free' | 'lifetime';

export type PlanFeatures = {
  plan: UserPlan;
  freeStoriesIncluded: number;
  lifetimeStoriesPerYear: number;
  lifetimeVideosPerMonth: number;
  narrationVoices: number;
  illustrationStyles: number;
  lifetimePriceUsd: number;
};

export const planCatalog: Record<UserPlan, PlanFeatures> = {
  free: {
    plan: 'free',
    freeStoriesIncluded: 2,
    lifetimeStoriesPerYear: 0,
    lifetimeVideosPerMonth: 0,
    narrationVoices: 3,
    illustrationStyles: 3,
    lifetimePriceUsd: 0,
  },
  lifetime: {
    plan: 'lifetime',
    freeStoriesIncluded: 0,
    lifetimeStoriesPerYear: 100,
    lifetimeVideosPerMonth: 4,
    narrationVoices: 6,
    illustrationStyles: 6,
    lifetimePriceUsd: 89,
  },
};

export function getPlanSummary(plan: UserPlan): PlanFeatures {
  return planCatalog[plan];
}

export function canCreateStory({
  plan,
  freeStoriesUsed,
  booksThisYear,
}: {
  plan: UserPlan;
  freeStoriesUsed: number;
  booksThisYear: number;
}) {
  if (plan === 'lifetime') {
    return booksThisYear < FREE_PLAN.lifetimeStoriesPerYear;
  }

  return freeStoriesUsed < FREE_PLAN.freeStories;
}

export function canCreateVideo({
  plan,
  videosThisMonth,
}: {
  plan: UserPlan;
  videosThisMonth: number;
}) {
  if (plan === 'lifetime') {
    return videosThisMonth < FREE_PLAN.lifetimeVideosPerMonth;
  }

  return false;
}

export function getPlanStatusText(plan: UserPlan): string {
  if (plan === 'lifetime') {
    return 'Lifetime access • 100 books/year • 4 videos/month';
  }

  return 'Free trial • 2 full stories included';
}

export function formatLifetimePrice() {
  return `$${FREE_PLAN.lifetimePrice.toFixed(2)}`;
}

export default FREE_PLAN;

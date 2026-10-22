import { createFileRoute } from "@tanstack/react-router";
import { AudienceAndFaq } from "@/components/landing/AudienceFaq";
import { FormatsSection } from "@/components/landing/FormatsSection";
import { LandingCta, LandingFooter } from "@/components/landing/Footer";
import { LandingHeader } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { SampleReader } from "@/components/landing/SampleReader";
import { StyleGallery, StoryWorld } from "@/components/landing/StyleAndWorld";
import { Workspaces } from "@/components/landing/Workspaces";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CyliaTales — Make stories worth keeping" },
      {
        name: "description",
        content:
          "Turn one small idea into a children's book, read-aloud and story world you can shape, review and share.",
      },
      { property: "og:title", content: "CyliaTales — Make stories worth keeping" },
      {
        property: "og:description",
        content: "A story studio for families, educators and independent authors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <LandingHeader />
      <main>
        <Hero />
        <SampleReader />
        <FormatsSection />
        <StyleGallery />
        <StoryWorld />
        <Workspaces />
        <AudienceAndFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}

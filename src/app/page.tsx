import { HomeHeaderBlock } from "@/components/sections/HomeHeaderBlock";
import { WorkFeaturedBlock } from "@/components/sections/WorkFeaturedBlock";
import { ClientsBlock } from "@/components/sections/ClientsBlock";

export default function HomePage() {
  return (
    <>
      <HomeHeaderBlock />
      <WorkFeaturedBlock />
      <ClientsBlock />
    </>
  );
}

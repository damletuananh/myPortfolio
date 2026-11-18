import type { Metadata } from "next";
import { AboutBlocks } from "@/components/sections/AboutBlocks";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story of Dam Le Tuan Anh—from dissecting web templates after lockdown and pivoting for university doors, to three SEAL hackathons, community classrooms, and System Thinking.",
};

export default function AboutPage() {
  return <AboutBlocks />;
}

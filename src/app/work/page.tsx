import type { Metadata } from "next";
import { WorkCatalogBlock } from "@/components/sections/WorkCatalogBlock";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Six real systems built by Dam Le Tuan Anh: sub-2ms Ho Chi Minh City traffic maps, schema-locked AI QA, empathetic health RAG, charity playrooms, full-stack logistics, and O(1) canvas engines.",
};

export default function WorkPage() {
  return <WorkCatalogBlock />;
}

import type { Metadata } from "next";
import { ContactBlock } from "@/components/sections/ContactBlock";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Write to Dam Le Tuan Anh in Ho Chi Minh City for software engineering internships, enduring full-stack systems, and grounded applied-AI collaborations.",
};

export default function ContactPage() {
  return <ContactBlock />;
}

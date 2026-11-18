import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PROJECTS,
  getProjectBySlug,
  getNextProject,
} from "@/data/portfolio";
import { ProjectDetailBlocks } from "@/components/sections/ProjectDetailBlocks";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return {
      title: "Project Not Found",
    };
  }
  return {
    title: project.title,
    description: project.summary,
  };
}

async function ProjectDetailContent({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    notFound();
  }
  const nextProject = getNextProject(slug);
  return <ProjectDetailBlocks project={project} nextProject={nextProject} />;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <Suspense fallback={<div className="contentWrapper" />}>
      <ProjectDetailContent params={params} />
    </Suspense>
  );
}

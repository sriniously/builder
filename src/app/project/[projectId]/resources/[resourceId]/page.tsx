"use client";

import { useGetResourceQuery } from "@/lib/api/resources";
import { useParams } from "next/navigation";
import { useState } from "react";

export type From = "ts" | "zod" | "json";

export type To = "ts" | "zod" | "json";

export default function ResourcePage() {
  const { projectId, resourceId } = useParams();
  const [from, setFrom] = useState<From>("ts");
  const [to, setTo] = useState<To>("json");

  const { data: resource } = useGetResourceQuery(
    Number(projectId),
    Number(resourceId)
  );

  if (!resource) {
    return null;
  }

  return (
    <div className="h-screen overflow-y-hidden">
      <h2 className="text-2xl font-bold">{resource.name}</h2>
      <p className="text-base text-gray-400 mt-2">{resource.description}</p>

      <section className="flex h-full">
        <div className="flex-[0.5]"></div>
        <div className="border-l border-gray-200 h-full" />
        <div className="flex-[0.5]"></div>
      </section>
    </div>
  );
}

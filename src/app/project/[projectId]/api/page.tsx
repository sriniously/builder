"use client";

import { Button } from "@/components/ui/button";
import {
  useCreateTagMutation,
  useGetAllTagsQuery,
  useUpdateTagMutation,
} from "@/lib/api/tags";
import { Tag } from "@/lib/db/models";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { TagDialog } from "./_client/dialog";
import { useState } from "react";
import TagCard from "./_client/tag-card";

export default function ApiPage() {
  const { projectId } = useParams();

  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  const { data: tags } = useGetAllTagsQuery(Number(projectId));

  const { mutate: createTag, isPending: isCreatingTag } = useCreateTagMutation(
    Number(projectId)
  );
  const { mutate: updateTag, isPending: isUpdatingTag } = useUpdateTagMutation(
    Number(projectId),
    selectedTagId
  );

  const handleCreateTag = (
    tag: Pick<Tag, "name" | "description" | "resourceId">
  ) => {
    createTag({ ...tag, projectId: Number(projectId) });
    setIsTagDialogOpen(false);
  };

  const handleUpdateTag = (
    tag: Pick<Tag, "name" | "description" | "resourceId">
  ) => {
    if (!selectedTagId) return;
    updateTag({ ...tag, id: selectedTagId, projectId: Number(projectId) });
    setSelectedTagId(null);
    setIsTagDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tags</h2>
        <Dialog
          open={isTagDialogOpen}
          onOpenChange={(value) => {
            setIsTagDialogOpen(value);
            if (!value) {
              setSelectedTagId(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center mt-5">
              <PlusCircle className="h-8 w-8" />
              Create New Tag
            </Button>
          </DialogTrigger>
          {isTagDialogOpen && (
            <TagDialog
              isSubmitting={isCreatingTag || isUpdatingTag}
              key={isTagDialogOpen ? "open" : "closed"}
              onSubmit={selectedTagId ? handleUpdateTag : handleCreateTag}
              tagId={selectedTagId}
            />
          )}
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 mt-5">
        {tags?.map((tag) => (
          <TagCard key={tag.id} tagId={tag.id} projectId={Number(projectId)} />
        ))}
      </div>
    </div>
  );
}

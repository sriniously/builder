import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "../db";
import { Tag } from "../db/models";

export const useGetAllTagsQuery = (projectId: number) => {
  return useQuery({
    queryKey: ["tags", projectId],
    queryFn: () => db.tags.where("projectId").equals(projectId).toArray(),
  });
};

export const useGetTagQuery = (projectId: number, tagId: number | null) => {
  return useQuery({
    queryKey: ["tag", projectId, tagId],
    queryFn: () =>
      db.tags
        .where("projectId")
        .equals(projectId)
        .and((t) => t.id === tagId)
        .first(),
    enabled: !!tagId && !!projectId,
  });
};

export const useCreateTagMutation = (projectId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tag: Omit<Tag, "id">) => db.tags.add(tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", projectId] });
    },
  });
};

export const useUpdateTagMutation = (
  projectId: number,
  tagId: number | null
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tag: Tag) => db.tags.put(tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", projectId] });
      queryClient.invalidateQueries({ queryKey: ["tag", projectId, tagId] });
    },
  });
};

export const useDeleteTagMutation = (projectId: number, tagId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => db.tags.delete(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", projectId] });
      queryClient.invalidateQueries({ queryKey: ["tag", projectId, tagId] });
    },
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "../db";
import { Resource } from "../db/models";

export const useGetAllResourcesQuery = (projectId: number) => {
  return useQuery({
    queryKey: ["resources", projectId],
    queryFn: () => db.resources.where("projectId").equals(projectId).toArray(),
  });
};

export const useGetResourceQuery = (
  projectId: number,
  resourceId: number | null
) => {
  return useQuery({
    queryKey: ["resource", projectId, resourceId],
    queryFn: () =>
      db.resources
        .where("projectId")
        .equals(projectId)
        .and((r) => r.id === resourceId)
        .first(),
    enabled: !!resourceId && !!projectId,
  });
};

export const useCreateResourceMutation = (projectId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resource: Omit<Resource, "id">) => db.resources.add(resource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", projectId] });
    },
  });
};

export const useUpdateResourceMutation = (
  projectId: number,
  resourceId: number | null
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resource: Resource) => db.resources.put(resource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["resource", projectId, resourceId],
      });
    },
  });
};

export const useDeleteResourceMutation = (
  projectId: number,
  resourceId: number
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => db.resources.delete(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["resource", projectId, resourceId],
      });
    },
  });
};

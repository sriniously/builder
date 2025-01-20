import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "../db";
import { Resource } from "../db/models";
import { convertToSnakeCase, pluralize } from "../utils";

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
    mutationFn: async (resource: Omit<Resource, "id">) => {
      const newResource = await db.resources.add(resource);

      await db.tags.add({
        name: pluralize(convertToSnakeCase(resource.name)),
        description: "",
        projectId,
        resourceId: newResource,
      });

      return newResource;
    },
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
    mutationFn: async () => {
      await db.transaction("rw", db.resources, db.tags, async () => {
        // Delete tags
        const tags = await db.tags
          .where("resourceId")
          .equals(resourceId)
          // for those tags that are not associated with a resource
          .or("projectId")
          .equals(projectId)
          .toArray();
        await db.tags.bulkDelete(tags.map((tag) => tag.id));

        // Delete project
        return db.resources.delete(resourceId);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["resource", projectId, resourceId],
      });
      queryClient.invalidateQueries({ queryKey: ["tags", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["tag", projectId],
      });
    },
  });
};

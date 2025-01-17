import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Project } from "../db/models";

export const useGetAllProjectsQuery = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => db.projects.toArray(),
  });
};

export const useGetProjectQuery = (id: number | null) => {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => (id ? db.projects.get(id) : undefined),
    enabled: !!id,
  });
};

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Omit<Project, "id">) => db.projects.add(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useUpdateProjectMutation = (id: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Project) => db.projects.put(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => db.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

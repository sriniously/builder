import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "../db";
import { Endpoint } from "../db/models";

export const useGetAllEndpointsQuery = (tagId: number) => {
  return useQuery({
    queryKey: ["endpoints", tagId],
    queryFn: () => db.endpoints.where("tagId").equals(tagId).toArray(),
  });
};

export const useGetEndpointQuery = (
  tagId: number,
  endpointId: number | null
) => {
  return useQuery({
    queryKey: ["endpoint", tagId, endpointId],
    queryFn: () =>
      db.endpoints
        .where("tagId")
        .equals(tagId)
        .and((e) => e.id === endpointId)
        .first(),
    enabled: !!endpointId && !!tagId,
  });
};

export const useCreateEndpointMutation = (tagId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (endpoint: Omit<Endpoint, "id">) => db.endpoints.add(endpoint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", tagId] });
    },
  });
};

export const useUpdateEndpointMutation = (tagId: number, endpointId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (endpoint: Endpoint) => db.endpoints.put(endpoint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", tagId] });
      queryClient.invalidateQueries({
        queryKey: ["endpoint", tagId, endpointId],
      });
    },
  });
};

export const useDeleteEndpointMutation = (tagId: number, endpointId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => db.endpoints.delete(endpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", tagId] });
      queryClient.invalidateQueries({
        queryKey: ["endpoint", tagId, endpointId],
      });
    },
  });
};

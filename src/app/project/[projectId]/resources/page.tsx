"use client";

import { Confirm } from "@/components/custom/confirm";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateResourceMutation,
  useDeleteResourceMutation,
  useGetAllResourcesQuery,
  useGetResourceQuery,
  useUpdateResourceMutation,
} from "@/lib/api/resources";
import { Resource } from "@/lib/db/models";
import { truncate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight, Braces, Edit, PlusCircle, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { match } from "ts-pattern";
import { z } from "zod";
import Link from "next/link";
import { DefaultKeysAccordion } from "@/components/default-keys-accordion";

export default function ResourcesPage() {
  const { projectId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(
    null
  );

  const { data: resources, isLoading: isLoadingResources } =
    useGetAllResourcesQuery(Number(projectId));

  const { mutate: createResource, isPending: isCreatingResource } =
    useCreateResourceMutation(Number(projectId));

  const { mutate: updateResource, isPending: isUpdatingResource } =
    useUpdateResourceMutation(Number(projectId), selectedResourceId);

  const { data: resource } = useGetResourceQuery(
    Number(projectId),
    selectedResourceId
  );

  const handleCreateResource = (data: {
    name: string;
    description: string;
    defaultKeys?: string[];
  }) => {
    let content = "z.object({";
    data.defaultKeys?.forEach((key) => {
      content += `${key}: z.string(),`;
    });
    content += "})";
    createResource({ ...data, projectId: Number(projectId), content });
    setIsDialogOpen(false);
  };

  const handleUpdateResource = (data: {
    name: string;
    description: string;
  }) => {
    if (!selectedResourceId) return;
    updateResource({
      ...resource,
      ...data,
      id: selectedResourceId,
      projectId: Number(projectId),
    } as Resource);
    setSelectedResourceId(null);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resources</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(value) => {
            setIsDialogOpen(value);
            if (!value) {
              setSelectedResourceId(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center mt-5">
              <PlusCircle className="h-8 w-8" />
              Create New Resource
            </Button>
          </DialogTrigger>
          {isDialogOpen && (
            <ResourceDialog
              isSubmitting={isCreatingResource || isUpdatingResource}
              key={isDialogOpen ? "open" : "closed"}
              onSubmit={
                selectedResourceId ? handleUpdateResource : handleCreateResource
              }
              resourceId={selectedResourceId}
            />
          )}
        </Dialog>
      </div>

      <section className="flex flex-wrap gap-4 mt-5">
        {match({ isLoadingResources, resources })
          .with({ isLoadingResources: true, resources: undefined }, () =>
            [...Array(5)].map((_, index) => (
              <Skeleton key={index} className="w-60 h-32" />
            ))
          )
          .with({ isLoadingResources: false, resources: [] }, () => (
            <div className="flex items-center justify-center w-full h-24">
              <p className="text-gray-400 text-2xl">No resources found</p>
            </div>
          ))
          .otherwise(
            () =>
              resources?.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  setSelectedResourceId={setSelectedResourceId}
                  setIsResourceDialogOpen={setIsDialogOpen}
                />
              ))
          )}
      </section>
    </div>
  );
}

const ResourceCard = ({
  resource,
  setSelectedResourceId,
  setIsResourceDialogOpen,
}: {
  resource: Resource;
  setSelectedResourceId: (id: number) => void;
  setIsResourceDialogOpen: (open: boolean) => void;
}) => {
  const { projectId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutate: deleteResource } = useDeleteResourceMutation(
    Number(projectId),
    resource.id
  );

  return (
    <div className="p-5 h-32 w-80 border rounded-lg hover:shadow-md flex items-center gap-5 relative">
      {/* Logo */}
      <Braces className="h-full w-20" />

      <div>
        {/* Icons */}
        <Edit
          onClick={() => {
            setSelectedResourceId(resource.id);
            setIsResourceDialogOpen(true);
          }}
          className="h-4 w-4 absolute top-2 right-8 text-blue-500 hover:text-blue-600 cursor-pointer"
        />
        <Trash2
          onClick={() => setIsDialogOpen(true)}
          className="h-4 w-4 absolute top-2 right-2 text-red-500 hover:text-red-600 cursor-pointer"
        />

        {/* Content */}
        <h2 title={resource.name} className="text-xl font-semibold">
          {truncate(resource.name, 15)}
        </h2>
        <p title={resource.description} className="text-gray-400 text-sm">
          {truncate(resource.description, 30)}
        </p>

        <button className="flex items-center gap-2 mt-5 text-sm text-blue-500 hover:text-blue-600">
          <ArrowRight className="h-4 w-4" />
          <Link href={`/project/${projectId}/resources/${resource.id}`}>
            View Resource
          </Link>
        </button>

        <Confirm
          open={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          handleSubmit={deleteResource}
          title="Are you sure you want to delete this resource?"
          description="This action cannot be undone."
        />
      </div>
    </div>
  );
};

const resourceFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string(),
  defaultKeys: z.array(z.string()).optional(),
});

type ResourceFormSchema = z.infer<typeof resourceFormSchema>;

interface ResourceDialogProps {
  resourceId: number | null;
  isSubmitting: boolean;
  onSubmit: (data: z.infer<typeof resourceFormSchema>) => void;
}

const ResourceDialog = ({
  isSubmitting,
  onSubmit,
  resourceId,
}: ResourceDialogProps) => {
  const { projectId } = useParams();
  const { data: resource } = useGetResourceQuery(Number(projectId), resourceId);
  const [defaultKeysEnabled, setDefaultKeysEnabled] = useState(true);
  const [selectedDefaultKeys, setSelectedDefaultKeys] = useState<string[]>([
    "id",
    "createdAt",
    "updatedAt",
  ]);

  const form = useForm<ResourceFormSchema>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: resource?.name || "",
      description: resource?.description || "",
    },
  });

  useEffect(() => {
    if (resource) {
      form.reset({
        name: resource.name,
        description: resource.description,
      });
    }

    return () => {
      form.reset();
    };
  }, [resource, form]);

  const handleSubmit = (data: ResourceFormSchema) => {
    onSubmit({
      ...data,
      defaultKeys: defaultKeysEnabled ? selectedDefaultKeys : [],
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {resourceId ? "Edit Resource" : "Create New Resource"}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Resource Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Resource Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DefaultKeysAccordion
            enabled={defaultKeysEnabled}
            onEnabledChange={setDefaultKeysEnabled}
            selectedKeys={selectedDefaultKeys}
            onSelectedKeysChange={setSelectedDefaultKeys}
          />

          <Button
            type="submit"
            disabled={!form.formState.isDirty || isSubmitting}
          >
            {resourceId ? "Update Resource" : "Create Resource"}
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
};

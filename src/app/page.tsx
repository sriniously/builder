"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Edit, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetAllProjectsQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
} from "@/lib/api/projects";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/lib/db/models/projects";
import { Confirm } from "@/components/custom/confirm";
import { match } from "ts-pattern";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { truncate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  const { data: projects, isLoading: isLoadingProjects } =
    useGetAllProjectsQuery();

  const { mutate: createProject, isPending: isCreatingProject } =
    useCreateProjectMutation();

  const { mutate: updateProject, isPending: isUpdatingProject } =
    useUpdateProjectMutation(selectedProjectId);

  const handleCreateProject = (data: { name: string; description: string }) => {
    createProject(data);
    setIsDialogOpen(false);
  };

  const handleUpdateProject = (data: { name: string; description: string }) => {
    if (!selectedProjectId) return;
    updateProject({ ...data, id: selectedProjectId });
    setSelectedProjectId(null);
    setIsDialogOpen(false);
  };

  return (
    <main className="p-5">
      <h2 className="text-2xl font-bold">My Projects</h2>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(value) => {
          setIsDialogOpen(value);
          if (!value) {
            setSelectedProjectId(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className="flex items-center mt-5">
            <PlusCircle className="h-8 w-8" />
            Create New Project
          </Button>
        </DialogTrigger>
        {isDialogOpen && (
          <ProjectDialog
            isSubmitting={isCreatingProject || isUpdatingProject}
            key={isDialogOpen ? "open" : "closed"}
            onSubmit={
              selectedProjectId ? handleUpdateProject : handleCreateProject
            }
            projectId={selectedProjectId}
          />
        )}
      </Dialog>
      <div className="flex flex-wrap gap-4 mt-5">
        {match({ isLoadingProjects, projects })
          .with({ isLoadingProjects: true, projects: undefined }, () =>
            [...Array(5)].map((_, index) => (
              <Skeleton key={index} className="w-60 h-32" />
            ))
          )
          .with(
            {
              isLoadingProjects: false,
              projects: [],
            },
            () => (
              <div className="flex items-center justify-center w-full h-24">
                <p className="text-gray-400 text-2xl">No projects found</p>
              </div>
            )
          )
          .otherwise(() =>
            projects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                setSelectedProjectId={setSelectedProjectId}
                setIsProjectDialogOpen={setIsDialogOpen}
              />
            ))
          )}
      </div>
    </main>
  );
}

const ProjectCard = ({
  project,
  setSelectedProjectId,
  setIsProjectDialogOpen,
}: {
  project: Project;
  setSelectedProjectId: (id: number) => void;
  setIsProjectDialogOpen: (open: boolean) => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutate: deleteProject } = useDeleteProjectMutation();

  return (
    <div className="p-5 h-32 w-60 border rounded-lg hover:shadow-md relative">
      {/* Icons */}
      <Edit
        onClick={() => {
          setSelectedProjectId(project.id);
          setIsProjectDialogOpen(true);
        }}
        className="h-4 w-4 absolute top-2 right-8 text-blue-500 hover:text-blue-600 cursor-pointer"
      />
      <Trash2
        onClick={() => setIsDialogOpen(true)}
        className="h-4 w-4 absolute top-2 right-2 text-red-500 hover:text-red-600 cursor-pointer"
      />

      {/* Content */}
      <h2 className="text-xl font-semibold">{project.name}</h2>
      <p className="text-gray-400">{truncate(project.description)}</p>

      <button className="flex items-center gap-2 mt-5 text-sm text-blue-500 hover:text-blue-600">
        <ArrowRight className="h-4 w-4" />
        <Link href={`/projects/${project.id}`}>View Project</Link>
      </button>

      <Confirm
        open={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        handleSubmit={() => deleteProject(project.id)}
        title="Are you sure you want to delete this project?"
        description="This action cannot be undone."
      />
    </div>
  );
};

const projectFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string(),
});

type ProjectFormSchema = z.infer<typeof projectFormSchema>;

interface ProjectDialogProps {
  // if this is passed then we are editing the project
  projectId: number | null;
  isSubmitting: boolean;
  onSubmit: (data: z.infer<typeof projectFormSchema>) => void;
}

const ProjectDialog = ({
  isSubmitting,
  onSubmit,
  projectId,
}: ProjectDialogProps) => {
  const { data: project } = useGetProjectQuery(projectId);

  const form = useForm<ProjectFormSchema>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
      });
    }

    return () => {
      form.reset();
    };
  }, [project, form]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {projectId ? "Edit Project" : "Create New Project"}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Project Name" {...field} />
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
                  <Textarea placeholder="Project Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={!form.formState.isDirty || isSubmitting}
          >
            {projectId ? "Update Project" : "Create Project"}
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
};

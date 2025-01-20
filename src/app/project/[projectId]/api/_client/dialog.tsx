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
import { Textarea } from "@/components/ui/textarea";
import { useGetTagQuery } from "@/lib/api/tags";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const tagFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string(),
});

type TagFormSchema = z.infer<typeof tagFormSchema>;

interface TagDialogProps {
  tagId: number | null;
  isSubmitting: boolean;
  onSubmit: (data: z.infer<typeof tagFormSchema>) => void;
}

export const TagDialog = ({
  isSubmitting,
  onSubmit,
  tagId,
}: TagDialogProps) => {
  const { projectId } = useParams();
  const { data: tag } = useGetTagQuery(Number(projectId), tagId);

  const form = useForm<TagFormSchema>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: tag?.name || "",
      description: tag?.description || "",
    },
  });

  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag.name,
        description: tag.description,
      });
    }

    return () => {
      form.reset();
    };
  }, [tag, form]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{tagId ? "Edit Tag" : "Create New Tag"}</DialogTitle>
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
                  <Input placeholder="Tag Name" {...field} />
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
                  <Textarea placeholder="Tag Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!form.formState.isDirty || isSubmitting}
          >
            {tagId ? "Update Tag" : "Create Tag"}
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
};

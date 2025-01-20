import { useGetTagQuery } from "@/lib/api/tags";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, PlusIcon } from "lucide-react";
import { useGetAllEndpointsQuery } from "@/lib/api/endpoints";
import { match } from "ts-pattern";
import EndpointCard from "./endpoint-card";
import { Skeleton } from "@/components/ui/skeleton";

interface TagCardProps {
  tagId: number;
  projectId: number;
}

const TagCard = ({ tagId, projectId }: TagCardProps) => {
  const { data: tag } = useGetTagQuery(projectId, tagId);

  const { data: endpoints, isLoading: isEndpointsLoading } =
    useGetAllEndpointsQuery(tagId);

  if (!tag) {
    return null;
  }

  return (
    <Card>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`tag-${tag.id}`}>
          <AccordionTrigger className="px-4 py-2 font-bold text-lg text-cyan-400">{`/${tag.name}`}</AccordionTrigger>
          <AccordionContent className="px-4">
            <p className="text-sm text-muted-foreground">{tag.description}</p>

            {/* render endpoints */}
            {match({ endpoints, isEndpointsLoading })
              .with({ endpoints: [], isEndpointsLoading: false }, () => (
                <p className="text-lg text-muted-foreground text-center">
                  No endpoints
                </p>
              ))
              .with({ endpoints: [], isEndpointsLoading: true }, () =>
                [...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))
              )
              .otherwise(() => {
                return endpoints?.map((endpoint) => (
                  <EndpointCard key={endpoint.id} endpointId={endpoint.id} />
                ));
              })}

            {/* create endpoint button with icon */}
            <section className="flex items-center gap-5">
              <Button className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                <p>Create Endpoint</p>
              </Button>

              <Button className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <p>Generate Presets</p>
              </Button>
            </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default TagCard;

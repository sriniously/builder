import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface DefaultKeysAccordionProps {
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  selectedKeys: string[];
  onSelectedKeysChange: (keys: string[]) => void;
}

const DEFAULT_KEYS = [
  { id: "id", label: "ID", defaultChecked: true },
  { id: "createdAt", label: "Created At", defaultChecked: true },
  { id: "updatedAt", label: "Updated At", defaultChecked: true },
  { id: "deletedAt", label: "Deleted At", defaultChecked: false },
];

export function DefaultKeysAccordion({
  enabled,
  onEnabledChange,
  selectedKeys,
  onSelectedKeysChange,
}: DefaultKeysAccordionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="default-keys">Add Default Keys</Label>
        <Switch
          id="default-keys"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {enabled && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="default-keys">
            <AccordionTrigger>Select Default Keys</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {DEFAULT_KEYS.map((key) => (
                  <div key={key.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={key.id}
                      checked={selectedKeys.includes(key.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onSelectedKeysChange([...selectedKeys, key.id]);
                        } else {
                          onSelectedKeysChange(
                            selectedKeys.filter((k) => k !== key.id)
                          );
                        }
                      }}
                      defaultChecked={key.defaultChecked}
                    />
                    <Label htmlFor={key.id}>{key.label}</Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

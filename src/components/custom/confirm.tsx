import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type ConfirmProps = {
  open: boolean;
  setIsOpen: (val: boolean) => void;
  title?: string;
  description?: string;
  handleSubmit: () => void;
  isSubmitting?: boolean;
};

export function Confirm({
  open,
  setIsOpen,
  title,
  description,
  handleSubmit,
  isSubmitting,
}: ConfirmProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || "Are you absolutely sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <AlertDialogAction
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleSubmit}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

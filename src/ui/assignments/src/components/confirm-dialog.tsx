import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} from "@fluentui/react-components";

export interface ConfirmDialogProps {
  openState: ReturnType<typeof React.useState<boolean>>;
  title: string;
  subText: string;
  onConfirm: (result: boolean) => void;
}

export const ConfirmDialog: React.FunctionComponent<ConfirmDialogProps> = ({
  openState,
  title,
  subText,
  onConfirm,
}) => {
  const [open, setOpen] = openState;
  return (
    <Dialog open={open} onOpenChange={(_event, data) => setOpen(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{subText}</DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" onClick={() => onConfirm(false)}>
                לא
              </Button>
            </DialogTrigger>
            <Button appearance="primary" onClick={() => onConfirm(true)}>
              כן
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

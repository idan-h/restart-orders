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
  ButtonProps,
} from "@fluentui/react-components";

export interface ConfirmDialogProps {
  openState: ReturnType<typeof React.useState<boolean>>;
  title: string;
  subText: string;
  buttons: {
    text: string;
    appearance?: ButtonProps["appearance"];
    onClick?: () => void;
  }[];
}

export const ConfirmDialog: React.FunctionComponent<ConfirmDialogProps> = ({
  openState,
  title,
  subText,
  buttons,
}) => {
  const [open, setOpen] = openState;
  return (
    <Dialog open={open} onOpenChange={(_event, data) => setOpen(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{subText}</DialogContent>
          <DialogActions>
            {buttons.map((button, index) => (
              <DialogTrigger key={index} disableButtonEnhancement>
                <Button
                  appearance={button.appearance ?? "secondary"}
                  onClick={button.onClick}
                >
                  {button.text}
                </Button>
              </DialogTrigger>
            ))}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

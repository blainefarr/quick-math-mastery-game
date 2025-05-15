
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  continueText: string;
  cancelText: string;
  onContinue: () => void;
  onCancel: () => void;
  continueButtonClassName?: string;
}

export function PaywallModal({
  open,
  onOpenChange,
  title,
  description,
  continueText,
  cancelText,
  onContinue,
  onCancel,
  continueButtonClassName = ''
}: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-2">
          <Button 
            type="button" 
            variant="ghost"
            className={`w-full text-primary hover:bg-transparent ${continueButtonClassName}`}
            onClick={onContinue}
          >
            {continueText}
          </Button>
          <Button 
            type="button" 
            variant="default"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

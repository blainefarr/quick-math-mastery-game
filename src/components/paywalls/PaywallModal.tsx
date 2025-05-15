
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
            variant="default"
            className={`w-full hover:bg-transparent hover:text-primary ${continueButtonClassName}`}
            onClick={onContinue}
          >
            {continueText}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

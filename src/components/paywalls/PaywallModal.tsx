
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

export interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  continueText: string;
  onContinue: () => void;
  cancelText: string;
}

export function PaywallModal({
  open,
  onOpenChange,
  title,
  description,
  continueText,
  onContinue,
  cancelText
}: PaywallModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/plans');
    onOpenChange(false);
  };

  const handleContinue = () => {
    onContinue();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center justify-end space-x-2">
          <AlertDialogCancel
            asChild
            onClick={handleContinue}
            className="text-primary hover:text-primary/80 border-none shadow-none bg-transparent m-0"
          >
            <Button variant="link">{continueText}</Button>
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUpgrade}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Upgrade
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

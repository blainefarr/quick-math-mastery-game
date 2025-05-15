
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'react-router-dom';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  cancelText: string;
  onCancel: () => void;
  actionText: string;
  onAction: () => void;
}

export function PaywallModal({
  open,
  onOpenChange,
  title,
  description,
  cancelText,
  onCancel,
  actionText,
  onAction
}: PaywallModalProps) {
  const router = useRouter();
  
  const handleUpgrade = () => {
    onAction();
    router.push('/plans');
  };
  
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center justify-between">
          <Button 
            variant="link" 
            onClick={handleCancel}
            className="text-blue-500"
          >
            {cancelText}
          </Button>
          <Button 
            onClick={handleUpgrade} 
            className="bg-primary"
          >
            {actionText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


import { toast } from "@/components/ui/toast";
import {
  useToast as useToastOriginal,
} from "@/components/ui/use-toast";

export { toast };
export const useToast = useToastOriginal;

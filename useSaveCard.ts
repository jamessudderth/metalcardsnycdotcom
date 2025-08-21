import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface CardData {
  profileId: number;
  templateId: number;
  customizations: {
    layout: string;
    backgroundColor: string;
    textColor: string;
    backgroundImageUrl?: string;
    overlayColor?: string;
    overlayOpacity?: number;
  };
}

export function useSaveCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const mutation = useMutation({
    mutationFn: async (cardData: CardData) => {
      return apiRequest("POST", "/api/cards", cardData);
    },
    onSuccess: (data) => {
      // Invalidate and refetch card data
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      
      toast({
        title: "Card submitted for review",
        description: "Your business card has been created and sent to admin for approval. You'll be notified once it's approved.",
      });
      
      // Redirect to dashboard
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error saving card",
        description: `Something went wrong: ${error}`,
        variant: "destructive",
      });
    },
  });

  return {
    saveCard: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}

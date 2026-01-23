import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useUpload() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File | Blob) => {
      const formData = new FormData();
      // Name 'file' is conventional, adjust if server expects something else
      formData.append("file", file);

      const res = await fetch(api.upload.create.path, {
        method: api.upload.create.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upload failed");
      return api.upload.create.responses[200].parse(await res.json());
    },
    onError: () => {
      toast({ title: "Upload Failed", description: "Could not upload file", variant: "destructive" });
    },
  });
}

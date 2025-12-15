import { useMutation } from "@tanstack/react-query";
import { getUploadUrl, uploadFile } from "@/libs/services/upload";
import { useAuthStore } from "@/libs/stores";
import { useToast } from "./common";
import { Text } from "@/components/ui";
export const useUploadMedia = () => {
  const jwt = useAuthStore((state) => state.jwt);
  const toast = useToast();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!jwt) {
        throw new Error("Please login to upload media");
      }

      const result = await getUploadUrl({
        mimeType: file.type,
        folder: "users/profile-pictures",
      });
      await uploadFile(file, result.uploadUrl);
      return { fileUrl: result.publicUrl, fileKey: result.fileKey };
    },
    onSuccess() {
      toast.toast("success", {
        title: "Media uploaded successfully",
      });
    },
    onError(error) {
      const message = error.message || "Failed to upload media";
      toast.toast("error", {
        title: message,
      });
    },
  });
};

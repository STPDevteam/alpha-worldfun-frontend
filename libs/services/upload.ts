import { api, authApi } from "@/libs/api";

const getUploadUrl = async ({
  mimeType,
  folder,
}: {
  mimeType: string;
  folder: string;
}) => {
  const res = await authApi.post<{
    uploadUrl: string;
    publicUrl: string;
    fileKey: string;
  }>("/upload/presigned-url", {
    mimeType,
    folder,
  });
  return res.data;
};

const uploadFile = async (file: File, uploadUrl: string) => {
  const res = await api.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
  return res.data;
};

export { getUploadUrl, uploadFile };

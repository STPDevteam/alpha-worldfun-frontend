import { getWorlds } from "@/libs/services/api/agent.service";
import { useQuery } from "@tanstack/react-query";

export const useGetWorlds = () => {
  return useQuery({
    queryKey: ["worlds"],
    queryFn: () => getWorlds(),
  });
};

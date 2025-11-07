import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAsns, addAdditionalAsns } from "../services/asns";

export const useCreateAsns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ asnList, distroId, userId }) =>
      createAsns(asnList, distroId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["asns"]);
    },
    onError: (error) => {
      console.error("Error in useCreateAsns mutation:", error);
    },
  });
};

export const useAddAdditionalAsns = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ asn, palletId, userId }) =>
      addAdditionalAsns(asn, palletId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["asns"]);
    },
    onError: (error) => {
      console.error("Error in useAddAdditionalAsns mutation:", error);
      console.error("Error details:", error.response?.data);
    },
  });
};

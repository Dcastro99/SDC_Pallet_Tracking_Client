import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAsns,
  addAdditionalAsns,
  stagePallet,
  loadPalletToLocation,
  unloadPalletFromLocation,
  deleteAsnFromPallet,
  deletePallet,
} from "../services/asns";

export const useCreateAsns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ asnList, distroId, userId }) =>
      createAsns(asnList, distroId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["asns"]);
    },
    // onError: (error) => {
    //   console.error("Error in useCreateAsns mutation:", error);
    // },
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
    // onError: (error) => {
    //   console.error("Error details:", error.response?.data);
    // },
  });
};

export const useStagePallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ palletId, locationName, userId, distroId }) =>
      stagePallet(palletId, locationName, userId, distroId),
    onSuccess: () => {
      queryClient.invalidateQueries(["asns"]);
    },
    // onError: (error) => {
    //   console.error("Error in useStagePallet mutation:", error);
    //   console.error("Error details:", error.response?.data);
    // },
  });
};

export const useLoadPalletToLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ palletId, bayCode, userId, distroId }) =>
      loadPalletToLocation(palletId, bayCode, userId, distroId),
    onSuccess: () => {
      queryClient.invalidateQueries(["asns"]);
    },
    // onError: (error) => {
    //   console.error("Error in useLoadPalletToLocation mutation:", error);
    //   console.error("Error details:", error.response?.data);
    // },
  });
};

export const useUnloadPalletFromLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ palletId, locationName, statusId, userId, distroId }) =>
      unloadPalletFromLocation(
        palletId,
        locationName,
        statusId,
        userId,
        distroId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["asns"]);
    },
    // onError: (error) => {
    //   console.error("Error in useUnloadPalletFromLocation mutation:", error);
    //   console.error("Error details:", error.response?.data);
    // },
  });
};

export const useDeleteAsnFromPallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ asnNumber, distroId, userId }) =>
      deleteAsnFromPallet(asnNumber, distroId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["asns"]);
    },
    // onError: (error) => {
    //   console.error("Error in useDeleteAsnFromPallet mutation:", error);
    //   console.error("Error details:", error.response?.data);
    // },
  });
};

export const useDeletePallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ palletId, userId, distroId }) =>
      deletePallet(palletId, userId, distroId),
    onSuccess: () => {
      queryClient.invalidateQueries(["asns"]);
    },
    // onError: (error) => {
    //   console.error("Error in useDeleteAsnFromPallet mutation:", error);
    //   console.error("Error details:", error.response?.data);
    // },
  });
};

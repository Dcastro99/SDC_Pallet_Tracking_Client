import api from "./api";

export const fetchPalletByASN = async (asnNumber, distroId) => {
  try {
    const response = await api.get(
      `/Pallets/get-pallet-by-asn/${asnNumber}/${distroId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pallet by ASN:", error);
    throw error;
  }
};

export const createAsns = async (asnList, distroId, userId) => {
  try {
    const response = await api.post("/Pallets/add-pallet/", {
      asns: asnList,
      distroId,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating ASNs:", error);
    throw error;
  }
};
export const addAdditionalAsns = async (asn, palletId, userId) => {
  try {
    const response = await api.post("/Pallets/add-asn-to-pallet", {
      asn,
      palletId,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding additional ASNs:", error);
    console.error("Error response data:", error.response?.data);
    throw error;
  }
};

export const stagePallet = async (palletId, locationName, userId, distroId) => {
  try {
    const response = await api.post("/Pallets/stage-pallet", {
      pallet_id: palletId,
      location_name: locationName,
      user_id: userId,
      distro_id: distroId,
    });
    return response.data;
  } catch (error) {
    console.error("Error staging pallet:", error);
    throw error;
  }
};

export const loadPalletToLocation = async (
  palletId,
  bayCode,
  userId,
  distroId
) => {
  try {
    const response = await api.post("/Pallets/load-pallet", {
      pallet_id: palletId,
      bay_door: bayCode,
      user_id: userId,
      distro_id: distroId,
    });
    return response.data;
  } catch (error) {
    console.error("Error loading pallet to location:", error);
    throw error;
  }
};

export const unloadPalletFromLocation = async (
  palletId,
  locationName,
  statusId,
  userId,
  distroId
) => {
  try {
    const response = await api.post("/Pallets/unload-pallet", {
      pallet_id: palletId,
      bay_door: locationName,
      status_id: statusId,
      user_id: userId,
      distro_id: distroId,
    });
    return response.data;
  } catch (error) {
    console.error("Error unloading pallet from location:", error);
    throw error;
  }
};

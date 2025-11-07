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
// {
//   "asn": "string",
//   "palletId": 0,
//   "userId": "string"
// }

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

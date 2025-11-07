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

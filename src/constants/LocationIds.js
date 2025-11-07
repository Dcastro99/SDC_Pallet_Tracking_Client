export const LOCATION_IDS = {
  "CM-AMR-01": 1,
  "CM-AMR-02": 2,
  "CM-AMR-03": 3,
  "CM-AMR-04": 4,
  "CM-AMR-05": 5,
  "CM-AMR-06": 6,
  "CM-AMR-07": 7,
  "CM-AMR-08": 8,
  "CM-AMR-09": 9,
  "CM-AMR-10": 10,
  "CM-AMR-11": 11,
  "BAY-34": 13,
  "BAY-35": 14,
  "BAY-36": 15,
  "BAY-37": 16,
  "STAGE-01": 17,
  "STAGE-02": 18,
  "STAGE-03": 19,
  "STAGE-04": 20,
  "STAGE-05": 21,
  "STAGE-06": 22,
  "STAGE-07": 23,
  "STAGE-08": 24,
  "STAGE-09": 25,
  "STAGE-10": 26,
  "STAGE-11": 27,
  "STAGE-12": 28,
  "STAGE-13": 29,
  "STAGE-14": 30,
  "STAGE-15": 31,
  "STAGE-16": 32,
  "STAGE-17": 33,
  "STAGE-18": 34,
  "STAGE-19": 35,
  "STAGE-20": 36,
  "W4-AMR-01": 37,
};

export const LOCATION_CODE = {
  1: "P&D",
  2: "P&D",
  3: "P&D",
  4: "P&D",
  5: "P&D",
  6: "P&D",
  7: "P&D",
  8: "P&D",
  9: "P&D",
  10: "P&D",
  11: "P&D",
  14: "BAY",
  15: "BAY",
  16: "BAY",
  17: "BAY",
  24: "STAGE",
  25: "STAGE",
  26: "STAGE",
  27: "STAGE",
  28: "STAGE",
  29: "STAGE",
  30: "STAGE",
  31: "STAGE",
  32: "STAGE",
  33: "STAGE",
  34: "STAGE",
  35: "STAGE",
  36: "STAGE",
  37: "STAGE",
  38: "STAGE",
  39: "STAGE",
  40: "STAGE",
  41: "STAGE",
  42: "STAGE",
  43: "STAGE",
  44: "SHRK",
};

export const LOCATION_NAMES = Object.entries(LOCATION_IDS).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {}
);

export const getLocationNameById = (id) => {
  return LOCATION_NAMES[id] || "";
};

console.log("Location Names:", getLocationNameById(13));

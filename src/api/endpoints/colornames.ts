import { colorNameApi } from "../services/color-name-api.ts";

export function getBasicColorNameByHex(hexCode: string) {
  return colorNameApi.get(`/`, {
    params: {
      values: hexCode,
      list: "basic",
      noduplicates: true,
    },
  });
}

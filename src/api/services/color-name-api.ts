import axios from "axios";

export const colorNameApi = axios.create({
  baseURL: "https://api.color.pizza/v1",
});

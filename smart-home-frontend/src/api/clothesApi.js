import api from "./axios";

export const getClothesStatus = () => api.get("/clothes");
export const clothesCmd = (cmd) => api.post("/clothes/cmd", { cmd });

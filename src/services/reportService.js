import api from "@/services/api";

export const reportService = {
  generateReport: async (payload) => {
    const res = await api.post("/admin/reports", payload);
    return res.data;
  }
};
export default reportService;

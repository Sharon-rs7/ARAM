import api, { USE_MOCKS } from "./api";

export const reportService = {
  generateReport: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        reportId: `rep-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        totalCases: 54,
        resolvedCases: 40,
        averageResponseTime: "2.4 hours"
      };
    }
    const res = await api.post("/admin/reports", payload);
    return res.data;
  }
};

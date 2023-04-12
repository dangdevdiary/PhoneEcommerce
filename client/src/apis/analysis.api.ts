import http from 'src/utils/http';

const timeout = (ms: number) => {
  return new Promise((s) => setTimeout(s, ms));
};
export interface ResTopSale {
  id: number;
  name: string;
  rate: string;
  image: string;
  price: string;
  brand: {
    id: number;
    name: string;
    description: string;
  };
  total_sale: number;
}
const baseURL = '/analysis';
const analysisApi = {
  analysBrand() {
    return http.get(`${baseURL}/brand`);
  },
  analysOverview() {
    return http.get(`${baseURL}/overview`);
  },
  topSales() {
    return http.get<ResTopSale[]>(`${baseURL}/top_sale`);
  },
  saleSatistic() {
    return http.get(`${baseURL}/sales`);
  },
  reportRevenue(startDate: string, endDate: string) {
    return http.post(`analysis/report_revenue`, { startDate, endDate });
  },
  reportInventory(startDate: string, endDate: string) {
    return http.post(`analysis/report_inventory`, { startDate, endDate });
  },
};

export default analysisApi;

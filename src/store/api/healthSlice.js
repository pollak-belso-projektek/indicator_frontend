import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import config from "../../config";

export const healthApi = createApi({
  reducerPath: "healthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiBaseUrl,
    timeout: 10000,
  }),
  endpoints: (builder) => ({
    checkHealth: builder.query({
      query: () => "health",
    }),
  }),
});

export const { useCheckHealthQuery } = healthApi;

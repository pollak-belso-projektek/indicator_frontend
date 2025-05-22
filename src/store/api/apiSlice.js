import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const indicatorApi = createApi({
  reducerPath: "indicatorApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3300/api/v1/" }),
  // 10.0.0.50
  endpoints: (build) => ({
    getTanugyiAdatok: build.query({
      query: (params) => `tanugyi_adatok/${params.alapadatok_id}/${params.ev}`,
    }),
    getAlapadatok: build.query({
      query: (params) => `alapadatok/${params.id}`,
    }),
    addTanugyiAdatok: build.mutation({
      query: (params) => ({
        url: "tanugyi_adatok/",
        method: "POST",
        body: {
          alapadatok_id: params.alapadatok_id,
          tanugyi_adatok: params.tanugyi_adatok,
        },
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetTanugyiAdatokQuery,
  useAddTanugyiAdatokMutation,
  useGetAlapadatokQuery,
} = indicatorApi;

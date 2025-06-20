import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

// Define a service using a base URL and expected endpoints
export const indicatorApi = createApi({
  reducerPath: "indicatorApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "TanugyiAdatok",
    "Alapadatok",
    "Kompetencia",
    "TanuloLetszam",
  ],
  endpoints: (build) => ({
    // Authentication endpoints
    login: build.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: build.mutation({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
    }),
    refreshToken: build.mutation({
      query: (refreshToken) => ({
        url: "auth/refresh",
        method: "POST",
        body: { refreshToken },
      }),
    }),
    // User management endpoints
    getUsers: build.query({
      query: () => "users/",
      providesTags: ["User"],
    }),
    getUserById: build.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    addUser: build.mutation({
      query: (userData) => ({
        url: "users/",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: build.mutation({
      query: ({ id, ...userData }) => ({
        url: `users/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    deleteUser: build.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    getTanugyiAdatok: build.query({
      query: (params) => `tanugyi_adatok/${params.alapadatok_id}/${params.ev}`,
    }),
    getAlapadatok: build.query({
      query: (params) => `alapadatok/${params.id}`,
    }),
    getAllAlapadatok: build.query({
      query: () => `alapadatok/`,
    }),
    getKompetencia: build.query({
      query: (params) => `kompetencia/${params.id}`,
    }),
    getTanuloLetszam: build.query({
      query: (params) => `tanulo_letszam/${params.alapadatok_id}`,
    }),
    addTanuloLetszam: build.mutation({
      query: (params) => ({
        url: "tanulo_letszam/",
        method: "POST",
        body: {
          alapadatok_id: params.alapadatok_id,
          letszam: params.letszam,
          jogv_tipus: params.jogv_tipus,
          szakirany: params.szakirany,
          tanev_kezdete: params.tanev_kezdete,
        },
      }),
    }),
    deleteTanuloLetszam: build.mutation({
      query: (params) => ({
        url: `tanulo_letszam/${params.alapadatok_id}/${params.year}`,
        method: "DELETE",
      }),
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
    addKompetencia: build.mutation({
      query: (params) => ({
        url: "kompetencia/",
        method: "POST",
        body: {
          alapadatok_id: params.alapadatok_id,
          tanev_kezdete: params.tanev_kezdete,
          mat_orsz_p: params.mat_orsz_p,
          szoveg_orsz_p: params.szoveg_orsz_p,
          mat_int_p: params.mat_int_p,
          szoveg_int_p: params.szoveg_int_p,
          kepzes_forma: params.kepzes_forma,
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
  useGetAllAlapadatokQuery,
  useGetKompetenciaQuery,
  useAddKompetenciaMutation,
  useGetTanuloLetszamQuery,
  useAddTanuloLetszamMutation,
  useDeleteTanuloLetszamMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = indicatorApi;

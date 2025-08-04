import { indicatorApi } from "./apiSlice";

export const oktatokEgyebTevSlice = indicatorApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET - Összes rekord lekérése tanév alapján
    getOktatokEgyebTevByYear: builder.query({
      query: (tanev) => ({
        url: `/oktato-egyeb-tev?tanev=${tanev}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "OktatokEgyebTev", id })),
              { type: "OktatokEgyebTev", id: "LIST" },
            ]
          : [{ type: "OktatokEgyebTev", id: "LIST" }],
    }),

    // GET - Rekordok lekérése intézmény szerint
    getOktatokEgyebTevByAlapadatok: builder.query({
      query: ({ alapadatokId, tanev }) => ({
        url: `/oktato-egyeb-tev/alapadatok/${alapadatokId}?tanev=${tanev}`,
        method: "GET",
      }),
      providesTags: (result, error, { alapadatokId }) => [
        { type: "OktatokEgyebTev", id: alapadatokId },
      ],
    }),

    // GET - Egy rekord lekérése ID alapján
    getOktatokEgyebTevById: builder.query({
      query: (id) => ({
        url: `/oktato-egyeb-tev/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "OktatokEgyebTev", id }],
    }),

    // POST - Új rekord létrehozása
    addOktatokEgyebTev: builder.mutation({
      query: (data) => ({
        url: "/oktato-egyeb-tev",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "OktatokEgyebTev", id: "LIST" }],
    }),

    // PUT - Rekord frissítése
    updateOktatokEgyebTev: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/oktato-egyeb-tev/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "OktatokEgyebTev", id },
        { type: "OktatokEgyebTev", id: "LIST" },
      ],
    }),

    // DELETE - Rekord törlése
    deleteOktatokEgyebTev: builder.mutation({
      query: (id) => ({
        url: `/oktato-egyeb-tev/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "OktatokEgyebTev", id },
        { type: "OktatokEgyebTev", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOktatokEgyebTevByYearQuery,
  useGetOktatokEgyebTevByAlapadatokQuery,
  useGetOktatokEgyebTevByIdQuery,
  useAddOktatokEgyebTevMutation,
  useUpdateOktatokEgyebTevMutation,
  useDeleteOktatokEgyebTevMutation,
} = oktatokEgyebTevSlice;

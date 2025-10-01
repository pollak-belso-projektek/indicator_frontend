import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

// Define a service using a base URL and expected endpoints
export const indicatorApi = createApi({
  reducerPath: "indicatorApi",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 0, // Don't keep any unused data
  refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
  refetchOnReconnect: true, // Refetch when reconnecting
  refetchOnFocus: false, // Disable to prevent excessive refetching and race conditions
  tagTypes: [
    "User",
    "TanugyiAdatok",
    "AlkalmazottAdatok",
    "Alapadatok",
    "Kompetencia",
    "TanuloLetszam",
    "TableList",
    "Elhelyezkedes",
    "FelvettekSzama",
    "SajatosNevelesuTanulok",
    "HHesHHHNevelesuTanulok",
    "Vizsgaeredmenyek",
    "SzakmaiVizsgaEredmenyek",
    "SzakkepzesiMunszerzodesArany",
    "Muhelyiskola",
    "NSZFH",
    "SZMSZ",
    "EgyOktatoraJutoTanulo",
    "IntezmenyiNeveltseg",
    "Dobbanto",
    "Logs",
    "OktatokEgyebTev",
    "Szakirany",
    "Szakma",
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
    getFilteredUsers: build.query({
      query: () => "users/filtered",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "User", id })), "User"]
          : ["User"],
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
    changeUserPassword: build.mutation({
      query: ({ id, newPassword, newPasswordConfirm }) => ({
        url: `users/${id}/password`,
        method: "PUT",
        body: {
          id,
          newPassword,
          newPasswordConfirm,
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    getTanugyiAdatok: build.query({
      query: (params) => `tanugyi_adatok/${params.alapadatok_id}/${params.ev}`,
      providesTags: (result, error, params) => [
        { type: "TanugyiAdatok", id: `${params.alapadatok_id}_${params.ev}` },
      ],
    }),
    getAlapadatok: build.query({
      query: (params) => `alapadatok/${params.id}`,
      providesTags: (result, error, params) => [
        { type: "Alapadatok", id: params.id },
      ],
    }),
    getAllAlapadatok: build.query({
      query: () => `alapadatok/`,
      providesTags: ["Alapadatok"],
    }),
    addAlapadatok: build.mutation({
      query: (schoolData) => ({
        url: "alapadatok/",
        method: "POST",
        body: schoolData,
      }),
      invalidatesTags: ["Alapadatok"],
    }),
    updateAlapadatok: build.mutation({
      query: ({ id, ...schoolData }) => ({
        url: `alapadatok/${id}`,
        method: "PUT",
        body: schoolData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Alapadatok", id },
        "Alapadatok",
      ],
    }),
    deleteAlapadatok: build.mutation({
      query: (id) => ({
        url: `alapadatok/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Alapadatok"],
    }),
    getKompetencia: build.query({
      query: (params) => `kompetencia/${params.id}`,
      providesTags: (result, error, params) => [
        { type: "Kompetencia", id: params.id },
      ],
    }),
    getTanuloLetszam: build.query({
      query: (params) => `tanulo_letszam/${params.alapadatok_id}`,
      providesTags: (result, error, params) => [
        { type: "TanuloLetszam", id: params.alapadatok_id },
      ],
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
          szakma: params.szakma,
          tanev_kezdete: params.tanev_kezdete,
        },
      }),
      invalidatesTags: (result, error, params) => [
        { type: "TanuloLetszam", id: params.alapadatok_id },
        "TanuloLetszam", // Invalidate all TanuloLetszam queries
        "TanugyiAdatok", // Also invalidate related data
      ],
      // Force refetch after successful mutation
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Force refetch of related queries
          dispatch(
            indicatorApi.util.invalidateTags(["TanuloLetszam", "TanugyiAdatok"])
          );
        } catch {}
      },
    }),
    updateTanuloLetszam: build.mutation({
      query: (params) => ({
        url: `tanulo_letszam/${params.id}`,
        method: "PUT",
        body: {
          alapadatok_id: params.alapadatok_id,
          letszam: params.letszam,
          jogv_tipus: params.jogv_tipus,
          szakirany: params.szakirany,
          szakma: params.szakma,
          tanev_kezdete: params.tanev_kezdete,
        },
      }),
      invalidatesTags: (result, error, params) => [
        { type: "TanuloLetszam", id: params.alapadatok_id },
        "TanuloLetszam", // Invalidate all TanuloLetszam queries
        "TanugyiAdatok", // Also invalidate related data
      ],
      // Force refetch after successful mutation
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Force refetch of related queries
          dispatch(
            indicatorApi.util.invalidateTags(["TanuloLetszam", "TanugyiAdatok"])
          );
        } catch {}
      },
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
      invalidatesTags: (result, error, params) => [
        {
          type: "TanugyiAdatok",
          id: `${params.alapadatok_id}_${params.tanev_kezdete || "all"}`,
        },
        "TanugyiAdatok",
        "TanuloLetszam", // Also invalidate related student data
      ],
      // Force refetch after successful mutation
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Force refetch of related queries
          dispatch(
            indicatorApi.util.invalidateTags(["TanugyiAdatok", "TanuloLetszam"])
          );
        } catch {}
      },
    }),
    addAlkalmazottAdatok: build.mutation({
      query: (params) => ({
        url: "alkalmazottak_munkaugy/",
        method: "POST",
        body: {
          alapadatok_id: params.alapadatok_id,
          alkalmazottak_munkaugy: params.alkalmazottak_munkaugy,
        },
      }),
      invalidatesTags: ["AlkalmazottAdatok"],
    }),
    getAlkalmazottAdatok: build.query({
      query: (params) =>
        `alkalmazottak_munkaugy/${params.alapadatok_id}/${params.tanev_kezdete}`,
      providesTags: (result, error, params) => [
        {
          type: "AlkalmazottAdatok",
          id: `${params.alapadatok_id}_${params.tanev_kezdete}`,
        },
      ],
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
      invalidatesTags: (result, error, params) => [
        { type: "Kompetencia", id: params.alapadatok_id },
      ],
    }),
    // Table management endpoints
    getTableList: build.query({
      query: () => "tablelist",
      providesTags: ["TableList"],
    }),
    createTable: build.mutation({
      query: (newTable) => ({
        url: "tablelist",
        method: "POST",
        body: newTable,
      }),
      invalidatesTags: ["TableList"],
    }),
    updateTable: build.mutation({
      query: ({ id, ...updatedTable }) => ({
        url: `tablelist/${id}`,
        method: "PUT",
        body: updatedTable,
      }),
      invalidatesTags: ["TableList"],
    }),

    // ========== Educational Indicators Endpoints ==========

    // Helper function to get current school year start
    getCurrentSchoolYearStart: () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      if (currentMonth >= 9) {
        return currentYear;
      } else {
        return currentYear - 1;
      }
    },

    // Elhelyezkedési mutato (Graduate Placement)
    getElhelyezkedesByYear: build.query({
      query: (tanev) => `elhelyezkedes/${tanev}`,
      providesTags: (result, error, tanev) => [
        { type: "Elhelyezkedes", id: tanev },
      ],
    }),
    getElhelyezkedesBySchoolAndYear: build.query({
      query: ({ alapadatokId, tanev }) =>
        `elhelyezkedes/${alapadatokId}/${tanev}`,
      providesTags: (result, error, { alapadatokId, tanev }) => [
        { type: "Elhelyezkedes", id: `${alapadatokId}-${tanev}` },
      ],
    }),
    getAllElhelyezkedes: build.query({
      query: () => {
        // Get current school year start (e.g., 2024 for 2024/2025 school year)
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let currentSchoolYearStart;
        if (currentMonth >= 9) {
          currentSchoolYearStart = currentYear;
        } else {
          currentSchoolYearStart = currentYear - 1;
        }

        // The API expects just the starting year as integer
        return `elhelyezkedes/${currentSchoolYearStart}`;
      },
      providesTags: ["Elhelyezkedes"],
    }),
    addElhelyezkedes: build.mutation({
      query: (data) => ({
        url: "elhelyezkedes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Elhelyezkedes"],
    }),
    updateElhelyezkedes: build.mutation({
      query: ({ id, ...data }) => ({
        url: `elhelyezkedes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Elhelyezkedes"],
    }),
    deleteElhelyezkedes: build.mutation({
      query: (id) => ({
        url: `elhelyezkedes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Elhelyezkedes"],
    }),
    deleteElhelyezkedesBySchoolAndYear: build.mutation({
      query: ({ alapadatokId, tanev }) => ({
        url: `elhelyezkedes/${alapadatokId}/${tanev}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Elhelyezkedes"],
    }),

    // Felvettek_szama (Admissions)
    getAllFelvettekSzama: build.query({
      query: () => "felvettek_szama",
      providesTags: ["FelvettekSzama"],
    }),
    getFelvettekSzamaByAlapadatokIdAndYear: build.query({
      query: ({ alapadatokId, year }) =>
        `felvettek_szama/${alapadatokId}/${year}`,
      providesTags: (result, error, { alapadatokId, year }) => [
        { type: "FelvettekSzama", id: `${alapadatokId}-${year}` },
      ],
    }),
    addFelvettekSzama: build.mutation({
      query: (data) => ({
        url: "felvettek_szama",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FelvettekSzama"],
    }),
    updateFelvettekSzama: build.mutation({
      query: ({ id, ...data }) => ({
        url: `felvettek_szama/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FelvettekSzama"],
    }),
    deleteFelvettekSzama: build.mutation({
      query: (id) => ({
        url: `felvettek_szama/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FelvettekSzama"],
    }),

    // Sajatos_nevelesu_tanulok (Special Needs Students)
    getSajatosNevelesuTanulokByYear: build.query({
      query: (tanev) => `sajatos_nevelesu_tanulok/${tanev}`,
      providesTags: (result, error, tanev) => [
        { type: "SajatosNevelesuTanulok", id: tanev },
      ],
    }),
    getAllSajatosNevelesuTanulok: build.query({
      query: () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let currentSchoolYearStart;
        if (currentMonth >= 9) {
          currentSchoolYearStart = currentYear;
        } else {
          currentSchoolYearStart = currentYear - 1;
        }

        return `sajatos_nevelesu_tanulok/${currentSchoolYearStart}`;
      },
      providesTags: ["SajatosNevelesuTanulok"],
    }),
    addSajatosNevelesuTanulok: build.mutation({
      query: (data) => ({
        url: "sajatos_nevelesu_tanulok",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SajatosNevelesuTanulok"],
    }),
    updateSajatosNevelesuTanulok: build.mutation({
      query: ({ id, ...data }) => ({
        url: `sajatos_nevelesu_tanulok/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SajatosNevelesuTanulok"],
    }),
    deleteSajatosNevelesuTanulok: build.mutation({
      query: (id) => ({
        url: `sajatos_nevelesu_tanulok/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SajatosNevelesuTanulok"],
    }),

    // HH_es_HHH_nevelesu_tanulok (Disadvantaged Students)
    getHHesHHHNevelesuTanulokByYear: build.query({
      query: (tanev) => `hh_es_hhh/${tanev}`,
      providesTags: (result, error, tanev) => [
        { type: "HHesHHHNevelesuTanulok", id: tanev },
      ],
    }),
    getAllHHesHHHNevelesuTanulok: build.query({
      query: () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let currentSchoolYearStart;
        if (currentMonth >= 9) {
          currentSchoolYearStart = currentYear;
        } else {
          currentSchoolYearStart = currentYear - 1;
        }

        return `hh_es_hhh/${currentSchoolYearStart}`;
      },
      providesTags: ["HHesHHHNevelesuTanulok"],
    }),
    addHHesHHHNevelesuTanulok: build.mutation({
      query: (data) => ({
        url: `hh_es_hhh`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["HHesHHHNevelesuTanulok"],
    }),
    updateHHesHHHNevelesuTanulok: build.mutation({
      query: ({ id, ...data }) => ({
        url: `hh_es_hhh/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["HHesHHHNevelesuTanulok"],
    }),
    deleteHHesHHHNevelesuTanulok: build.mutation({
      query: (id) => ({
        url: `hh_es_hhh/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["HHesHHHNevelesuTanulok"],
    }),

    // Vizsgaeredmenyek (Exam Results)
    getVizsgaeredmenyekByYear: build.query({
      query: (tanev) => `vizsgaeredmenyek/${tanev}`,
      providesTags: (result, error, tanev) => [
        { type: "Vizsgaeredmenyek", id: tanev },
      ],
    }),
    getAllVizsgaeredmenyek: build.query({
      query: () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let currentSchoolYearStart;
        if (currentMonth >= 9) {
          currentSchoolYearStart = currentYear;
        } else {
          currentSchoolYearStart = currentYear - 1;
        }

        return `vizsgaeredmenyek/${currentSchoolYearStart}`;
      },
      providesTags: ["Vizsgaeredmenyek"],
    }),
    addVizsgaeredmenyek: build.mutation({
      query: (data) => ({
        url: "vizsgaeredmenyek",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Vizsgaeredmenyek"],
    }),
    updateVizsgaeredmenyek: build.mutation({
      query: ({ id, ...data }) => ({
        url: `vizsgaeredmenyek/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Vizsgaeredmenyek"],
    }),
    deleteVizsgaeredmenyek: build.mutation({
      query: (id) => ({
        url: `vizsgaeredmenyek/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vizsgaeredmenyek"],
    }),

    // Szakmai_vizsga_eredmenyek (Professional Exam Results)
    getSzakmaiVizsgaEredmenyekByYear: build.query({
      query: (tanev) => `szakmai_vizsga_eredmenyek/${tanev}`,
      providesTags: (result, error, tanev) => [
        { type: "SzakmaiVizsgaEredmenyek", id: tanev },
      ],
    }),
    getAllSzakmaiVizsgaEredmenyek: build.query({
      query: () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let currentSchoolYearStart;
        if (currentMonth >= 9) {
          currentSchoolYearStart = currentYear;
        } else {
          currentSchoolYearStart = currentYear - 1;
        }

        return `szakmai_vizsga_eredmenyek/${currentSchoolYearStart}`;
      },
      providesTags: ["SzakmaiVizsgaEredmenyek"],
    }),
    addSzakmaiVizsgaEredmenyek: build.mutation({
      query: (data) => ({
        url: "szakmai_vizsga_eredmenyek",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SzakmaiVizsgaEredmenyek"],
    }),
    updateSzakmaiVizsgaEredmenyek: build.mutation({
      query: ({ id, ...data }) => ({
        url: `szakmai_vizsga_eredmenyek/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SzakmaiVizsgaEredmenyek"],
    }),
    deleteSzakmaiVizsgaEredmenyek: build.mutation({
      query: (id) => ({
        url: `szakmai_vizsga_eredmenyek/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SzakmaiVizsgaEredmenyek"],
    }),

    // Muhelyiskola (Workshop Schools)
    getMuhelyiskola: build.query({
      query: ({ alapadatok_id, tanev } = {}) => {
        // Always use the tanev parameter if provided, otherwise default to current year
        const yearToUse = tanev || new Date().getFullYear();
        return `muhelyiskola/${yearToUse}`;
      },
      providesTags: (result, error, params = {}) => [
        { type: "Muhelyiskola", id: params.alapadatok_id || "all" },
        "Muhelyiskola",
      ],
    }),
    addMuhelyiskola: build.mutation({
      query: (data) => ({
        url: "muhelyiskola",
        method: "POST",
        body: {
          alapadatok_id: data.alapadatok_id,
          tanev_kezdete: data.tanev_kezdete,
          reszszakmat_szerezok_szama: data.reszszakmat_szerezok_szama,
          muhelyiskola_tanuloi_osszletszam:
            data.muhelyiskola_tanuloi_osszletszam,
        },
      }),
      invalidatesTags: (result, error, data) => [
        { type: "Muhelyiskola", id: data.alapadatok_id },
        "Muhelyiskola",
      ],
    }),
    updateMuhelyiskola: build.mutation({
      query: ({ id, ...data }) => ({
        url: `muhelyiskola/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { alapadatok_id }) => [
        { type: "Muhelyiskola", id: alapadatok_id },
        "Muhelyiskola",
      ],
    }),
    deleteMuhelyiskola: build.mutation({
      query: (id) => ({
        url: `muhelyiskola/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Muhelyiskola"],
    }),

    // NSZFH (National Skills Framework)
    getNSZFHByYear: build.query({
      query: (tanev) => `nszfh/${tanev}`,
      providesTags: (result, error, tanev) => [{ type: "NSZFH", id: tanev }],
    }),
    getAllNSZFH: build.query({
      query: () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let currentSchoolYearStart;
        if (currentMonth >= 9) {
          currentSchoolYearStart = currentYear;
        } else {
          currentSchoolYearStart = currentYear - 1;
        }

        return `nszfh/${currentSchoolYearStart}`;
      },
      providesTags: ["NSZFH"],
    }),
    addNSZFH: build.mutation({
      query: (data) => ({
        url: "nszfh",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["NSZFH"],
    }),
    updateNSZFH: build.mutation({
      query: ({ id, ...data }) => ({
        url: `nszfh/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["NSZFH"],
    }),
    deleteNSZFH: build.mutation({
      query: (id) => ({
        url: `nszfh/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["NSZFH"],
    }),

    // SZMSZ (Vocational Statistics)
    getSZMSZByYear: build.query({
      query: (tanev) => `szmsz/${tanev}`,
      providesTags: (result, error, tanev) => [{ type: "SZMSZ", id: tanev }],
    }),
    getAllSZMSZ: build.query({
      query: ({ alapadatok_id, tanev }) => `szmsz/${alapadatok_id}/${tanev}`,
      providesTags: ["SZMSZ"],
    }),
    addSZMSZ: build.mutation({
      query: (data) => ({
        url: "szmsz",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SZMSZ"],
    }),
    updateSZMSZ: build.mutation({
      query: ({ id, ...data }) => ({
        url: `szmsz/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SZMSZ"],
    }),
    deleteSZMSZ: build.mutation({
      query: (id) => ({
        url: `szmsz/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SZMSZ"],
    }),

    // EgyOktatoraJutoTanulo (Students per Teacher)
    getAllEgyOktatoraJutoTanulo: build.query({
      query: () => "egy_oktatora_juto_tanulo",
      providesTags: ["EgyOktatoraJutoTanulo"],
    }),
    getEgyOktatoraJutoTanuloByAlapadatok: build.query({
      query: ({ alapadatok_id, year }) =>
        `egy_oktatora_juto_tanulo/${alapadatok_id}/${year}`,
      providesTags: (result, error, alapadatok_id) => [
        { type: "EgyOktatoraJutoTanulo", id: alapadatok_id },
      ],
    }),
    addEgyOktatoraJutoTanulo: build.mutation({
      query: (data) => ({
        url: "egy_oktatora_juto_tanulo",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["EgyOktatoraJutoTanulo"],
    }),
    updateEgyOktatoraJutoTanulo: build.mutation({
      query: ({ id, ...data }) => ({
        url: `egy_oktatora_juto_tanulo/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["EgyOktatoraJutoTanulo"],
    }),

    // Intezmenyi_neveltseg (Institutional Education Level)
    getIntezmenyiNeveltsegByYear: build.query({
      query: (tanev) => `intezmenyi_neveltseg/${tanev}`,
      providesTags: (result, error, tanev) => [
        { type: "IntezmenyiNeveltseg", id: tanev },
      ],
    }),
    getAllIntezmenyiNeveltseg: build.query({
      query: () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let currentSchoolYearStart;
        if (currentMonth >= 9) {
          currentSchoolYearStart = currentYear;
        } else {
          currentSchoolYearStart = currentYear - 1;
        }

        return `intezmenyi_neveltseg/${currentSchoolYearStart}`;
      },
      providesTags: ["IntezmenyiNeveltseg"],
    }),
    addIntezmenyiNeveltseg: build.mutation({
      query: (data) => ({
        url: "intezmenyi_neveltseg",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["IntezmenyiNeveltseg"],
    }),
    updateIntezmenyiNeveltseg: build.mutation({
      query: ({ id, ...data }) => ({
        url: `intezmenyi_neveltseg/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["IntezmenyiNeveltseg"],
    }),
    deleteIntezmenyiNeveltseg: build.mutation({
      query: (id) => ({
        url: `intezmenyi_neveltseg/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["IntezmenyiNeveltseg"],
    }),

    // Logs management endpoints (Admin/Superadmin only)
    getLogs: build.query({
      query: ({
        page = 1,
        limit = 50,
        level,
        method,
        userId,
        startDate,
        endDate,
      } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        if (level) params.append("level", level);
        if (method) params.append("method", method);
        if (userId) params.append("userId", userId);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        return `logs?${params.toString()}`;
      },
      providesTags: (result, error, params) => [
        { type: "Logs", id: `page-${params?.page || 1}` },
        "Logs",
      ],
    }),
    getLogById: build.query({
      query: (id) => `logs/${id}`,
      providesTags: (result, error, id) => [{ type: "Logs", id }],
    }),
    deleteLogs: build.mutation({
      query: ({ before, level, method } = {}) => {
        const params = new URLSearchParams();
        if (before) params.append("before", before);
        if (level) params.append("level", level);
        if (method) params.append("method", method);

        return {
          url: `logs?${params.toString()}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Logs"],
    }),

    // Dobbantó program endpoints
    getDobbanto: build.query({
      query: ({ alapadatok_id, tanev } = {}) => {
        if (alapadatok_id && tanev) {
          return `dobbanto/${tanev}`;
        } else if (tanev) {
          return `dobbanto/${tanev}`;
        }
        // Default to current year if no tanev provided
        return `dobbanto/${new Date().getFullYear()}`;
      },
      providesTags: (result, error, params) => [
        { type: "Dobbanto", id: params?.alapadatok_id || "all" },
        "Dobbanto",
      ],
    }),
    addDobbanto: build.mutation({
      query: (data) => ({
        url: "dobbanto",
        method: "POST",
        body: {
          alapadatok_id: data.alapadatok_id,
          tanev_kezdete: data.tanev_kezdete,
          dobbanto_szama: data.dobbanto_szama,
          tanulok_osszesen: data.tanulok_osszesen,
        },
      }),
      invalidatesTags: (result, error, data) => [
        { type: "Dobbanto", id: data.alapadatok_id },
        "Dobbanto",
      ],
    }),
    updateDobbanto: build.mutation({
      query: ({ id, ...data }) => ({
        url: `dobbanto/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { alapadatok_id }) => [
        { type: "Dobbanto", id: alapadatok_id },
        "Dobbanto",
      ],
    }),
    deleteDobbanto: build.mutation({
      query: (id) => ({
        url: `dobbanto/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dobbanto"],
    }),

    // Szakirany and Szakma endpoints
    getSzakiranyList: build.query({
      query: () => "szakirany",
      providesTags: ["Szakirany"],
    }),
    getSzakmaList: build.query({
      query: () => "szakma",
      providesTags: ["Szakma"],
    }),

    // Remove szakirany from school (permanent deletion)
    removeSzakiranyFromSchool: build.mutation({
      query: ({ alapadatokId, szakiranyId }) => ({
        url: `alapadatok/removeSzakirany/${alapadatokId}/${szakiranyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Alapadatok", "Szakirany"],
    }),

    // Remove szakma from school (permanent deletion)
    removeSzakmaFromSchool: build.mutation({
      query: ({ alapadatokId, szakmaId }) => ({
        url: `alapadatok/removeSzakma/${alapadatokId}/${szakmaId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Alapadatok", "Szakma"],
    }),

    // User management endpoints
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetTanugyiAdatokQuery,
  useAddTanugyiAdatokMutation,
  useGetAlkalmazottAdatokQuery,
  useAddAlkalmazottAdatokMutation,
  useGetAlapadatokQuery,
  useGetAllAlapadatokQuery,
  useAddAlapadatokMutation,
  useUpdateAlapadatokMutation,
  useDeleteAlapadatokMutation,
  useGetKompetenciaQuery,
  useAddKompetenciaMutation,
  useGetTanuloLetszamQuery,
  useAddTanuloLetszamMutation,
  useUpdateTanuloLetszamMutation,
  useDeleteTanuloLetszamMutation,
  useGetUsersQuery,
  useGetFilteredUsersQuery,
  useGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangeUserPasswordMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetTableListQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  // Educational Indicators hooks
  useGetElhelyezkedesByYearQuery,
  useGetElhelyezkedesBySchoolAndYearQuery,
  useGetAllElhelyezkedesQuery,
  useAddElhelyezkedesMutation,
  useUpdateElhelyezkedesMutation,
  useDeleteElhelyezkedesMutation,
  useDeleteElhelyezkedesBySchoolAndYearMutation,
  useGetAllFelvettekSzamaQuery,
  useGetFelvettekSzamaByAlapadatokIdAndYearQuery,
  useAddFelvettekSzamaMutation,
  useUpdateFelvettekSzamaMutation,
  useDeleteFelvettekSzamaMutation,
  useGetSajatosNevelesuTanulokByYearQuery,
  useGetAllSajatosNevelesuTanulokQuery,
  useAddSajatosNevelesuTanulokMutation,
  useUpdateSajatosNevelesuTanulokMutation,
  useDeleteSajatosNevelesuTanulokMutation,
  useGetHHesHHHNevelesuTanulokByYearQuery,
  useGetAllHHesHHHNevelesuTanulokQuery,
  useAddHHesHHHNevelesuTanulokMutation,
  useUpdateHHesHHHNevelesuTanulokMutation,
  useDeleteHHesHHHNevelesuTanulokMutation,
  useGetVizsgaeredmenyekByYearQuery,
  useGetAllVizsgaeredmenyekQuery,
  useAddVizsgaeredmenyekMutation,
  useUpdateVizsgaeredmenyekMutation,
  useDeleteVizsgaeredmenyekMutation,
  useGetSzakmaiVizsgaEredmenyekByYearQuery,
  useGetAllSzakmaiVizsgaEredmenyekQuery,
  useAddSzakmaiVizsgaEredmenyekMutation,
  useUpdateSzakmaiVizsgaEredmenyekMutation,
  useDeleteSzakmaiVizsgaEredmenyekMutation,
  useGetMuhelyiskolaQuery,
  useAddMuhelyiskolaMutation,
  useUpdateMuhelyiskolaMutation,
  useDeleteMuhelyiskolaMutation,
  useGetNSZFHByYearQuery,
  useGetAllNSZFHQuery,
  useAddNSZFHMutation,
  useUpdateNSZFHMutation,
  useDeleteNSZFHMutation,
  useGetSZMSZByYearQuery,
  useGetAllSZMSZQuery,
  useAddSZMSZMutation,
  useUpdateSZMSZMutation,
  useDeleteSZMSZMutation,
  useGetAllEgyOktatoraJutoTanuloQuery,
  useGetEgyOktatoraJutoTanuloByAlapadatokQuery,
  useAddEgyOktatoraJutoTanuloMutation,
  useUpdateEgyOktatoraJutoTanuloMutation,
  useGetIntezmenyiNeveltsegByYearQuery,
  useGetAllIntezmenyiNeveltsegQuery,
  useAddIntezmenyiNeveltsegMutation,
  useUpdateIntezmenyiNeveltsegMutation,
  useDeleteIntezmenyiNeveltsegMutation,
  // Logs hooks
  useGetLogsQuery,
  useGetLogByIdQuery,
  useDeleteLogsMutation,
  // Dobbanto hooks
  useGetDobbantoQuery,
  useAddDobbantoMutation,
  useUpdateDobbantoMutation,
  useDeleteDobbantoMutation,
  // Szakirany and Szakma hooks
  useGetSzakiranyListQuery,
  useGetSzakmaListQuery,
  useRemoveSzakiranyFromSchoolMutation,
  useRemoveSzakmaFromSchoolMutation,
} = indicatorApi;

import { useMemo } from "react";
import { useGetOsztalyAdatszolgaltatasQuery } from "../store/api/apiSlice";
import {
  extractNappaliClasses,
  getOsztalyDataLocally,
  compareClasses,
  getRecordClassName,
} from "../utils/classUtils";

/**
 * Hook to retrieve dynamic classes for a school and school year.
 * Filters for daytime ("nappali") classes by default.
 *
 * @param {Object} options
 * @param {string} options.schoolId - ID of selected school (alapadatok_id)
 * @param {number|string} options.year - School year start (e.g. 2024 or "2024/2025")
 * @param {boolean} [options.daytimeOnly=true] - Whether to only return nappali classes
 * @param {Array<string>} [options.fallbackClasses=[]] - Fallback list if no classes uploaded yet
 * @param {Array<string>} [options.existingDbClasses=[]] - Additional classes found in existing records
 */
export function useSchoolClasses({
  schoolId,
  year,
  daytimeOnly = true,
  fallbackClasses = [],
  existingDbClasses = [],
}) {
  const numericYear =
    typeof year === "string" && year.includes("/")
      ? parseInt(year.split("/")[0], 10)
      : parseInt(year, 10) || new Date().getFullYear();

  const {
    data: apiData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOsztalyAdatszolgaltatasQuery(
    {
      alapadatok_id: schoolId,
      tanev_kezdete: numericYear,
    },
    { skip: !schoolId }
  );

  const localRecords = useMemo(() => {
    return getOsztalyDataLocally(schoolId, numericYear) || [];
  }, [schoolId, numericYear]);

  // Combine API data or local records
  const effectiveRecords = useMemo(() => {
    if (Array.isArray(apiData) && apiData.length > 0) {
      return apiData;
    }
    return localRecords;
  }, [apiData, localRecords]);

  const classes = useMemo(() => {
    let list = [];
    if (effectiveRecords.length > 0) {
      if (daytimeOnly) {
        list = extractNappaliClasses(effectiveRecords);
      } else {
        const set = new Set();
        effectiveRecords.forEach((r) => {
          const name = getRecordClassName(r);
          if (name) set.add(name);
        });
        list = Array.from(set).sort(compareClasses);
      }
    }

    // Include existing db classes so saved indicators don't lose rows
    if (Array.isArray(existingDbClasses) && existingDbClasses.length > 0) {
      const combined = new Set(list);
      existingDbClasses.forEach((cls) => {
        if (cls && typeof cls === "string" && cls.trim()) {
          combined.add(cls.trim());
        }
      });
      list = Array.from(combined).sort(compareClasses);
    }

    // If still empty, use fallback
    if (list.length === 0 && Array.isArray(fallbackClasses) && fallbackClasses.length > 0) {
      return [...fallbackClasses];
    }

    return list;
  }, [effectiveRecords, daytimeOnly, existingDbClasses, fallbackClasses]);

  return {
    classes,
    records: effectiveRecords,
    isLoading,
    isFetching,
    hasDynamicData: effectiveRecords.length > 0,
    refetch,
  };
}

export default useSchoolClasses;

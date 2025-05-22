import { useGetTanugyiAdatokQuery } from "../store/api/apiSlice";
import { Spinner } from "@chakra-ui/react";

export default function TanuloLatszam() {
  const {
    data: TanugyiData,
    error,
    isLoading,
  } = useGetTanugyiAdatokQuery({
    alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
    ev: 2024,
  });

  const getGroupedData = () => {
    if (!TanugyiData || !Array.isArray(TanugyiData)) {
      return { agazatData: [], years: [] };
    }

    const groupedByAgazat = {};
    const years = new Set();

    TanugyiData.forEach((item) => {
      const agazatType = item.uj_Szkt_agazat_tipusa || "Nincs megadva";
      const year = item.tanev_kezdete ? item.tanev_kezdete : "Nincs év";
      const jogviszonyType = item.tanulo_jogviszonya || "Nincs megadva";

      years.add(year);

      if (!groupedByAgazat[agazatType]) {
        groupedByAgazat[agazatType] = {
          name: agazatType,
          yearCounts: {},
        };
      }

      if (!groupedByAgazat[agazatType].yearCounts[year]) {
        groupedByAgazat[agazatType].yearCounts[year] = {
          "Tanulói jogviszony": 0,
          "Felnőttképzési jogviszony": 0,
          Egyéb: 0,
        };
      }

      if (jogviszonyType === "Tanulói jogviszony") {
        groupedByAgazat[agazatType].yearCounts[year]["Tanulói jogviszony"] += 1;
      } else if (jogviszonyType === "Felnőttképzési jogviszony") {
        groupedByAgazat[agazatType].yearCounts[year][
          "Felnőttképzési jogviszony"
        ] += 1;
      } else {
        groupedByAgazat[agazatType].yearCounts[year]["Egyéb"] += 1;
      }
    });

    return {
      agazatData: Object.values(groupedByAgazat),
      years: Array.from(years).sort(),
    };
  };

  return (
    <div>
      <div>Tanuló létszáma:</div>
      <div style={{ marginTop: "2rem" }}>
        <h2>Ágazatok jogviszony szerinti megoszlása évenként:</h2>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "90vh",
            }}
          >
            <Spinner size="xl" />
          </div>
        ) : error ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "90vh",
            }}
          >
            <h1 style={{ color: "red" }}>
              Hiba történt az adatok betöltésekor!
            </h1>
          </div>
        ) : (
          (() => {
            const { agazatData, years } = getGroupedData();
            return (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th
                      rowSpan="2"
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                        verticalAlign: "middle",
                      }}
                    >
                      Ágazat típusa
                    </th>
                    <th
                      colSpan={years.length}
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      Tanulói jogviszony
                    </th>
                    <th
                      colSpan={years.length}
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      Felnőttképzési jogviszony
                    </th>
                    <th
                      colSpan={years.length}
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      Összesen
                    </th>
                  </tr>
                  <tr>
                    {/* Year headers for Tanulói jogviszony */}
                    {years.map((year) => (
                      <th
                        key={`tanuloi-${year}`}
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {year}/{year + 1}
                      </th>
                    ))}

                    {/* Year headers for Felnőttképzési jogviszony */}
                    {years.map((year) => (
                      <th
                        key={`felnott-${year}`}
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {year}/{year + 1}
                      </th>
                    ))}

                    {/* Year headers for Összesen */}
                    {years.map((year) => (
                      <th
                        key={`felnott-${year}`}
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {year}/{year + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agazatData.map((item, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {item.name}
                      </td>

                      {/* Tanulói jogviszony columns */}
                      {years.map((year) => (
                        <td
                          key={`tanuloi-${year}-${index}`}
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {item.yearCounts[year]?.["Tanulói jogviszony"] || 0}
                        </td>
                      ))}

                      {/* Felnőttképzési jogviszony columns */}
                      {years.map((year) => (
                        <td
                          key={`felnott-${year}-${index}`}
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {item.yearCounts[year]?.[
                            "Felnőttképzési jogviszony"
                          ] || 0}
                        </td>
                      ))}

                      {/* Row total */}
                      {years.map((year) => (
                        <td
                          key={`total-tanuloi-${year}`}
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {item.yearCounts[year]?.["Tanulói jogviszony"] +
                            item.yearCounts[year]?.[
                              "Felnőttképzési jogviszony"
                            ] +
                            item.yearCounts[year]?.["Egyéb"] || 0}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Totals row */}
                  <tr
                    style={{ fontWeight: "bold", backgroundColor: "#f2f2f2" }}
                  >
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      Összesen
                    </td>

                    {/* Totals for Tanulói jogviszony */}
                    {years.map((year) => (
                      <td
                        key={`total-tanuloi-${year}`}
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {agazatData.reduce(
                          (sum, item) =>
                            sum +
                            (item.yearCounts[year]?.["Tanulói jogviszony"] ||
                              0),
                          0
                        )}
                      </td>
                    ))}

                    {/* Totals for Felnőttképzési jogviszony */}
                    {years.map((year) => (
                      <td
                        key={`total-felnott-${year}`}
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {agazatData.reduce(
                          (sum, item) =>
                            sum +
                            (item.yearCounts[year]?.[
                              "Felnőttképzési jogviszony"
                            ] || 0),
                          0
                        )}
                      </td>
                    ))}

                    {/* Grand total */}
                    {years.map((year) => (
                      <td
                        key={`total-tanuloi-${year}`}
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {agazatData.reduce(
                          (sum, item) =>
                            sum +
                            (item.yearCounts[year]?.["Tanulói jogviszony"] ||
                              0) +
                            (item.yearCounts[year]?.[
                              "Felnőttképzési jogviszony"
                            ] || 0) +
                            (item.yearCounts[year]?.["Egyéb"] || 0),
                          0
                        ) || 0}
                      </td>
                    ))}
                  </tr>
                  {/* DataChanges based on previous years */}
                  {/* (current year count / previous year count) * 100, do it in every column*/}
                  <tr>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      Adatváltozás
                    </td>

                    {/* Data changes for Tanulói jogviszony */}
                    {years.map((year, index) => {
                      if (index === 0) return <td></td>; // Skip the first year
                      const currentYearCount =
                        agazatData.reduce(
                          (sum, item) =>
                            sum +
                            (item.yearCounts[year]?.["Tanulói jogviszony"] ||
                              0),
                          0
                        ) || 0;
                      const previousYearCount =
                        agazatData.reduce(
                          (sum, item) =>
                            sum +
                            (item.yearCounts[years[index - 1]]?.[
                              "Tanulói jogviszony"
                            ] || 0),
                          0
                        ) || 0;

                      const change =
                        previousYearCount > 0
                          ? (currentYearCount / previousYearCount) * 100
                          : 0;

                      return (
                        <td
                          key={`data-change-tanuloi-${year}`}
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {change.toFixed(2)}%
                        </td>
                      );
                    })}

                    {/* Data changes for Felnőttképzési jogviszony */}
                    {years.map((year, index) => {
                      if (index === 0) return <td></td>; // Skip the first year
                      const currentYearCount =
                        agazatData.reduce(
                          (sum, item) =>
                            sum +
                            (item.yearCounts[year]?.[
                              "Felnőttképzési jogviszony"
                            ] || 0),
                          0
                        ) || 0;
                      const previousYearCount =
                        agazatData.reduce(
                          (sum, item) =>
                            sum +
                            (item.yearCounts[years[index - 1]]?.[
                              "Felnőttképzési jogviszony"
                            ] || 0),
                          0
                        ) || 0;

                      const change =
                        previousYearCount > 0
                          ? (currentYearCount / previousYearCount) * 100
                          : 0;
                      return (
                        <td
                          key={`data-change-felnott-${year}`}
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {change.toFixed(2)}%
                        </td>
                      );
                    })}

                    {/* Data changes for Összesen */}
                    {years.map((year, index) => {
                      if (index === 0) return <td></td>; // Skip the first year
                      const currentYearCount =
                        agazatData.reduce(
                          (sum, item) =>
                            sum +
                            (item.yearCounts[year]?.["Tanulói jogviszony"] ||
                              0) +
                            (item.yearCounts[year]?.[
                              "Felnőttképzési jogviszony"
                            ] || 0) +
                            (item.yearCounts[year]?.["Egyéb"] || 0),
                          0
                        ) || 0;
                      const previousYearCount =
                        agazatData.reduce(
                          (sum, item) =>
                            sum +
                            (item.yearCounts[years[index - 1]]?.[
                              "Tanulói jogviszony"
                            ] || 0) +
                            (item.yearCounts[years[index - 1]]?.[
                              "Felnőttképzési jogviszony"
                            ] || 0) +
                            (item.yearCounts[years[index - 1]]?.["Egyéb"] || 0),
                          0
                        ) || 0;

                      const change =
                        previousYearCount > 0
                          ? (currentYearCount / previousYearCount) * 100
                          : 0;

                      return (
                        <td
                          key={`data-change-osszesen-${year}`}
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {change.toFixed(2)}%
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            );
          })()
        )}
      </div>
    </div>
  );
}

import { useDispatch, useSelector } from "react-redux";
import {
  clearAllCache,
  invalidateSpecificTags,
  getCacheStatus,
} from "../utils/cacheUtils";

const CacheDebugPanel = () => {
  const dispatch = useDispatch();
  // Only get the API state instead of the entire state
  const apiState = useSelector((state) => state.api);

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleClearAllCache = () => {
    clearAllCache(dispatch);
    console.log("All cache cleared");
  };

  const handleInvalidateUsers = () => {
    invalidateSpecificTags(dispatch, ["User"]);
    console.log("User cache invalidated");
  };

  const handleInvalidateData = () => {
    invalidateSpecificTags(dispatch, [
      "TanugyiAdatok",
      "Alapadatok",
      "Kompetencia",
      "TanuloLetszam",
    ]);
    console.log("Data cache invalidated");
  };

  const handleShowCacheStatus = () => {
    const cacheStatus = getCacheStatus(() => state);
    console.log("Cache Status:", cacheStatus);
  };

  return (
    <div>
      <h4 style={{ margin: "0 0 10px 0", color: "#666" }}>
        🔧 Dev Cache Utils
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <button
          onClick={handleClearAllCache}
          style={{
            padding: "5px",
            fontSize: "11px",
            background: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Clear All Cache
        </button>
        <button
          onClick={handleInvalidateUsers}
          style={{
            padding: "5px",
            fontSize: "11px",
            background: "#4444ff",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Invalidate Users
        </button>
        <button
          onClick={handleInvalidateData}
          style={{
            padding: "5px",
            fontSize: "11px",
            background: "#44aa44",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Invalidate Data
        </button>
        <button
          onClick={handleShowCacheStatus}
          style={{
            padding: "5px",
            fontSize: "11px",
            background: "#aa44aa",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Log Cache Status
        </button>
      </div>
    </div>
  );
};

export default CacheDebugPanel;

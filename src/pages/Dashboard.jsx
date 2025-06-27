import { useSelector } from "react-redux";
import TokenDebugPanel from "../components/TokenDebugPanel";
import { selectUserPermissions } from "../store/slices/authSlice";
import CacheDebugPanel from "../components/CacheDebugPanel";

export default function Dashboard() {
  const userPermissions = useSelector(selectUserPermissions);
  const isSuperadmin = userPermissions?.isSuperadmin || false;

  return (
    <div>
      <h1>Kezdőlap</h1>
      <p>Üdvözöllek az oldalon</p>

      {/* Debug panel for token refresh testing */}
      {isSuperadmin && (
        <div style={{ marginBottom: "20px" }}>
          <TokenDebugPanel />
          <CacheDebugPanel />
        </div>
      )}
    </div>
  );
}

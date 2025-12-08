import { createContext, useContext, useState, useCallback } from 'react';
import NotificationSnackbar from '../components/shared/NotificationSnackbar';

const AccessNotificationContext = createContext();

export const useAccessNotification = () => {
  const context = useContext(AccessNotificationContext);
  if (!context) {
    throw new Error('useAccessNotification must be used within AccessNotificationProvider');
  }
  return context;
};

export const AccessNotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'warning'
  });

  const showNotification = useCallback((message, severity = 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const notifyAccessDenied = useCallback((route, tableName, action = 'read') => {
    // Special case for no access
    if (tableName === "no_access") {
      const message = `🚫 Hozzáférés megtagadva: Nincs jogosultsága az oldal megtekintéséhez!`;
      showNotification(message, 'error');
      return;
    }

    const routeNames = {
      '/tanulo_letszam': 'Tanulólétszám',
      '/kompetencia': 'Kompetenciamérés',
      '/versenyek': 'Versenyek',
      '/users': 'Felhasználókezelés',
      '/table-management': 'Táblakezelés',
      '/logs': 'Naplók',
      '/alapadatok': 'Alapadatok',
      '/felnottkepzes': 'Felnőttképzés',
      '/orszagos-kompetenciameres': 'Országos kompetenciamérés',
      '/nszfh-meresek': 'NSZFH mérések',
      '/versenyek': 'Szakmai eredmények',
      '/elhelyezkedesi-mutato': 'Elhelyezkedési mutató',
      '/vegzettek-elegedettsege': 'Végzettek elégedettsége',
      '/vizsgaeredmenyek': 'Vizsgaeredmények',
      '/intezmenyi-elismeresek': 'Intézményi elismerések',
      '/szakmai-bemutatok-konferenciak': 'Szakmai bemutatók és konferenciák',
      '/elegedettseg-meres-eredmenyei': 'Elégedettségmérés eredményei',
      '/muhelyiskolai-reszszakmat': 'Műhelyiskolai részszakma',
      '/dobbanto-program-aranya': 'Dobbantó program aránya',
      '/sajatos-nevelesi-igenyu-tanulok-aranya': 'Sajátos nevelési igényű tanulók aránya',
      '/hatranyos-helyezu-tanulok-aranya': 'Hátrányos helyzetű tanulók aránya',
      '/intezmenyi-nevelesi-mutatok': 'Intézményi nevelési mutatók',
      '/szakkepzesi-munkaszerződes-arany': 'Szakképzési munkaszerződés arány',
      '/oktatok-egyeb-tev': 'Oktatók egyéb tevékenysége',
      '/adat-import': 'Adatok importálása',
      '/schools': 'Iskolák'
    };

    const pageName = routeNames[route] || 'Az oldal';
    const message = `🚫 Hozzáférés megtagadva: "${pageName}" megtekintéséhez nincs jogosultsága!`;
    
    showNotification(message, 'error');
  }, [showNotification]);

  const notifyInsufficientPermissions = useCallback((route, requiredRole) => {
    const roleNames = {
      'admin': 'adminisztrátori',
      'superadmin': 'szuperadminisztrátori', 
      'hszc': 'HSZC szintű',
      'admin_or_data_access': 'adminisztrátori vagy adattábla hozzáférési'
    };

    const roleName = roleNames[requiredRole] || requiredRole;
    const message = `⚠️ ${roleName} jogosultság szükséges az oldal eléréséhez!`;
    
    showNotification(message, 'warning');
  }, [showNotification]);

  const value = {
    showNotification,
    hideNotification,
    notifyAccessDenied,
    notifyInsufficientPermissions
  };

  return (
    <AccessNotificationContext.Provider value={value}>
      {children}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </AccessNotificationContext.Provider>
  );
};

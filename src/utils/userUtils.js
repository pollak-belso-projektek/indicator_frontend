export const generateRandomUser = () => {
    return {
        id: crypto.randomUUID(),
        email: `${Math.random().toString(36).substring(2, 15)}@example.com`,
        name: `User ${Math.floor(Math.random() * 1000)}`,
        password: "hashed_password",
        permissions: Math.floor(Math.random() * 32),
        createdAt: new Date().toISOString(),
        updatedAt: null,
        alapadatokId: null,
        tableAccess: [
            {
                id: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                tableName: 'tanulo_letszam',
                access: Math.floor(Math.random() * 16),
                createdAt: new Date().toISOString(),
                updatedAt: null,
                permissionsDetails: {
                    canDelete: Math.random() > 0.5,
                    canUpdate: Math.random() > 0.5,
                    canCreate: Math.random() > 0.5,
                    canRead: true
                }
            }
        ],
        alapadatok: null,
        permissionsDetails: {
            isSuperadmin: Math.random() > 0.9 ? true : false,
            isHSZC: Math.random() > 0.8 ? true : false,
            isAdmin: Math.random() > 0.7 ? true : false,
            isPrivileged: Math.random() > 0.6 ? true : false,
            isStandard: true
        }
    };
};

export const fetchUsersData = async (count = 100) => {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Generate random users
    return Array.from({ length: count }, () => generateRandomUser());
};

import { useState, useEffect, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
} from '@tanstack/react-table';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { fetchUsersData } from '../utils/userUtils';
import { createUserColumns } from '../components/UserTable';

export const useUserManagement = () => {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [openModify, setOpenModify] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [hiddenColumns, setHiddenColumns] = useState([
        localStorage.getItem('hiddenColumns') || 'tableAccess', 
        'permissionsDetails', 
        'alapadatokId'
    ]);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const loadData = async () => {
            const users = await fetchUsersData(100);
            setData(users);
        };
        loadData();
    }, []);

    useEffect(() => {
        localStorage.setItem('hiddenColumns', hiddenColumns.join(','));
    }, [hiddenColumns]);

    useEffect(() => {
        const storedHiddenColumns = localStorage.getItem('hiddenColumns');
        if (storedHiddenColumns) {
            setHiddenColumns(storedHiddenColumns.split(','));
        }
    }, []);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setOpenModify(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setOpen(true);
    };

    const handleModify = (modifiedUser) => {
        console.log(`Modifying user: ${modifiedUser.name}`);
        setData(prevData => prevData.map(user => 
            user.id === modifiedUser.id ? modifiedUser : user
        ));
        setOpenModify(false);
    };

    const handleDeleteConfirm = () => {
        console.log(`Deleting user: ${selectedUser.name}`);
        setData(prevData => prevData.filter(user => user.id !== selectedUser.id));
        setOpen(false);
    };

    const columns = useMemo(() => createUserColumns(handleEdit, handleDelete), []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: 'includesString',
        state: {
            globalFilter,
            columnVisibility
        },
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return {
        data,
        table,
        globalFilter,
        setGlobalFilter,
        openModify,
        setOpenModify,
        open,
        setOpen,
        selectedUser,
        setSelectedUser,
        fullScreen,
        hiddenColumns,
        setHiddenColumns,
        handleModify,
        handleDeleteConfirm,
        handleClose: () => setOpen(false),
    };
};

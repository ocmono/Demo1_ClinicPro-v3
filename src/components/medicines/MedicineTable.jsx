import React, { useMemo, useState } from 'react';
import Table from '@/components/shared/table/Table';
import Dropdown from '@/components/shared/Dropdown';
import {
  FiEdit3, FiTrash2, FiMoreHorizontal
} from 'react-icons/fi';
import { useMedicines } from '../../context/MedicinesContext';
import { useAuth } from '../../contentApi/AuthContext';

const MedicineTable = () => {
  const { medicines, editMedicine, deleteMedicine } = useMedicines();
  const { user } = useAuth();

  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const canManageRoles = ["super_admin", "clinic_admin", "doctor", "receptionist", "pharmacist"];
  const canManage = user && canManageRoles.includes(user.role);

  const tableData = useMemo(() => {
    if (!Array.isArray(medicines)) return [];
    return medicines.map((med, index) => ({
      id: index + 1,
      name: med.name,
      brand: med.brand,
      variations: Array.isArray(med.variations) && med.variations.length > 0
        ? med.variations.map(v =>
            `${v.sku || ''} (${v.quantity || ''}${v.unit ? ' ' + v.unit : ''}) - ₹${v.price || 0}`
          ).join(', ')
        : "No variations",
      actions: { index, med },
    }));
  }, [medicines]);

  const columns = [
    {
      accessorKey: 'id',
      header: '#',
      cell: info => info.getValue(),
      meta: { headerClassName: 'width-30' }
    },
    {
      accessorKey: 'name',
      header: 'Medicine Name',
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
    },
    {
      accessorKey: 'variations',
      header: 'Variations',
      cell: info => {
        const variations = info.getValue()?.split(',') || [];
        return (
          <ul style={{ paddingLeft: '1rem', margin: 0 }}>
            {variations.map((v, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem', listStyle: 'disc', fontSize: '13px' }}>
                {v.trim()}
              </li>
            ))}
          </ul>
        );
      }
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const { index } = row.original.actions;

        if (!canManage) return <span>—</span>;

        const actions = [
          { label: "Edit", icon: <FiEdit3 /> },
          { label: "Delete", icon: <FiTrash2 /> },
        ];

        return (
          <Dropdown
            dropdownItems={actions}
            triggerIcon={<FiMoreHorizontal />}
            triggerClass="avatar-md"
            onClick={(label) => {
              if (label === "Edit") {
                setEditIndex(index);
                setEditForm({ ...medicines[index] });
              } else if (label === "Delete") {
                deleteMedicine(index);
              }
            }}
          />
        );
      },
      meta: { headerClassName: 'text-end' }
    }
  ];

  return (
    <Table data={tableData} columns={columns} />
  );
};

export default MedicineTable;

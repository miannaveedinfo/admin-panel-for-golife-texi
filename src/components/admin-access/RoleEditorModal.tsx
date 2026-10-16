import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { PermissionModule, PermissionLevel, SensitivePermission } from '../../types';
import {
  ALL_PERMISSION_MODULES,
  ALL_PERMISSION_LEVELS,
  ALL_SENSITIVE_PERMISSIONS
} from '../../services/adminAccessService';
import { Shield, Plus, Check, X, AlertTriangle } from 'lucide-react';

interface RoleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleEditorModal: React.FC<RoleEditorModalProps> = ({ isOpen, onClose }) => {
  const { createCustomRole, showToast } = useAdmin();

  const [roleName, setRoleName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [roleDesc, setRoleDesc] = useState('');

  // Initial modules config: empty
  const [selectedModules, setSelectedModules] = useState<Record<PermissionModule, PermissionLevel[]>>(
    {} as any
  );
  const [selectedSensitive, setSelectedSensitive] = useState<SensitivePermission[]>([]);

  if (!isOpen) return null;

  const handleNameChange = (name: string) => {
    setRoleName(name);
    if (!roleCode || roleCode.startsWith('custom_')) {
      const generated = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
      setRoleCode(generated);
    }
  };

  const toggleLevel = (modId: PermissionModule, lvlId: PermissionLevel) => {
    const current = selectedModules[modId] || [];
    let updated: PermissionLevel[];
    if (current.includes(lvlId)) {
      updated = current.filter((l) => l !== lvlId);
    } else {
      updated = [...current, lvlId];
    }
    setSelectedModules({
      ...selectedModules,
      [modId]: updated
    });
  };

  const toggleSensitive = (permId: SensitivePermission) => {
    if (selectedSensitive.includes(permId)) {
      setSelectedSensitive(selectedSensitive.filter((p) => p !== permId));
    } else {
      setSelectedSensitive([...selectedSensitive, permId]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast('Please specify a role name', 'error');
      return;
    }

    createCustomRole({
      name: roleName.trim(),
      code: roleCode.trim().toLowerCase() || `custom_${Date.now()}`,
      description: roleDesc.trim() || 'Custom operational role with tailored permissions',
      modules: selectedModules,
      sensitivePermissions: selectedSensitive
    });

    showToast(`Created custom role "${roleName}"`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">Create New Custom Role</h3>
              <p className="text-[11px] text-slate-500">
                Define specialized module access, review rights, and financial permissions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Fleet Supervisor"
                  value={roleName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">System Identifier Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. regional_fleet_supervisor"
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Description</label>
                <input
                  type="text"
                  placeholder="Brief summary of duties..."
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Sensitive Permissions checklist */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Sensitive Financial & Administrative Privileges
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {selectedSensitive.length} selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {ALL_SENSITIVE_PERMISSIONS.map((sp) => {
                  const isGranted = selectedSensitive.includes(sp.id);
                  return (
                    <div
                      key={sp.id}
                      onClick={() => toggleSensitive(sp.id)}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition select-none flex items-center justify-between ${
                        isGranted
                          ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="text-[11px] truncate">{sp.label}</span>
                      {isGranted && <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Module matrix */}
            <div className="space-y-2">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Module Permission Levels
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Module</th>
                      {ALL_PERMISSION_LEVELS.map((lvl) => (
                        <th key={lvl.id} className="py-2.5 px-2 text-center">
                          {lvl.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {ALL_PERMISSION_MODULES.map((mod) => {
                      const granted = selectedModules[mod.id] || [];
                      return (
                        <tr key={mod.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {mod.label}
                            <span className="block text-[9px] text-slate-400 font-normal">
                              {mod.category}
                            </span>
                          </td>
                          {ALL_PERMISSION_LEVELS.map((lvl) => {
                            const hasLvl = granted.includes(lvl.id);
                            return (
                              <td key={lvl.id} className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleLevel(mod.id, lvl.id)}
                                  className={`w-5 h-5 rounded inline-flex items-center justify-center transition cursor-pointer ${
                                    hasLvl
                                      ? 'bg-amber-400 text-slate-950 font-black'
                                      : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                  }`}
                                >
                                  {hasLvl && <Check className="w-3 h-3" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/70 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs cursor-pointer"
            >
              Create Role Definition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

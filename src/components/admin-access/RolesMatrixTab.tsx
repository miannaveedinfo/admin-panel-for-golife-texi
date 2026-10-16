import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  AdminRoleDefinition,
  PermissionModule,
  PermissionLevel,
  SensitivePermission
} from '../../types';
import {
  ALL_PERMISSION_MODULES,
  ALL_PERMISSION_LEVELS,
  ALL_SENSITIVE_PERMISSIONS
} from '../../services/adminAccessService';
import {
  ShieldCheck,
  Shield,
  KeyRound,
  Plus,
  Check,
  X,
  AlertTriangle,
  Info,
  Copy,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface RolesMatrixTabProps {
  onOpenCreateRoleModal: () => void;
}

export const RolesMatrixTab: React.FC<RolesMatrixTabProps> = ({ onOpenCreateRoleModal }) => {
  const {
    adminRoles,
    adminUsers,
    currentAdmin,
    updateAdminRole,
    deleteCustomRole,
    createCustomRole,
    showToast
  } = useAdmin();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    adminRoles[0]?.id || 'role-super-admin'
  );
  const [moduleSearch, setModuleSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);

  const selectedRole = adminRoles.find((r) => r.id === selectedRoleId) || adminRoles[0];

  // Local state for editing role permissions
  const [editedModules, setEditedModules] = useState<Record<PermissionModule, PermissionLevel[]>>(
    selectedRole ? { ...selectedRole.modules } : ({} as any)
  );
  const [editedSensitive, setEditedSensitive] = useState<SensitivePermission[]>(
    selectedRole ? [...selectedRole.sensitivePermissions] : []
  );

  // Sync local edits when selected role changes
  React.useEffect(() => {
    if (selectedRole) {
      setEditedModules({ ...selectedRole.modules });
      setEditedSensitive([...selectedRole.sensitivePermissions]);
      setIsEditingPermissions(false);
    }
  }, [selectedRoleId]);

  const categories = Array.from(
    new Set(ALL_PERMISSION_MODULES.map((m) => m.category))
  );

  const filteredModules = ALL_PERMISSION_MODULES.filter((mod) => {
    const matchesQuery =
      mod.label.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      mod.id.toLowerCase().includes(moduleSearch.toLowerCase());
    const matchesCat = selectedCategory === 'all' || mod.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  const toggleLevel = (module: PermissionModule, level: PermissionLevel) => {
    if (!isEditingPermissions) return;
    if (selectedRole?.isSystemDefault) {
      showToast('System default roles are protected. Duplicate this role to create a customized version.', 'warning');
      return;
    }

    const currentLevels = editedModules[module] || [];
    let updated: PermissionLevel[];
    if (currentLevels.includes(level)) {
      updated = currentLevels.filter((l) => l !== level);
    } else {
      updated = [...currentLevels, level];
    }

    setEditedModules({
      ...editedModules,
      [module]: updated
    });
  };

  const toggleAllLevelsForModule = (module: PermissionModule) => {
    if (!isEditingPermissions) return;
    if (selectedRole?.isSystemDefault) return;

    const currentLevels = editedModules[module] || [];
    const allLevelIds = ALL_PERMISSION_LEVELS.map((l) => l.id);

    if (currentLevels.length === allLevelIds.length) {
      setEditedModules({
        ...editedModules,
        [module]: []
      });
    } else {
      setEditedModules({
        ...editedModules,
        [module]: allLevelIds
      });
    }
  };

  const toggleSensitivePermission = (permId: SensitivePermission) => {
    if (!isEditingPermissions) return;
    if (selectedRole?.isSystemDefault) {
      showToast('System default roles are protected. Duplicate this role to customize.', 'warning');
      return;
    }

    if (editedSensitive.includes(permId)) {
      setEditedSensitive(editedSensitive.filter((p) => p !== permId));
    } else {
      setEditedSensitive([...editedSensitive, permId]);
    }
  };

  const handleSavePermissions = () => {
    if (!selectedRole || selectedRole.isSystemDefault) return;

    updateAdminRole(selectedRole.id, {
      modules: editedModules,
      sensitivePermissions: editedSensitive
    });
    setIsEditingPermissions(false);
    showToast(`Permissions updated for ${selectedRole.name}`, 'success');
  };

  const handleDuplicateRole = () => {
    if (!selectedRole) return;

    const newCode = `${selectedRole.code}_copy_${Date.now().toString().slice(-4)}`;
    createCustomRole({
      name: `${selectedRole.name} (Custom)`,
      code: newCode,
      description: `Customized replica of ${selectedRole.name}`,
      modules: { ...selectedRole.modules },
      sensitivePermissions: [...selectedRole.sensitivePermissions]
    });
    showToast(`Created custom replica of ${selectedRole.name}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Roles Selector & Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Role List Sidebar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Platform Roles ({adminRoles.length})
            </span>
            <button
              onClick={onOpenCreateRoleModal}
              className="p-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer"
              title="Create Custom Role"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {adminRoles.map((role) => {
              const isSelected = role.id === selectedRoleId;
              const assignedCount = adminUsers.filter((u) => u.role === role.code).length;

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <Shield
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-slate-950' : 'text-slate-400'
                      }`}
                    />
                    <div className="truncate">
                      <div className="truncate">{role.name}</div>
                      <div
                        className={`text-[10px] font-medium truncate ${
                          isSelected ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {role.isSystemDefault ? 'System Role' : 'Custom Role'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0 ${
                      isSelected
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {assignedCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Role Overview & Metadata */}
        <div className="md:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">{selectedRole?.name}</h3>
                {selectedRole?.isSystemDefault ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                    System Protected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                    Custom Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">{selectedRole?.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDuplicateRole}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                title="Duplicate this role to customize"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                Duplicate
              </button>

              {!selectedRole?.isSystemDefault && (
                <>
                  {isEditingPermissions ? (
                    <button
                      onClick={handleSavePermissions}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingPermissions(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Permissions
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete custom role "${selectedRole.name}"?`)) {
                        deleteCustomRole(selectedRole.id);
                      }
                    }}
                    className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Custom Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Sensitive Permissions Highlight */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Sensitive Financial & High-Risk Privileges</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {editedSensitive.length} of {ALL_SENSITIVE_PERMISSIONS.length} granted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ALL_SENSITIVE_PERMISSIONS.map((sp) => {
                const isGranted = editedSensitive.includes(sp.id);
                return (
                  <div
                    key={sp.id}
                    onClick={() => toggleSensitivePermission(sp.id)}
                    className={`p-2 rounded-lg border text-left transition flex items-start gap-2 select-none ${
                      isGranted
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-400 opacity-60'
                    } ${isEditingPermissions && !selectedRole?.isSystemDefault ? 'cursor-pointer hover:border-amber-400' : ''}`}
                  >
                    <div className="mt-0.5">
                      {isGranted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold leading-tight flex items-center gap-1">
                        {sp.label}
                        {sp.dangerLevel === 'critical' && (
                          <span className="px-1 rounded text-[8px] bg-rose-100 text-rose-700 font-black">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                        {sp.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Module Matrix Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search modules (e.g. drivers, tariffs, safety)..."
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Showing {filteredModules.length} of {ALL_PERMISSION_MODULES.length} platform modules
          </div>
        </div>

        {/* Full Interactive Permission Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                <th className="py-2.5 px-3 min-w-[200px]">Module & Category</th>
                {ALL_PERMISSION_LEVELS.map((lvl) => (
                  <th key={lvl.id} className="py-2.5 px-2 text-center" title={lvl.desc}>
                    {lvl.label}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredModules.map((mod) => {
                const grantedLevels = editedModules[mod.id] || [];
                const isFull = grantedLevels.length === ALL_PERMISSION_LEVELS.length;

                return (
                  <tr key={mod.id} className="hover:bg-slate-50/60 transition">
                    {/* Module info */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{mod.label}</div>
                          <span className="text-[10px] text-slate-400 font-medium">{mod.category}</span>
                        </div>
                        {isEditingPermissions && !selectedRole?.isSystemDefault && (
                          <button
                            type="button"
                            onClick={() => toggleAllLevelsForModule(mod.id)}
                            className="text-[10px] font-bold text-amber-700 hover:text-amber-900 underline ml-2 cursor-pointer"
                          >
                            {isFull ? 'Clear' : 'All'}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Permission level checkboxes */}
                    {ALL_PERMISSION_LEVELS.map((lvl) => {
                      const hasLevel = grantedLevels.includes(lvl.id);
                      return (
                        <td key={lvl.id} className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            disabled={!isEditingPermissions || selectedRole?.isSystemDefault}
                            onClick={() => toggleLevel(mod.id, lvl.id)}
                            className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition ${
                              hasLevel
                                ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                                : 'bg-slate-100 text-slate-300'
                            } ${
                              isEditingPermissions && !selectedRole?.isSystemDefault
                                ? 'cursor-pointer hover:scale-110'
                                : 'cursor-default'
                            }`}
                            title={`${mod.label}: ${lvl.label} (${hasLevel ? 'Granted' : 'Denied'})`}
                          >
                            {hasLevel && <Check className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}

                    {/* Coverage badge */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-black ${
                          grantedLevels.length === 0
                            ? 'bg-slate-100 text-slate-400'
                            : isFull
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {grantedLevels.length}/{ALL_PERMISSION_LEVELS.length}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

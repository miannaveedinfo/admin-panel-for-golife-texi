import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminUser, PermissionModule, PermissionLevel, SensitivePermission } from '../../types';
import {
  ALL_PERMISSION_MODULES,
  ALL_PERMISSION_LEVELS,
  ALL_SENSITIVE_PERMISSIONS
} from '../../services/adminAccessService';
import { KeyRound, Shield, Check, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AdminPermissionsModalProps {
  admin: AdminUser | null;
  onClose: () => void;
}

export const AdminPermissionsModal: React.FC<AdminPermissionsModalProps> = ({ admin, onClose }) => {
  const { adminRoles, updateAdminPermissions, showToast } = useAdmin();

  const roleDef = adminRoles.find((r) => r.code === admin?.role) || adminRoles[0];

  const [customModules, setCustomModules] = useState<Record<PermissionModule, PermissionLevel[]>>(() => {
    return admin?.customPermissions?.modules || roleDef?.modules || ({} as any);
  });

  const [customSensitive, setCustomSensitive] = useState<SensitivePermission[]>(() => {
    return admin?.customPermissions?.sensitivePermissions || roleDef?.sensitivePermissions || [];
  });

  if (!admin) return null;

  const toggleLevel = (modId: PermissionModule, lvlId: PermissionLevel) => {
    const current = customModules[modId] || [];
    let updated: PermissionLevel[];
    if (current.includes(lvlId)) {
      updated = current.filter((l) => l !== lvlId);
    } else {
      updated = [...current, lvlId];
    }
    setCustomModules({
      ...customModules,
      [modId]: updated
    });
  };

  const toggleSensitive = (permId: SensitivePermission) => {
    if (customSensitive.includes(permId)) {
      setCustomSensitive(customSensitive.filter((p) => p !== permId));
    } else {
      setCustomSensitive([...customSensitive, permId]);
    }
  };

  const handleSave = () => {
    updateAdminPermissions(admin.id, {
      modules: customModules,
      sensitivePermissions: customSensitive
    });
    showToast(`Updated custom permissions for ${admin.name}`, 'success');
    onClose();
  };

  const handleResetToRoleDefault = () => {
    setCustomModules(roleDef.modules);
    setCustomSensitive(roleDef.sensitivePermissions);
    showToast(`Reset permissions to ${roleDef.name} defaults`, 'info');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                Granular Permissions Override: {admin.name}
              </h3>
              <p className="text-[11px] text-slate-500">
                Base Role: <strong className="text-slate-800">{roleDef.name}</strong> ({admin.email})
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

        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Sensitive Permissions Section */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Sensitive Financial & Administrative Privileges</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                {customSensitive.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {ALL_SENSITIVE_PERMISSIONS.map((sp) => {
                const isGranted = customSensitive.includes(sp.id);
                return (
                  <div
                    key={sp.id}
                    onClick={() => toggleSensitive(sp.id)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition select-none flex items-start gap-2 ${
                      isGranted
                        ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-400 opacity-70'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isGranted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] leading-tight flex items-center gap-1">
                        {sp.label}
                        {sp.dangerLevel === 'critical' && (
                          <span className="px-1 rounded text-[8px] bg-rose-100 text-rose-800 font-black">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-500 font-normal leading-tight mt-0.5 truncate">
                        {sp.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Permissions Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Module Permission Levels
              </h4>
              <button
                type="button"
                onClick={handleResetToRoleDefault}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
              >
                Reset to {roleDef.name} Defaults
              </button>
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
                    const granted = customModules[mod.id] || [];
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
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs cursor-pointer"
          >
            Apply Permissions Override
          </button>
        </div>
      </div>
    </div>
  );
};

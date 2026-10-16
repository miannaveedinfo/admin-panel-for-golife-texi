import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  SystemSettingsCenterTab,
  SystemControlSettings,
  FeatureControl,
  BusinessRulesConfig,
  SensitiveApprovalRule,
  ConfigurationOverride,
  RuleVersionRecord,
  AiSettingRecommendation
} from '../../types';
import {
  DEFAULT_SYSTEM_SETTINGS,
  INITIAL_FEATURE_CONTROLS,
  DEFAULT_BUSINESS_RULES,
  INITIAL_SENSITIVE_APPROVAL_RULES,
  INITIAL_CONFIGURATION_OVERRIDES,
  INITIAL_RULE_VERSIONS,
  INITIAL_SETTINGS_AI_RECOMMENDATIONS,
  detectConfigurationConflicts,
  recordRuleVersion
} from '../../services/systemSettingsService';
import { SystemControlSection } from './SystemControlSection';
import { FeatureControlsSection } from './FeatureControlsSection';
import { BusinessRulesSection } from './BusinessRulesSection';
import { ApprovalRulesSection } from './ApprovalRulesSection';
import { OverridesSection } from './OverridesSection';
import { RuleVersionsSection } from './RuleVersionsSection';
import { ConflictsAndAiSection } from './ConflictsAndAiSection';
import { BackToDashboardButton } from '../common/BackToDashboardButton';
import { CompanyPaymentAccountsTab } from '../payment/CompanyPaymentAccountsTab';
import { CompanyPaymentAccount } from '../../types/paymentArchitecture';
import { INITIAL_COMPANY_PAYMENT_ACCOUNTS } from '../../services/centralPaymentService';
import { isProductionDataSource } from '../../config/dataSourceMode';
import { firebaseRepository } from '../../services/backend/FirebaseRepository';
import {
  Sliders,
  Power,
  ToggleRight,
  BookOpen,
  ShieldCheck,
  GitFork,
  History,
  Sparkles,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Layers,
  Building2
} from 'lucide-react';

export const SystemBusinessRulesCenter: React.FC = () => {
  const {
    currentAdmin,
    hasPermission,
    logAction,
    showToast,
    resetAllData,
    updateSettings,
    availableCities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']
  } = useAdmin();

  // Defensive fallback for logAction
  const safeLogAction = (action: string, entity: string, reason: string, details?: any) => {
    if (typeof logAction === 'function') {
      try {
        logAction(action, entity, reason, details);
      } catch (err) {
        console.warn('Could not log audit action:', err);
      }
    }
  };

  // Active main tab
  const [activeTab, setActiveTab] = useState<SystemSettingsCenterTab>('system');
  const [globalSearch, setGlobalSearch] = useState('');
  const [targetRuleOverrideFilter, setTargetRuleOverrideFilter] = useState<string | undefined>(undefined);

  // Global State Stores with Demo-only LocalStorage Persistence & Production Firestore Sync
  const [systemControl, setSystemControl] = useState<SystemControlSettings>(() => {
    if (isProductionDataSource()) return DEFAULT_SYSTEM_SETTINGS;
    try {
      const saved = localStorage.getItem('GOLIFE_SETTINGS_SYSTEM_CONTROL');
      return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_SETTINGS;
    } catch {
      return DEFAULT_SYSTEM_SETTINGS;
    }
  });

  const [features, setFeatures] = useState<FeatureControl[]>(() => {
    if (isProductionDataSource()) return INITIAL_FEATURE_CONTROLS;
    try {
      const saved = localStorage.getItem('GOLIFE_SETTINGS_FEATURES');
      return saved ? JSON.parse(saved) : INITIAL_FEATURE_CONTROLS;
    } catch {
      return INITIAL_FEATURE_CONTROLS;
    }
  });

  const [businessRules, setBusinessRules] = useState<BusinessRulesConfig>(() => {
    if (isProductionDataSource()) return DEFAULT_BUSINESS_RULES;
    try {
      const saved = localStorage.getItem('GOLIFE_SETTINGS_BUSINESS_RULES');
      return saved ? JSON.parse(saved) : DEFAULT_BUSINESS_RULES;
    } catch {
      return DEFAULT_BUSINESS_RULES;
    }
  });

  const [approvalRules, setApprovalRules] = useState<SensitiveApprovalRule[]>(() => {
    if (isProductionDataSource()) return INITIAL_SENSITIVE_APPROVAL_RULES;
    try {
      const saved = localStorage.getItem('GOLIFE_SETTINGS_APPROVAL_RULES');
      return saved ? JSON.parse(saved) : INITIAL_SENSITIVE_APPROVAL_RULES;
    } catch {
      return INITIAL_SENSITIVE_APPROVAL_RULES;
    }
  });

  const [overrides, setOverrides] = useState<ConfigurationOverride[]>(() => {
    if (isProductionDataSource()) return [];
    try {
      const saved = localStorage.getItem('GOLIFE_SETTINGS_OVERRIDES');
      return saved ? JSON.parse(saved) : INITIAL_CONFIGURATION_OVERRIDES;
    } catch {
      return INITIAL_CONFIGURATION_OVERRIDES;
    }
  });

  const [versions, setVersions] = useState<RuleVersionRecord[]>(() => {
    if (isProductionDataSource()) return [];
    try {
      const saved = localStorage.getItem('GOLIFE_SETTINGS_VERSIONS');
      return saved ? JSON.parse(saved) : INITIAL_RULE_VERSIONS;
    } catch {
      return INITIAL_RULE_VERSIONS;
    }
  });

  const [aiRecs, setAiRecs] = useState<AiSettingRecommendation[]>(() => {
    if (isProductionDataSource()) return [];
    try {
      const saved = localStorage.getItem('GOLIFE_SETTINGS_AI_RECOMMENDATIONS');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS_AI_RECOMMENDATIONS;
    } catch {
      return INITIAL_SETTINGS_AI_RECOMMENDATIONS;
    }
  });

  useEffect(() => {
    if (!isProductionDataSource()) return;
    firebaseRepository
      .getById<any>('systemSettings', 'global_business_rules')
      .then((docData) => {
        if (docData) {
          if (docData.systemControl) setSystemControl(docData.systemControl);
          if (Array.isArray(docData.features)) setFeatures(docData.features);
          if (docData.businessRules) setBusinessRules(docData.businessRules);
          if (Array.isArray(docData.approvalRules)) setApprovalRules(docData.approvalRules);
          if (Array.isArray(docData.overrides)) setOverrides(docData.overrides);
          if (Array.isArray(docData.versions)) setVersions(docData.versions);
        }
      })
      .catch(() => {});
  }, []);

  // Demo-only LocalStorage Syncer
  useEffect(() => {
    if (isProductionDataSource()) return;
    try {
      localStorage.setItem('GOLIFE_SETTINGS_SYSTEM_CONTROL', JSON.stringify(systemControl));
    } catch {}
  }, [systemControl]);

  useEffect(() => {
    if (isProductionDataSource()) return;
    try {
      localStorage.setItem('GOLIFE_SETTINGS_FEATURES', JSON.stringify(features));
    } catch {}
  }, [features]);

  useEffect(() => {
    if (isProductionDataSource()) return;
    try {
      localStorage.setItem('GOLIFE_SETTINGS_BUSINESS_RULES', JSON.stringify(businessRules));
    } catch {}
  }, [businessRules]);

  useEffect(() => {
    if (isProductionDataSource()) return;
    try {
      localStorage.setItem('GOLIFE_SETTINGS_APPROVAL_RULES', JSON.stringify(approvalRules));
    } catch {}
  }, [approvalRules]);

  useEffect(() => {
    if (isProductionDataSource()) return;
    try {
      localStorage.setItem('GOLIFE_SETTINGS_OVERRIDES', JSON.stringify(overrides));
    } catch {}
  }, [overrides]);

  useEffect(() => {
    if (isProductionDataSource()) return;
    try {
      localStorage.setItem('GOLIFE_SETTINGS_VERSIONS', JSON.stringify(versions));
    } catch {}
  }, [versions]);

  useEffect(() => {
    if (isProductionDataSource()) return;
    try {
      localStorage.setItem('GOLIFE_SETTINGS_AI_RECOMMENDATIONS', JSON.stringify(aiRecs));
    } catch {}
  }, [aiRecs]);

  // Company Receiving Accounts (Point 4: Settings -> Payment Accounts -> Company Receiving Accounts)
  const [companyAccounts, setCompanyAccounts] = useState<CompanyPaymentAccount[]>(() => {
    if (isProductionDataSource()) return INITIAL_COMPANY_PAYMENT_ACCOUNTS;
    try {
      const saved = localStorage.getItem('GOLIFE_COMPANY_PAYMENT_ACCOUNTS');
      return saved ? JSON.parse(saved) : INITIAL_COMPANY_PAYMENT_ACCOUNTS;
    } catch {
      return INITIAL_COMPANY_PAYMENT_ACCOUNTS;
    }
  });

  useEffect(() => {
    if (isProductionDataSource()) return;
    try {
      localStorage.setItem('GOLIFE_COMPANY_PAYMENT_ACCOUNTS', JSON.stringify(companyAccounts));
    } catch {}
  }, [companyAccounts]);

  const handleUpdateCompanyAccount = (updated: CompanyPaymentAccount) => {
    setCompanyAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleAddCompanyAccount = (newAcc: CompanyPaymentAccount) => {
    setCompanyAccounts((prev) => [newAcc, ...prev]);
  };

  // Real-time Automated Conflict Detection
  const conflicts = useMemo(() => {
    return detectConfigurationConflicts(systemControl, features, businessRules, overrides);
  }, [systemControl, features, businessRules, overrides]);

  // Permissions
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const canEditSystem = isSuperAdmin || hasPermission('system_settings', 'edit');
  const canManageFeatures = isSuperAdmin;
  const canEditRules = isSuperAdmin || hasPermission('system_settings', 'edit');
  const canManageApprovals = isSuperAdmin;
  const canManageOverrides = isSuperAdmin || hasPermission('system_settings', 'edit');

  // Search Results Jump Matrix across 15 search domains
  const searchResults = useMemo(() => {
    if (!globalSearch.trim() || globalSearch.length < 2) return [];
    const q = globalSearch.toLowerCase();
    const results: { title: string; category: string; tab: SystemSettingsCenterTab; subFilter?: string }[] = [];

    // Check system control
    if (systemControl.appName.toLowerCase().includes(q) || systemControl.platformName.toLowerCase().includes(q) || 'helpline maintenance uan contact support emergency'.includes(q)) {
      results.push({ title: 'System Control & Platform Standards', category: 'System', tab: 'system' });
    }

    // Check features
    features.forEach((f) => {
      if (f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) {
        results.push({ title: `Feature: ${f.name}`, category: f.category.replace('_', ' '), tab: 'features' });
      }
    });

    // Check business rules
    if ('search radius ride distance timeout expiry wait cancellation fee otp completion pin'.includes(q)) {
      results.push({ title: 'Rides & Dispatching Rules', category: 'Operational Rules', tab: 'business_rules' });
    }
    if ('driver rating wallet cash cnic license inspection penalty late'.includes(q)) {
      results.push({ title: 'Driver Eligibility & Standards', category: 'Driver Rules', tab: 'business_rules' });
    }
    if ('passenger debt cancellation no-show abuse'.includes(q)) {
      results.push({ title: 'Passenger Rules & Debt Policies', category: 'Passenger Rules', tab: 'business_rules' });
    }
    if ('safety emergency sos police 15 telemetry speed speed-limit'.includes(q)) {
      results.push({ title: 'Safety & SOS Thresholds', category: 'Safety Rules', tab: 'business_rules' });
    }
    if ('payout withdrawal jazzcash easypaisa wallet balance gateway timeout'.includes(q)) {
      results.push({ title: 'Payments & Wallet Balances', category: 'Financial Rules', tab: 'business_rules' });
    }
    if ('payment accounts company receiving jazzcash easypaisa bank iban till deposit topup'.includes(q)) {
      results.push({ title: 'Company Receiving Accounts', category: 'Payment Accounts', tab: 'payment_accounts' });
    }

    // Check approvals
    approvalRules.forEach((ar) => {
      if (ar.actionTitle.toLowerCase().includes(q) || ar.category.toLowerCase().includes(q) || 'maker-checker approval dual'.includes(q)) {
        results.push({ title: `Approval: ${ar.actionTitle}`, category: 'Sensitive Workflows', tab: 'approvals' });
      }
    });

    // Check overrides
    overrides.forEach((ovr) => {
      if (ovr.ruleLabel.toLowerCase().includes(q) || (ovr.cityName && ovr.cityName.toLowerCase().includes(q)) || (ovr.categoryName && ovr.categoryName.toLowerCase().includes(q))) {
        results.push({ title: `Override: ${ovr.ruleLabel} (${ovr.cityName || ovr.categoryName})`, category: 'City/Category Override', tab: 'overrides' });
      }
    });

    return results.slice(0, 5);
  }, [globalSearch, systemControl, features, approvalRules, overrides]);

  // Handlers
  const handleUpdateSystemControl = (updated: SystemControlSettings, reason: string) => {
    setSystemControl(updated);
    if (typeof updateSettings === 'function') {
      try {
        updateSettings({
          appName: updated.appName,
          supportPhone: updated.supportContact?.helplineUan,
          supportWhatsApp: updated.supportContact?.whatsapp,
          supportEmail: updated.supportContact?.email,
          currency: updated.defaultCurrency,
          country: updated.defaultCountry,
          maintenanceMode: Boolean(updated.maintenance?.enabled),
          maintenanceMessage: updated.maintenance?.message
        });
      } catch (err) {
        console.warn('Could not sync admin settings:', err);
      }
    }
    const newVersion = recordRuleVersion(
      'System General Parameters',
      'system_setting',
      'Config Object',
      'Updated Config',
      currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin',
      currentAdmin?.role || 'super_admin',
      reason
    );
    setVersions((prevV) => [newVersion, ...prevV]);
    safeLogAction('UPDATE_SYSTEM_SETTINGS', 'System Control', reason, { updated });
    showToast?.('System control parameters committed and synchronized', 'success');
  };

  const handleToggleFeature = (featureId: string, newStatus: 'active' | 'inactive', reason: string) => {
    const targetFeat = features.find((f) => f.id === featureId);
    if (!targetFeat) return;

    setFeatures((prev) =>
      prev.map((f) => (f.id === featureId ? { ...f, status: newStatus } : f))
    );

    const newVersion = recordRuleVersion(
      targetFeat.name,
      'feature_control',
      targetFeat.status,
      newStatus,
      currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin',
      currentAdmin?.role || 'super_admin',
      reason
    );
    setVersions((prevV) => [newVersion, ...prevV]);
    safeLogAction('TOGGLE_FEATURE', targetFeat.name, reason, { featureId, newStatus });
    showToast?.(`Feature "${targetFeat.name}" is now ${newStatus.toUpperCase()}`, 'info');
  };

  const handleUpdateFeatureScope = (featureId: string, cityScope: string[], serviceCategoryScope: string[], adminNote: string) => {
    const targetFeat = features.find((f) => f.id === featureId);
    if (!targetFeat) return;

    setFeatures((prev) =>
      prev.map((f) =>
        f.id === featureId
          ? {
              ...f,
              cityScope,
              serviceCategoryScope,
              availabilityScope: cityScope.includes('all') && serviceCategoryScope.includes('all') ? 'global' : 'city_specific',
              adminNote
            }
          : f
      )
    );

    safeLogAction('UPDATE_FEATURE_SCOPE', targetFeat.name, adminNote || 'Updated feature operational scope', { cityScope, serviceCategoryScope });
    showToast?.(`Scope updated for feature "${targetFeat.name}"`, 'success');
  };

  const handleUpdateBusinessRules = (updated: BusinessRulesConfig, reason: string) => {
    setBusinessRules(updated);
    if (updated.commission && typeof updateSettings === 'function') {
      try {
        updateSettings({
          defaultCommissionPct: updated.commission.defaultCommissionPct,
          taxPercentage: updated.commission.punjabPraTaxPct
        });
      } catch (err) {
        console.warn('Could not sync commission settings:', err);
      }
    }
    const newVersion = recordRuleVersion(
      'Operational Business Policies',
      'business_rule',
      'Active Ruleset',
      'Updated Ruleset',
      currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin',
      currentAdmin?.role || 'super_admin',
      reason
    );
    setVersions((prevV) => [newVersion, ...prevV]);
    safeLogAction('UPDATE_BUSINESS_RULES', 'Global Operational Policies', reason, { updated });
    showToast?.('Operational business policies & commissions saved successfully', 'success');
  };

  const handleUpdateApprovalRule = (ruleId: string, updates: Partial<SensitiveApprovalRule>, reason: string) => {
    const target = approvalRules.find((r) => r.id === ruleId);
    if (!target) return;

    setApprovalRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r))
    );

    const newVersion = recordRuleVersion(
      target.actionTitle,
      'approval_rule',
      target.approvalType,
      updates.approvalType || target.approvalType,
      currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin',
      currentAdmin?.role || 'super_admin',
      reason,
      currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin'
    );
    setVersions((prevV) => [newVersion, ...prevV]);
    safeLogAction('UPDATE_APPROVAL_POLICY', target.actionTitle, reason, { updates });
    showToast?.(`Approval rule for "${target.actionTitle}" updated`, 'success');
  };

  const handleAddOverride = (newOvr: Omit<ConfigurationOverride, 'id' | 'effectiveDate' | 'updatedBy'>, reason: string) => {
    const fullOverride: ConfigurationOverride = {
      ...newOvr,
      id: `ovr-${Date.now()}`,
      effectiveDate: new Date().toISOString().split('T')[0],
      updatedBy: currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin'
    };

    setOverrides((prev) => [fullOverride, ...prev]);

    const newVersion = recordRuleVersion(
      `${fullOverride.ruleLabel} (${fullOverride.cityName || fullOverride.categoryName})`,
      'override',
      String(fullOverride.inheritedValue),
      String(fullOverride.overrideValue),
      currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin',
      currentAdmin?.role || 'super_admin',
      reason
    );
    setVersions((prevV) => [newVersion, ...prevV]);
    safeLogAction('CREATE_OVERRIDE', fullOverride.ruleLabel, reason, { fullOverride });
    showToast?.(`Override deployed for ${fullOverride.cityName || fullOverride.categoryName}`, 'success');
  };

  const handleUpdateOverride = (overrideId: string, updates: Partial<ConfigurationOverride>, reason: string) => {
    setOverrides((prev) =>
      prev.map((o) =>
        o.id === overrideId
          ? {
              ...o,
              ...updates,
              updatedBy: currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin'
            }
          : o
      )
    );
    safeLogAction('UPDATE_OVERRIDE', overrideId, reason, { updates });
    showToast?.('Regional override parameters adjusted', 'info');
  };

  const handleRemoveOverride = (overrideId: string, reason: string) => {
    const target = overrides.find((o) => o.id === overrideId);
    if (!target) return;

    setOverrides((prev) => prev.filter((o) => o.id !== overrideId));

    const newVersion = recordRuleVersion(
      `${target.ruleLabel} (${target.cityName || target.categoryName})`,
      'override',
      String(target.overrideValue),
      String(target.inheritedValue),
      currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin',
      currentAdmin?.role || 'super_admin',
      reason,
      undefined,
      true
    );
    setVersions((prevV) => [newVersion, ...prevV]);
    safeLogAction('REMOVE_OVERRIDE', target.ruleLabel, reason, { overrideId });
    showToast?.('Regional override revoked', 'warning');
  };

  const handleToggleOverrideStatus = (overrideId: string) => {
    setOverrides((prev) =>
      prev.map((o) => (o.id === overrideId ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o))
    );
  };

  const handleRollbackVersion = (version: RuleVersionRecord, reason: string) => {
    // 1. Perform actual state restoration based on ruleCategory
    if (version.ruleCategory === 'feature_control') {
      const targetFeat = features.find((f) => f.name === version.ruleTitle || f.id === version.ruleId);
      if (targetFeat) {
        const restoredStatus = (version.previousValue === 'active' || version.previousValue === 'inactive')
          ? version.previousValue
          : (targetFeat.status === 'active' ? 'inactive' : 'active');
        setFeatures((prev) =>
          prev.map((f) => (f.id === targetFeat.id ? { ...f, status: restoredStatus } : f))
        );
      }
    } else if (version.ruleCategory === 'override') {
      setOverrides((prev) =>
        prev.map((o) => {
          if (version.ruleTitle.includes(o.ruleLabel)) {
            const numVal = Number(version.previousValue);
            return {
              ...o,
              overrideValue: isNaN(numVal) ? version.previousValue : numVal
            };
          }
          return o;
        })
      );
    } else if (version.ruleCategory === 'approval_rule') {
      setApprovalRules((prev) =>
        prev.map((a) => {
          if (a.actionTitle === version.ruleTitle) {
            return { ...a, approvalType: version.previousValue as any };
          }
          return a;
        })
      );
    }

    // 2. Append rollback audit log
    const newVersion = recordRuleVersion(
      version.ruleTitle,
      version.ruleCategory,
      String(version.newValue),
      String(version.previousValue),
      currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin',
      currentAdmin?.role || 'super_admin',
      `[ROLLBACK] ${reason}`,
      currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin',
      true
    );
    setVersions((prev) => [newVersion, ...prev]);
    safeLogAction('ROLLBACK_CONFIG', version.ruleTitle, reason, { version });
    showToast?.(`Rolled back "${version.ruleTitle}" to revision ${version.version}`, 'info');
  };

  const handleResetAllData = () => {
    // 1. Reset AdminContext data (mock passengers, rides, tariffs, payouts)
    if (typeof resetAllData === 'function') {
      resetAllData();
    }
    // 2. Clear localStorage keys
    try {
      localStorage.removeItem('GOLIFE_SETTINGS_SYSTEM_CONTROL');
      localStorage.removeItem('GOLIFE_SETTINGS_FEATURES');
      localStorage.removeItem('GOLIFE_SETTINGS_BUSINESS_RULES');
      localStorage.removeItem('GOLIFE_SETTINGS_APPROVAL_RULES');
      localStorage.removeItem('GOLIFE_SETTINGS_OVERRIDES');
      localStorage.removeItem('GOLIFE_SETTINGS_VERSIONS');
      localStorage.removeItem('GOLIFE_SETTINGS_AI_RECOMMENDATIONS');
    } catch {}
    // 3. Reset state variables
    setSystemControl(DEFAULT_SYSTEM_SETTINGS);
    setFeatures(INITIAL_FEATURE_CONTROLS);
    setBusinessRules(DEFAULT_BUSINESS_RULES);
    setApprovalRules(INITIAL_SENSITIVE_APPROVAL_RULES);
    setOverrides(INITIAL_CONFIGURATION_OVERRIDES);
    setVersions(INITIAL_RULE_VERSIONS);
    setAiRecs(INITIAL_SETTINGS_AI_RECOMMENDATIONS);
    safeLogAction('RESET_ALL_DATA', 'Demo Simulation Store', 'Factory simulation defaults restored');
    showToast?.('All simulation data and settings have been reset to initial factory defaults', 'info');
  };

  const handleApplyAiRecommendation = (rec: AiSettingRecommendation, reason: string) => {
    if (rec.proposedChange?.targetType === 'city_override') {
      const existingOvr = overrides.find((o) => o.id === rec.proposedChange.targetId);
      if (existingOvr) {
        handleUpdateOverride(
          existingOvr.id,
          { overrideValue: rec.proposedChange.recommendedValue, reason },
          reason
        );
      } else {
        handleAddOverride(
          {
            targetScope: 'city',
            cityName: 'Karachi',
            ruleGroup: 'rides',
            ruleKey: 'driverArrivalFreeWaitMins',
            ruleLabel: 'Driver Arrival Free Wait Window',
            inheritedValue: businessRules.rides.driverArrivalFreeWaitMins,
            overrideValue: rec.proposedChange.recommendedValue,
            unit: 'mins',
            status: 'active',
            reason
          },
          reason
        );
      }
    } else if (rec.proposedChange?.targetType === 'payment_rule') {
      const updatedRules: BusinessRulesConfig = {
        ...businessRules,
        payments: {
          ...businessRules.payments,
          gatewayTimeoutSeconds: Number(rec.proposedChange.recommendedValue)
        }
      };
      handleUpdateBusinessRules(updatedRules, reason);
    }

    setAiRecs((prev) =>
      prev.map((r) => (r.id === rec.id ? { ...r, status: 'accepted' } : r))
    );
    safeLogAction('APPLY_AI_RECOMMENDATION', rec.title, reason, { recommendation: rec });
  };

  const handleDismissAiRecommendation = (recId: string) => {
    setAiRecs((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: 'dismissed' } : r))
    );
  };

  const handleExportConfiguration = () => {
    const exportBundle = {
      exportTimestamp: new Date().toISOString(),
      exportedBy: currentAdmin ? `${currentAdmin.firstName} ${currentAdmin.lastName}` : 'Super Admin',
      systemControl,
      features,
      businessRules,
      approvalRules,
      overrides,
      activeConflicts: conflicts
    };
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golife-system-configuration-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJumpToOverrides = (ruleKey?: string) => {
    setTargetRuleOverrideFilter(ruleKey);
    setActiveTab('overrides');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ============================================================
          TOP PLATFORM CONTROL HEADER
         ============================================================ */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-3.5">
            <BackToDashboardButton />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="p-2 rounded-2xl bg-amber-400 text-slate-950 shadow-2xs font-black">
                  <Sliders className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                  System Settings & Business Rules Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Phase 54
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Centralized administrative hub for Pakistan platform parameters, 32 module activations, dispatch & safety rules, dual-level approval gates, and location-specific overrides.
              </p>
            </div>
          </div>

          {/* Status Indicators & Export */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* System Health Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className={`w-2 h-2 rounded-full ${systemControl.maintenance.enabled ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="font-bold text-slate-800">
                {systemControl.maintenance.enabled ? 'Maintenance Active' : 'Fleet Grid Online'}
              </span>
            </div>

            {/* Conflicts Warning Pill */}
            {conflicts.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('conflicts_ai')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-black cursor-pointer transition"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>{conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}</span>
              </button>
            )}

            {/* Export JSON */}
            <button
              type="button"
              onClick={handleExportConfiguration}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              title="Download snapshot of platform configuration"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Global Search Bar across All 15 Settings Domains */}
        <div className="mt-5 relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Instant Search across Pricing, Commission, Tax, Driver Rules, Passenger Rules, Ride Rules, Safety, Payments, Features, Overrides..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-400 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick-Jump Floating Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Direct Jump Recommendations:
              </div>
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveTab(res.tab);
                    setGlobalSearch('');
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-xs flex items-center justify-between transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 group-hover:text-amber-950">
                      {res.title}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
                      {res.category}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          MAIN COMPACT TAB BAR (ONE TASK = ONE MAIN OPTION)
         ============================================================ */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-x-auto scrollbar-none">
        {/* Tab 1: System Control */}
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'system'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>System Control</span>
        </button>

        {/* Tab 2: Feature Controls */}
        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'features'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <ToggleRight className="w-3.5 h-3.5" />
          <span>Feature Controls (32)</span>
        </button>

        {/* Tab 3: Business Rules */}
        <button
          onClick={() => setActiveTab('business_rules')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'business_rules'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Business Rules</span>
        </button>

        {/* Tab 4: Approval Rules */}
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sensitive Approvals</span>
        </button>

        {/* Tab 5: City & Category Overrides */}
        <button
          onClick={() => {
            setTargetRuleOverrideFilter(undefined);
            setActiveTab('overrides');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overrides'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Overrides & Hierarchy</span>
        </button>

        {/* Tab 6: Version History */}
        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'versions'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit & Rollback</span>
        </button>

        {/* Tab 7: Conflicts & AI Recommendations */}
        <button
          onClick={() => setActiveTab('conflicts_ai')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'conflicts_ai'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Conflicts & AI Advisory</span>
          {conflicts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-600 text-white">
              {conflicts.length}
            </span>
          )}
        </button>

        {/* Tab 8: Payment Accounts (Company Receiving Accounts) */}
        <button
          onClick={() => setActiveTab('payment_accounts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'payment_accounts'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Payment Accounts</span>
        </button>
      </div>

      {/* ============================================================
          TAB CONTENT RENDERING
         ============================================================ */}
      <div>
        {activeTab === 'system' && (
          <SystemControlSection
            settings={systemControl}
            onUpdate={handleUpdateSystemControl}
            onResetDemoData={handleResetAllData}
            canEdit={canEditSystem}
          />
        )}

        {activeTab === 'features' && (
          <FeatureControlsSection
            features={features}
            onToggleFeature={handleToggleFeature}
            onUpdateFeatureScope={handleUpdateFeatureScope}
            canManageFeatures={canManageFeatures}
            availableCities={availableCities}
          />
        )}

        {activeTab === 'business_rules' && (
          <BusinessRulesSection
            rules={businessRules}
            overrides={overrides}
            onUpdateRules={handleUpdateBusinessRules}
            canEditRules={canEditRules}
            onJumpToOverrides={handleJumpToOverrides}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalRulesSection
            rules={approvalRules}
            onUpdateRule={handleUpdateApprovalRule}
            canManageApprovals={canManageApprovals}
          />
        )}

        {activeTab === 'overrides' && (
          <OverridesSection
            overrides={overrides}
            rules={businessRules}
            availableCities={availableCities}
            onAddOverride={handleAddOverride}
            onRemoveOverride={handleRemoveOverride}
            onToggleOverrideStatus={handleToggleOverrideStatus}
            canManageOverrides={canManageOverrides}
            initialRuleFilter={targetRuleOverrideFilter}
          />
        )}

        {activeTab === 'versions' && (
          <RuleVersionsSection
            versions={versions}
            onRollback={handleRollbackVersion}
            canRollback={isSuperAdmin}
          />
        )}

        {activeTab === 'conflicts_ai' && (
          <ConflictsAndAiSection
            conflicts={conflicts}
            recommendations={aiRecs}
            onApplyRecommendation={handleApplyAiRecommendation}
            onDismissRecommendation={handleDismissAiRecommendation}
            onJumpToTab={(tab, filter) => {
              setActiveTab(tab);
              if (filter) setTargetRuleOverrideFilter(filter);
            }}
            canApplyChanges={isSuperAdmin}
          />
        )}

        {activeTab === 'payment_accounts' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                Settings &rarr; Payment Accounts &rarr; Company Receiving Accounts
              </span>
              <p className="text-xs text-amber-800 mt-1">
                Configure corporate receiving accounts (JazzCash, Easypaisa, 1Link Bank) for driver wallet top-ups.
                Driver apps query active accounts dynamically without needing code changes.
              </p>
            </div>
            <CompanyPaymentAccountsTab
              accounts={companyAccounts}
              onUpdateAccount={handleUpdateCompanyAccount}
              onAddAccount={handleAddCompanyAccount}
            />
          </div>
        )}
      </div>
    </div>
  );
};

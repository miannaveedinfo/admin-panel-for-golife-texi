import React, { useState, useEffect } from 'react';
import {
  isProductionDataSource,
  validateProductionConfig,
  setCentralDataSourceMode,
  isEnvironmentLocked,
  getDeploymentStageLabel,
  DATA_SOURCE_CHANGED_EVENT
} from '../../config/dataSourceMode';
import { ShieldAlert, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, XCircle, Lock } from 'lucide-react';

interface ProductionConfigAlertProps {
  onOpenConfigModal?: () => void;
}

export const ProductionConfigAlert: React.FC<ProductionConfigAlertProps> = ({ onOpenConfigModal }) => {
  const [configState, setConfigState] = useState(() => ({
    isProduction: isProductionDataSource(),
    validation: validateProductionConfig(),
    isLocked: isEnvironmentLocked(),
    stageLabel: getDeploymentStageLabel()
  }));

  const refreshState = () => {
    setConfigState({
      isProduction: isProductionDataSource(),
      validation: validateProductionConfig(),
      isLocked: isEnvironmentLocked(),
      stageLabel: getDeploymentStageLabel()
    });
  };

  useEffect(() => {
    const handleDataSourceChange = () => {
      refreshState();
    };

    window.addEventListener(DATA_SOURCE_CHANGED_EVENT, handleDataSourceChange);
    window.addEventListener('storage', handleDataSourceChange);

    return () => {
      window.removeEventListener(DATA_SOURCE_CHANGED_EVENT, handleDataSourceChange);
      window.removeEventListener('storage', handleDataSourceChange);
    };
  }, []);

  // Only show if in PRODUCTION mode and configuration is incomplete
  if (!configState.isProduction || configState.validation.isValid) {
    return null;
  }

  const { missingKeys, checklist } = configState.validation;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-900/90 to-amber-950/90 border border-rose-500/40 p-5 text-white shadow-xl shadow-rose-950/20 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/30 text-rose-300 border border-rose-400/40">
                DATA_SOURCE=PRODUCTION
              </span>
              <span className="text-xs font-bold text-rose-200">
                Production Safety Lock Engaged
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-1">
              Real Backend Configuration Incomplete — Demo Fallback Disabled
            </h3>
            <p className="text-xs text-rose-100/80 mt-1 max-w-3xl leading-relaxed">
              Production data source is selected, but {missingKeys.length} required Firebase environment {missingKeys.length === 1 ? 'variable is' : 'variables are'} missing. Per Phase 28 rules, fake demo records and simulated financial balances are <strong>strictly blocked</strong> to prevent real/test data contamination.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
          {configState.isLocked ? (
            <div
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/20 shadow-xs"
              title="Deployment mode is locked via VITE_DATA_SOURCE. Set VITE_DATA_SOURCE=DEMO in environment to test in demo sandbox."
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Locked via VITE_DATA_SOURCE</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCentralDataSourceMode('DEMO')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md shadow-amber-950/30 cursor-pointer"
            >
              <span>Switch to Demo Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenConfigModal && (
            <button
              type="button"
              onClick={onOpenConfigModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
            >
              <span>Review Checklist</span>
            </button>
          )}

          <button
            type="button"
            onClick={refreshState}
            title="Recheck Environment"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition border border-white/10 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-rose-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {checklist.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono border ${
              item.isSet
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : item.required
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : 'bg-slate-900/40 border-slate-700/40 text-slate-400'
            }`}
          >
            <span className="truncate mr-2">{item.key}</span>
            <span className="shrink-0 flex items-center gap-1">
              {item.isSet ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-sans font-bold">READY</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[10px] font-sans font-bold">MISSING</span>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

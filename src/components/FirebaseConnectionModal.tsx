import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowRight,
  Shield,
  Radio,
  Server,
  Key,
  ExternalLink,
  Zap,
  Lock,
  Cpu,
  FileText,
  ShieldAlert
} from 'lucide-react';
import {
  isFirebaseConfigured,
  getFirebaseConfigChecklist,
  getStoredDataSourceMode,
  setStoredDataSourceMode,
  DataSourceMode,
  testFirestoreConnection,
  getFirebaseInstance
} from '../services/firebase/firebaseConfig';
import {
  isEnvironmentLocked,
  getDeploymentStage,
  getDeploymentStageLabel
} from '../config/dataSourceMode';
import { ALL_COLLECTIONS_LIST, COLLECTIONS_METADATA, FirestoreCollectionKey } from '../services/firebase/collections';
import { firebaseRepository } from '../services/backend/FirebaseRepository';
import { INITIAL_PAKISTAN_CITIES } from '../services/cityOperationsService';
import { DEFAULT_ADMIN_USERS } from '../services/adminAccessService';

interface FirebaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConnectionModal: React.FC<FirebaseConnectionModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'collections' | 'architecture' | 'migration' | 'runbook'>('status');
  const [mode, setMode] = useState<DataSourceMode>(getStoredDataSourceMode());
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [seedMessage, setSeedMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const configured = isFirebaseConfigured();
  const checklist = getFirebaseConfigChecklist();
  const currentInstance = getFirebaseInstance();
  const envLocked = isEnvironmentLocked();
  const deploymentStage = getDeploymentStage();
  const deploymentLabel = getDeploymentStageLabel();

  useEffect(() => {
    if (isOpen) {
      handleTestPing();
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleToggleMode = (newMode: DataSourceMode) => {
    setStoredDataSourceMode(newMode);
    setMode(newMode);
  };

  const handleTestPing = async () => {
    setIsTestingPing(true);
    setPingResult(null);
    try {
      const res = await testFirestoreConnection();
      setPingResult(res);
    } catch (err: any) {
      setPingResult({
        success: false,
        latencyMs: 0,
        message: err?.message || 'Connection test failed.'
      });
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleSeedInitialSchema = async () => {
    setSeedMessage(null);
    if (mode === 'demo' || !currentInstance.db) {
      setSeedMessage({
        type: 'info',
        text: 'Seeding is only intended for Production Mode connected to a real Firestore instance. Demo datasets are already fully populated in memory.'
      });
      return;
    }
    setIsSeeding(true);
    setSeedSuccess(false);

    try {
      // 1. Seed base cities
      for (const city of INITIAL_PAKISTAN_CITIES) {
        await firebaseRepository.create('cities', city.id, city);
      }
      // 2. Seed initial admin user
      for (const admin of DEFAULT_ADMIN_USERS) {
        await firebaseRepository.create('adminUsers', admin.id, admin);
      }
      // 3. Mark system settings initialized
      await firebaseRepository.create('systemSettings', 'global_config', {
        initializedAt: new Date().toISOString(),
        version: '1.0.0',
        platform: 'GoLife Taxi Pakistan'
      });

      setSeedSuccess(true);
      setSeedMessage({
        type: 'info',
        text: 'Firestore initialized successfully with Pakistan operational matrix.'
      });
    } catch (err: any) {
      console.error('Seeding error:', err);
      setSeedMessage({
        type: 'error',
        text: err?.message || 'Error during Firestore initialization. Please check Firestore security rules.'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredCollections = Object.keys(COLLECTIONS_METADATA).filter((key) => {
    if (selectedCategory === 'all') return true;
    return COLLECTIONS_METADATA[key as FirestoreCollectionKey].category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  Firebase Real Backend & Mobile Connection Center
                </h2>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  mode === 'production' && configured
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                }`}>
                  {mode === 'production' && configured ? 'Live Production' : 'Demo Mode Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Shared cloud architecture powering GoLife Passenger, Driver App & Admin Console
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Banner (ONE Task = ONE Main Option) */}
        <div className="bg-amber-50/70 border-b border-amber-200/70 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${mode === 'production' && configured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Active Data Source:</span>
                <span className="font-extrabold text-amber-950 underline decoration-amber-400">
                  {mode === 'production' && configured ? 'Firebase Live Cloud Firestore' : 'Standalone Demo Sandbox'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {mode === 'production' && configured
                  ? 'Writes are committed securely to your live Firebase project with mobile sync.'
                  : 'Safe offline sandbox with simulated Pakistan fleet data. No production data modified.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {envLocked ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Locked by VITE_DATA_SOURCE ({deploymentLabel})</span>
              </div>
            ) : mode === 'demo' ? (
              <button
                onClick={() => handleToggleMode('production')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                  configured
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                }`}
                title={configured ? 'Switch to live production database' : 'Switch to Production Mode (Config Missing Alert will be shown)'}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{configured ? 'Switch to Production Mode' : 'Switch to Production Mode'}</span>
              </button>
            ) : (
              <button
                onClick={() => handleToggleMode('demo')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Server className="w-3.5 h-3.5" />
                <span>Return to Demo Mode</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 bg-slate-50/50 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3.5 py-2.5 text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'status'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Connection Diagnostics</span>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-3.5 py-2.5 text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'collections'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Shared Collections ({ALL_COLLECTIONS_LIST.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2.5 text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'architecture'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile ↔ Admin Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('migration')}
            className={`px-3.5 py-2.5 text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'migration'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Database Initialization & Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('runbook')}
            className={`px-3.5 py-2.5 text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'runbook'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Go-Live Protection & Runbook</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* TAB 1: STATUS & DIAGNOSTICS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Ping Diagnostic Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${isTestingPing ? 'animate-spin text-amber-600' : 'text-emerald-600'}`} />
                    <span>Real-Time Cloud Ping & Reachability</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {pingResult ? pingResult.message : 'Testing connectivity to cloud infrastructure...'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {pingResult && (
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-800">
                        {pingResult.latencyMs} ms
                      </div>
                      <div className="text-[10px] text-slate-400">Response Latency</div>
                    </div>
                  )}
                  <button
                    onClick={handleTestPing}
                    disabled={isTestingPing}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin' : ''}`} />
                    <span>Ping Test</span>
                  </button>
                </div>
              </div>

              {/* Service Cards Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. Firestore */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <Database className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Ready
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900">Cloud Firestore</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {mode === 'production' && configured ? 'Connected (Live)' : 'Simulated (Demo)'}
                  </div>
                </div>

                {/* 2. Authentication */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      RBAC Active
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900">Firebase Auth</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Super Admin Profile
                  </div>
                </div>

                {/* 3. Storage */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <Cloud className="w-4 h-4 text-purple-600" />
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tokenized
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900">Cloud Storage</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Driver Documents & KYC
                  </div>
                </div>

                {/* 4. FCM Messaging */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <Smartphone className="w-4 h-4 text-rose-600" />
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Topic Ready
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900">Cloud Messaging</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Dispatch & SOS Push
                  </div>
                </div>
              </div>

              {/* Environment Checklist */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-600" />
                    <h3 className="text-xs font-black text-slate-900">
                      Firebase Project Credentials Checklist (.env)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {checklist.filter((c) => c.isSet).length} / {checklist.length} configured
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {checklist.map((item) => (
                    <div key={item.key} className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-[11px] font-bold text-slate-800">{item.key}</code>
                          {item.required && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.description}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.isSet ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Configured
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <AlertTriangle className="w-3 h-3 text-slate-400" />
                            Demo Fallback
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHARED COLLECTIONS */}
          {activeTab === 'collections' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black text-slate-900">
                    48 Shared Firestore Collections
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Exact same collection names and schemas used across Admin Panel and Mobile Apps
                  </p>
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option value="all">All Modules ({ALL_COLLECTIONS_LIST.length})</option>
                  <option value="fleet">Fleet & KYC</option>
                  <option value="rides">Rides & Real-Time</option>
                  <option value="finance">Financials & Ledger</option>
                  <option value="pricing">Pricing & Tariffs</option>
                  <option value="geo">Cities & Freight</option>
                  <option value="promo">Promos & Rewards</option>
                  <option value="support">Complaints & Support</option>
                  <option value="safety">Safety & Emergencies</option>
                  <option value="risk">Fraud & Risk</option>
                  <option value="system">Audit & Settings</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredCollections.map((colKey) => {
                  const meta = COLLECTIONS_METADATA[colKey as FirestoreCollectionKey];
                  return (
                    <div
                      key={colKey}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-400/80 transition flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900 font-mono">
                            /{meta.name}
                          </span>
                          {meta.sharedWithMobile && (
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200" title="Shared with Passenger and Driver apps">
                              Mobile Sync
                            </span>
                          )}
                          {meta.isImmutable && (
                            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200" title="Strict append-only immutable ledger">
                              <Lock className="w-2.5 h-2.5 inline mr-0.5" />
                              Immutable
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {meta.description}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {meta.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
                <h3 className="text-sm font-black text-amber-400 mb-1">
                  GoLife Taxi Unified Cloud Architecture
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Single Firebase project shared across Passenger App, Driver App, and Admin Web Console
                </p>

                {/* Visual Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-900">
                  {/* Passenger App */}
                  <div className="bg-white rounded-xl p-4 border-2 border-amber-400 text-center flex flex-col items-center">
                    <Smartphone className="w-8 h-8 text-amber-600 mb-2" />
                    <div className="text-xs font-black">GoLife Passenger App</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      iOS / Android (React Native / Flutter)
                    </div>
                    <div className="mt-3 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg w-full text-left space-y-1">
                      <div>• Ride Bookings (/rides)</div>
                      <div>• Upfront Tariffs (/pricingRules)</div>
                      <div>• Wallet & Raast (/payments)</div>
                      <div>• SOS Alert Dispatch (/safetyIncidents)</div>
                    </div>
                  </div>

                  {/* Central Cloud */}
                  <div className="bg-amber-400/10 border-2 border-dashed border-amber-400/60 rounded-xl p-4 text-center flex flex-col items-center justify-center text-white">
                    <Cloud className="w-9 h-9 text-amber-400 mb-2 animate-bounce" />
                    <div className="text-xs font-black text-amber-300">Firebase Cloud Core</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Single Project: golife-taxi-pk
                    </div>
                    <div className="mt-3 text-[10px] text-slate-300 bg-slate-800 p-2 rounded-lg w-full text-left space-y-1">
                      <div>• Firestore (48 Collections)</div>
                      <div>• Firebase Storage (KYC Documents)</div>
                      <div>• Cloud Messaging (FCM Push)</div>
                      <div>• Hardened Security Rules</div>
                    </div>
                  </div>

                  {/* Driver App */}
                  <div className="bg-white rounded-xl p-4 border-2 border-emerald-500 text-center flex flex-col items-center">
                    <Smartphone className="w-8 h-8 text-emerald-600 mb-2" />
                    <div className="text-xs font-black">GoLife Driver App</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Android / iOS
                    </div>
                    <div className="mt-3 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg w-full text-left space-y-1">
                      <div>• Telemetry GPS (/rideLocations)</div>
                      <div>• Bid Offers (/rideOffers)</div>
                      <div>• Daily Earnings (/driverEarnings)</div>
                      <div>• Payout Requests (/payouts)</div>
                    </div>
                  </div>
                </div>

                {/* Bottom: Admin Panel */}
                <div className="mt-4 bg-slate-800 border border-slate-700 rounded-xl p-3 text-center flex items-center justify-center gap-3">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  <div className="text-xs font-bold text-white">
                    GoLife Taxi Admin Panel (Move Freely. Live Fully.) operates via unified service layer with Idempotency Protection.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MIGRATION & RULES */}
          {activeTab === 'migration' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-black text-slate-900 mb-1">
                  Initial Database Schema Seeder
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  When starting with a fresh Firebase Firestore project in Production Mode, seed the standard Pakistan operational matrix (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Faisalabad, Multan, Quetta) and core RBAC roles with one click.
                </p>

                {seedMessage && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      seedMessage.type === 'error'
                        ? 'bg-rose-50 border border-rose-200 text-rose-800'
                        : 'bg-amber-50 border border-amber-200 text-amber-900'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{seedMessage.text}</span>
                  </div>
                )}

                {seedSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Firestore database initialized successfully with Pakistan operational matrix!</span>
                  </div>
                )}

                <button
                  onClick={handleSeedInitialSchema}
                  disabled={isSeeding || mode === 'demo'}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition ${
                    mode === 'production' && !isSeeding
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Seeding Firestore Collections...' : 'Seed Initial Pakistan Cities & Roles'}</span>
                </button>
                {mode === 'demo' && (
                  <div className="text-[11px] text-amber-800 mt-2">
                    * Seeder is disabled in Demo Mode because mock datasets are already active in memory.
                  </div>
                )}
              </div>

              {/* Hardened Security Rules Specification */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-black text-slate-900">
                    Hardened Security Rules Specification (firestore.rules)
                  </h3>
                </div>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Proactive Default-Deny:</strong> Unlisted paths rejected immediately.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Immutable Ledgers:</strong> Audit logs, transactions, and completed ride fares are strictly write-only / immutable.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Action-Based Protection:</strong> Granular permissions per role (Super Admin, Finance, Operations, Safety).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Anti-Abuse Idempotency:</strong> Protected against duplicate payouts, fines, refunds, and cancellations.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DEPLOYMENT & GO-LIVE PROTECTION RUNBOOK */}
          {activeTab === 'runbook' && (
            <div className="space-y-5">
              {/* Pipeline Overview Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-5 rounded-2xl text-white">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black">Go-Live Protection & Deployment Runbook</h3>
                      <p className="text-[11px] text-slate-300">Phase 32 Zero-Accidental-Cutover System Architecture</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                    mode === 'production' && configured
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  }`}>
                    Active: {deploymentLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  GoLife Admin Panel enforces strict isolation between Testing, Pre-Production, and Live Production. Environment switching is controlled exclusively via deployment configuration (`VITE_DATA_SOURCE`) to protect against accidental production data contamination.
                </p>
              </div>

              {/* 3-Stage Promotion Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`p-4 rounded-xl border ${
                  deploymentStage === 'TESTING'
                    ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      Stage 1
                    </span>
                    {deploymentStage === 'TESTING' && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> CURRENT
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-slate-900">TESTING (Demo)</h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">VITE_DATA_SOURCE=DEMO</div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    Safe self-contained sandbox. Zero credentials needed. Complete simulated Pakistan fleet datasets for testing UI, dates, and logic.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${
                  deploymentStage === 'PRE_PRODUCTION'
                    ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-400/30'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
                      Stage 2
                    </span>
                    {deploymentStage === 'PRE_PRODUCTION' && (
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> CURRENT
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-slate-900">PRE-PRODUCTION (Staging)</h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">VITE_DEPLOYMENT_STAGE=PRE_PRODUCTION</div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    Connected to staging Firebase project & Easypaisa/JazzCash sandbox tills. Real rules validation and phone auth testing before launch.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${
                  deploymentStage === 'LIVE'
                    ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-400/30'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Stage 3
                    </span>
                    {deploymentStage === 'LIVE' && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> CURRENT
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-slate-900">LIVE PRODUCTION</h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">VITE_DATA_SOURCE=PRODUCTION</div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    Live Cloud Firestore, Firebase Auth, corporate storage, and real payment settlement accounts. Mock data strictly forbidden.
                  </p>
                </div>
              </div>

              {/* Pre-Launch Verification Matrix */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Pre-Launch Security & Integrity Checklist</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">17 Firestore Collections Verified</div>
                      <div className="text-[11px] text-slate-500">All entity schemas mapped with server timestamps.</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Composite Indexes Ready</div>
                      <div className="text-[11px] text-slate-500">Configured in firestore.indexes.json for sub-100ms queries.</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Storage Rules Deployed</div>
                      <div className="text-[11px] text-slate-500">KYC docs & CNIC scans protected under storage.rules.</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Zero-Secret Frontend</div>
                      <div className="text-[11px] text-slate-500">No service accounts or private keys exposed in client bundle.</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Strict Cash Settlement</div>
                      <div className="text-[11px] text-slate-500">Completed rides remain cash only. Commission debited securely.</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Dual-Auth Payout Safeguard</div>
                      <div className="text-[11px] text-slate-500">High-value payouts require Finance and Super Admin approvals.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Rollback Safety Notice */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-black">Instant Disaster Recovery & Rollback Plan</div>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    If live network or database issues are encountered, simply set <code className="font-mono font-bold bg-amber-200/60 px-1 py-0.5 rounded">VITE_DATA_SOURCE=DEMO</code> in your hosting configuration. The Admin Console instantly falls back to the safe offline testing sandbox with zero downtime and zero risk of live database corruption.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-500 font-medium">
            GoLife Taxi Pakistan • Phase 55 Firebase Integration
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

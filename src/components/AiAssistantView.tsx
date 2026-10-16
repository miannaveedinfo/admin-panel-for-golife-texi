import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  calculateDriverPerformanceScore,
  evaluateDriverRisk,
  analyzeComplaintIntelligence,
  analyzeCityIntelligence,
  analyzeEarningsIntelligence,
  generateDailyAiSummary,
  DEFAULT_AUTOMATION_SETTINGS,
  DEFAULT_SCORE_WEIGHTS
} from '../services/aiIntelligenceService';
import {
  Driver,
  DriverPerformanceScore,
  DriverRiskProfile,
  AdminTask,
  AdminTaskStatus,
  SmartRecommendedAction,
  AutomationSettings,
  ScoreWeightsConfig
} from '../types';
import { formatPKR } from '../utils/i18n';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import { DriverProfileDrawer } from './DriverProfileDrawer';
import {
  Sparkles,
  Bot,
  MessageSquare,
  FileText,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Building,
  Car,
  DollarSign,
  ChevronRight,
  Filter,
  Search,
  ExternalLink,
  Shield,
  ThumbsUp,
  XCircle,
  HelpCircle,
  BarChart3,
  Flame,
  Printer
} from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const {
    drivers,
    rides,
    verifications,
    complaints,
    safetyIncidents,
    payouts,
    latePickupIncidents,
    driverSuspensions,
    driverDailySummaries,
    cities,
    automationSettings,
    updateAutomationSettings,
    adminTasks,
    updateAdminTaskStatus,
    assignAdminTask,
    aiChatMessages,
    sendAiQuery,
    executeAiRecommendation,
    setActiveTab,
    showToast
  } = useAdmin();

  const [activeSubTab, setActiveSubTab] = useState<
    'chat' | 'summary' | 'performance' | 'tasks' | 'settings' | 'intelligence'
  >('chat');

  // Chat State
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Performance Table State
  const [perfSearch, setPerfSearch] = useState('');
  const [perfRiskFilter, setPerfRiskFilter] = useState<string>('all');
  const [selectedDriverForDrawer, setSelectedDriverForDrawer] = useState<Driver | null>(null);

  // Task Center State
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | AdminTaskStatus>('all');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>('all');

  // Automation settings local draft
  const [localSettings, setLocalSettings] = useState<AutomationSettings>(() => ({
    ...DEFAULT_AUTOMATION_SETTINGS,
    ...(automationSettings || {}),
    scoreWeights: {
      ...DEFAULT_SCORE_WEIGHTS,
      ...(automationSettings?.scoreWeights || {})
    }
  }));

  // Sync if automationSettings changes
  React.useEffect(() => {
    if (automationSettings) {
      setLocalSettings({
        ...DEFAULT_AUTOMATION_SETTINGS,
        ...automationSettings,
        scoreWeights: {
          ...DEFAULT_SCORE_WEIGHTS,
          ...(automationSettings.scoreWeights || {})
        }
      });
    }
  }, [automationSettings]);

  // 1. Generate Driver Scores & Risk Profiles
  const driverProfiles = useMemo(() => {
    return (drivers || []).map((driver) => {
      const score = calculateDriverPerformanceScore(
        driver,
        rides,
        complaints,
        safetyIncidents,
        latePickupIncidents,
        automationSettings.scoreWeights
      );
      const risk = evaluateDriverRisk(
        driver,
        score,
        complaints,
        safetyIncidents,
        latePickupIncidents,
        automationSettings
      );
      return { driver, score, risk };
    });
  }, [drivers, rides, complaints, safetyIncidents, latePickupIncidents, automationSettings]);

  // 2. Generate Daily Operations Summary
  const dailySummary = useMemo(() => {
    return generateDailyAiSummary(
      drivers,
      rides,
      complaints,
      safetyIncidents,
      verifications,
      payouts,
      driverDailySummaries,
      latePickupIncidents,
      driverSuspensions
    );
  }, [
    drivers,
    rides,
    complaints,
    safetyIncidents,
    verifications,
    payouts,
    driverDailySummaries,
    latePickupIncidents,
    driverSuspensions
  ]);

  // 3. Generate City & Complaint Intelligence
  const complaintIntel = useMemo(() => {
    return analyzeComplaintIntelligence(complaints, drivers);
  }, [complaints, drivers]);

  const cityIntel = useMemo(() => {
    return analyzeCityIntelligence(cities, rides, drivers, complaints);
  }, [cities, rides, drivers, complaints]);

  const earningsIntel = useMemo(() => {
    return analyzeEarningsIntelligence(driverDailySummaries, rides);
  }, [driverDailySummaries, rides]);

  // Quick Chat Prompts
  const quickPrompts = [
    'How many drivers are online?',
    'How many rides completed today?',
    'Which drivers have the most late pickups?',
    'Which drivers are currently suspended?',
    'Which drivers need verification?',
    'Which city has the most rides?',
    'Which drivers earned the most today?',
    'How much commission generated today?',
    'Show daily operations summary'
  ];

  const handleSendChat = async (promptText?: string) => {
    const textToSend = promptText || inputPrompt;
    if (!textToSend.trim() || isProcessing) return;

    setIsProcessing(true);
    setInputPrompt('');
    try {
      await sendAiQuery(textToSend);
    } catch (err) {
      showToast('Error processing AI query', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAutomationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAutomationSettings(localSettings);
  };

  const handleResetSettings = () => {
    setLocalSettings(DEFAULT_AUTOMATION_SETTINGS);
    updateAutomationSettings(DEFAULT_AUTOMATION_SETTINGS);
    showToast('Reset to GoLife default automation thresholds', 'info');
  };

  // Filtered driver profiles for table
  const filteredProfiles = useMemo(() => {
    return driverProfiles.filter(({ driver, score, risk }) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(perfSearch.toLowerCase()) ||
        driver.city.toLowerCase().includes(perfSearch.toLowerCase()) ||
        (driver.vehicle?.plate || '').toLowerCase().includes(perfSearch.toLowerCase());

      const matchesRisk =
        perfRiskFilter === 'all' ||
        risk.riskLevel.toLowerCase() === perfRiskFilter.toLowerCase() ||
        score.performanceLevel.toLowerCase() === perfRiskFilter.toLowerCase();

      return matchesSearch && matchesRisk;
    });
  }, [driverProfiles, perfSearch, perfRiskFilter]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return (adminTasks || []).filter((task) => {
      const matchesStatus = taskStatusFilter === 'all' || task.status === taskStatusFilter;
      const matchesCategory = taskCategoryFilter === 'all' || task.category === taskCategoryFilter;
      return matchesStatus && matchesCategory;
    });
  }, [adminTasks, taskStatusFilter, taskCategoryFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <BackToDashboardButton />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#111827]">
                AI Operations Assistant & Performance Intelligence
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Rule-Assisted Intelligence • Decision Support
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Deterministic real-time operational telemetry, multi-factor driver risk scoring, and admin task orchestration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-600 font-medium">Demo Fleet Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E5E7EB] overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'chat'
              ? 'border-[#0F766E] text-[#0F766E] bg-white shadow-xs'
              : 'border-transparent text-[#6B7280] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Assistant Chat</span>
        </button>

        <button
          onClick={() => setActiveSubTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'summary'
              ? 'border-[#0F766E] text-[#0F766E] bg-white shadow-xs'
              : 'border-transparent text-[#6B7280] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Daily Operations Summary</span>
        </button>

        <button
          onClick={() => setActiveSubTab('performance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'performance'
              ? 'border-[#0F766E] text-[#0F766E] bg-white shadow-xs'
              : 'border-transparent text-[#6B7280] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Driver Risk & Scoring (0–100)</span>
          <span className="ml-1 px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
            {driverProfiles.filter((p) => p.risk.riskLevel === 'Critical' || p.risk.riskLevel === 'High').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'tasks'
              ? 'border-[#0F766E] text-[#0F766E] bg-white shadow-xs'
              : 'border-transparent text-[#6B7280] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Admin Task Center</span>
          <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
            {(adminTasks || []).filter((t) => t.status === 'Pending').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('intelligence')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'intelligence'
              ? 'border-[#0F766E] text-[#0F766E] bg-white shadow-xs'
              : 'border-transparent text-[#6B7280] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Metropolitan & Complaints Intel</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'settings'
              ? 'border-[#0F766E] text-[#0F766E] bg-white shadow-xs'
              : 'border-transparent text-[#6B7280] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Automation Rules</span>
        </button>
      </div>

      {/* SUB-TAB 1: AI ASSISTANT CHAT */}
      {activeSubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-3 bg-white border border-[#E5E7EB] rounded-2xl flex flex-col h-[700px] shadow-xs overflow-hidden">
            {/* Chat Header */}
            <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  <Bot className="w-4 h-4 text-[#0F766E]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">GoLife Operations Assistant</h2>
                  <p className="text-[11px] text-[#6B7280]">Real-time operational dispatcher & query engine</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date().toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>

            {/* Chat Message List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {aiChatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0F766E] to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-[#0F766E] text-white rounded-br-none'
                          : 'bg-white border border-[#E5E7EB] text-[#111827] rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className={`font-bold text-[11px] ${isUser ? 'text-teal-100' : 'text-[#0F766E]'}`}>
                          {isUser ? 'You (Admin)' : 'GoLife Operations Intelligence'}
                        </span>
                        <span className={`text-[10px] ${isUser ? 'text-teal-200' : 'text-[#9CA3AF]'}`}>
                          {msg.timestamp}
                        </span>
                      </div>

                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Structured Data Attachment (if returned by assistant) */}
                      {msg.structuredData && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                          {msg.structuredData.stats && msg.structuredData.stats.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {msg.structuredData.stats.map((st, i) => (
                                <div key={i} className="bg-slate-50 rounded-xl p-2 border border-slate-200/60">
                                  <div className="text-[10px] text-slate-500 font-medium">{st.label}</div>
                                  <div className="text-sm font-bold text-slate-900 mt-0.5">{st.value}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {msg.structuredData.records && msg.structuredData.records.length > 0 && (
                            <div className="space-y-1.5">
                              {msg.structuredData.records.map((rec) => (
                                <div
                                  key={rec.id}
                                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition"
                                >
                                  <div>
                                    <div className="font-bold text-slate-900">{rec.title}</div>
                                    <div className="text-[10px] text-slate-500">{rec.subtitle}</div>
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      rec.badgeColor || 'bg-slate-200 text-slate-800'
                                    }`}
                                  >
                                    {rec.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {msg.structuredData.recommendations && (
                            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-[11px] text-emerald-900 space-y-1">
                              <div className="font-bold flex items-center gap-1 text-emerald-800">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>AI Tactical Recommendations:</span>
                              </div>
                              <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                                {msg.structuredData.recommendations.map((rc, idx) => (
                                  <li key={idx}>{rc}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {msg.structuredData.actionButtons && msg.structuredData.actionButtons.length > 0 && (
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              {msg.structuredData.actionButtons.map((btn, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setActiveTab(btn.tab as any)}
                                  className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#0F766E] hover:bg-teal-100 border border-teal-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{btn.label}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-[#E5E7EB] bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Ask any question about drivers, rides, complaints, late pickups, cities, or revenue..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-[#111827] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isProcessing}
                  className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0d665f] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Quick Prompts & Operational Pulse Sidebar */}
          <div className="space-y-5">
            {/* Quick Prompts Box */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#111827] mb-2.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#0F766E]" />
                <span>Quick Diagnostic Prompts</span>
              </h3>
              <div className="space-y-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(prompt)}
                    className="w-full text-left p-2 rounded-xl text-xs text-slate-700 hover:text-[#0F766E] hover:bg-teal-50/70 border border-transparent hover:border-teal-200 transition flex items-center justify-between group cursor-pointer"
                  >
                    <span className="line-clamp-1">{prompt}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F766E] shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick System Health Box */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Dispatch Automation Standing</span>
              </h3>
              <div className="text-xs space-y-2 text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Late Pickup Trigger:</span>
                  <span className="font-mono font-bold text-slate-900">{automationSettings.latePickupThresholdMinutes} mins</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suspension Cutoff:</span>
                  <span className="font-mono font-bold text-slate-900">{automationSettings.latePickupSuspensionCount} strikes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cooling Duration:</span>
                  <span className="font-mono font-bold text-slate-900">{automationSettings.suspensionDurationHours} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Advisory Mode:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Decision-Support
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('settings')}
                className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Thresholds</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DAILY OPERATIONS SUMMARY */}
      {activeSubTab === 'summary' && (
        <div className="space-y-6">
          {/* Summary Actions Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Operations Report for {dailySummary.date} • Generated at {dailySummary.generatedAt}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
              <button
                onClick={() => showToast('Refreshed daily operations intelligence', 'success')}
                className="px-3 py-1.5 rounded-xl bg-[#0F766E] text-white text-xs font-bold hover:bg-[#0d665f] transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Live Telemetry</span>
              </button>
            </div>
          </div>

          {/* Primary Operations Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-[#6B7280]">Total Gross Turnover</div>
              <div className="text-xl font-bold text-[#111827] mt-1 font-mono">
                {formatPKR(dailySummary.earnings.totalGross)}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                GoLife Commission: {formatPKR(dailySummary.commission.platformCommission)} (15%)
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-[#6B7280]">Completed Rides</div>
              <div className="text-xl font-bold text-[#111827] mt-1">
                {dailySummary.ridePerformance.completed}{' '}
                <span className="text-xs font-normal text-slate-500">
                  / {dailySummary.ridePerformance.totalBookings}
                </span>
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                {dailySummary.ridePerformance.completionRate}% Completion Rate
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-[#6B7280]">Online Fleet Availability</div>
              <div className="text-xl font-bold text-[#111827] mt-1">
                {dailySummary.driverPerformance.onlineCount} Drivers
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {dailySummary.driverPerformance.activeTrips} currently on trips
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-[#6B7280]">Pending KYC Verifications</div>
              <div className="text-xl font-bold text-amber-700 mt-1">
                {dailySummary.verificationRequests.pendingCount} Candidates
              </div>
              <div className="text-[11px] text-amber-600 font-medium mt-1">
                Awaiting document inspection
              </div>
            </div>
          </div>

          {/* Priority Action Items & Urgent Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Actions */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Priority Administrative Actions</span>
              </h3>
              <div className="space-y-2.5">
                {dailySummary.priorityActions.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{act.action}</div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                          act.urgency === 'Critical'
                            ? 'bg-rose-100 text-rose-700'
                            : act.urgency === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {act.urgency} Urgency
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab(act.targetTab)}
                      className="px-3 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-bold hover:bg-[#0d665f] transition shrink-0 cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Watchlist Issues */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Critical Operations Watchlist</span>
              </h3>
              <div className="space-y-2.5">
                {dailySummary.importantIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DRIVER RISK & SCORING (0-100) */}
      {activeSubTab === 'performance' && (
        <div className="space-y-5">
          {/* Filter and Search Bar */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={perfSearch}
                onChange={(e) => setPerfSearch(e.target.value)}
                placeholder="Search driver by name, city, or plate..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={perfRiskFilter}
                onChange={(e) => setPerfRiskFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Risk Levels & Tiers</option>
                <option value="critical">Critical Risk</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
                <option value="needs improvement">Needs Improvement</option>
              </select>
            </div>
          </div>

          {/* Performance Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Driver & Vehicle</th>
                    <th className="py-3 px-4">Performance Score</th>
                    <th className="py-3 px-4">Trend</th>
                    <th className="py-3 px-4">Factor Breakdown</th>
                    <th className="py-3 px-4">Risk Level & Flags</th>
                    <th className="py-3 px-4">Smart Recommendation</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredProfiles.map(({ driver, score, risk }) => {
                    const scoreColor =
                      score.overallScore >= 80
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : score.overallScore >= 65
                        ? 'text-blue-700 bg-blue-50 border-blue-200'
                        : score.overallScore >= 50
                        ? 'text-amber-800 bg-amber-50 border-amber-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200';

                    const riskColor =
                      risk.riskLevel === 'Critical'
                        ? 'bg-rose-100 text-rose-700'
                        : risk.riskLevel === 'High'
                        ? 'bg-orange-100 text-orange-800'
                        : risk.riskLevel === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800';

                    return (
                      <tr key={driver.id} className="hover:bg-slate-50/70 transition">
                        {/* Driver & Vehicle */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                              {driver.name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-[#111827]">{driver.name}</div>
                              <div className="text-[11px] text-[#6B7280]">
                                {driver.vehicle?.plate || 'LE-2024'} • {driver.city}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Performance Score */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold px-2.5 py-0.5 rounded-lg border font-mono ${scoreColor}`}
                            >
                              {score.overallScore} / 100
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {score.performanceLevel}
                            </span>
                          </div>
                        </td>

                        {/* Trend */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 font-semibold text-[11px]">
                            {score.trend === 'improving' ? (
                              <span className="text-emerald-600 flex items-center gap-0.5">
                                <TrendingUp className="w-3.5 h-3.5" /> Improving
                              </span>
                            ) : score.trend === 'declining' ? (
                              <span className="text-rose-600 flex items-center gap-0.5">
                                <TrendingDown className="w-3.5 h-3.5" /> Declining
                              </span>
                            ) : (
                              <span className="text-slate-500">Stable</span>
                            )}
                          </div>
                        </td>

                        {/* Factor Breakdown */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 w-44">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-500">On-Time Pickup:</span>
                              <span className="font-bold font-mono">{score.factors.onTimePickup}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#0F766E] h-full rounded-full"
                                style={{ width: `${score.factors.onTimePickup}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Rating: {(driver.rating || 4.8).toFixed(1)} ★</span>
                              <span>Complaints: {score.factors.passengerComplaints < 75 ? 'Yes' : 'None'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Risk Level & Flags */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskColor}`}>
                              {risk.riskLevel} Risk
                            </span>
                            {risk.flags.length > 0 && (
                              <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                                {risk.flags[0]}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Smart Recommendation */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 text-[11px] block">
                              {risk.recommendedAction}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Decision Support Only
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {risk.recommendedAction !== 'Monitor' && (
                              <button
                                onClick={() => {
                                  executeAiRecommendation(driver.id, risk.recommendedAction);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 font-bold text-[11px] transition cursor-pointer"
                              >
                                Apply
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedDriverForDrawer(driver)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition cursor-pointer"
                            >
                              Inspect
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ADMIN TASK CENTER */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-5">
          {/* Task Center Filter Bar */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#111827] mr-1">Status:</span>
              {(['all', 'Pending', 'In Progress', 'Completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setTaskStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    taskStatusFilter === st
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#111827]">Category:</span>
              <select
                value={taskCategoryFilter}
                onChange={(e) => setTaskCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                <option value="driver_verification">Driver Verification</option>
                <option value="safety_report">Safety Incident</option>
                <option value="complaint_investigation">Complaint</option>
                <option value="late_pickup_check">Late Pickup</option>
                <option value="pending_payout">Pending Payout</option>
                <option value="suspension_expiry">Suspension Expiry</option>
              </select>
            </div>
          </div>

          {/* Task Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const priorityBadge =
                task.priority === 'Critical'
                  ? 'bg-rose-100 text-rose-700'
                  : task.priority === 'High'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-700';

              const isDone = task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition ${
                    isDone ? 'border-slate-200 opacity-60' : 'border-[#E5E7EB] hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityBadge}`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{task.createdAt}</span>
                  </div>

                  <h4 className="text-sm font-bold text-[#111827] mb-1">{task.title}</h4>
                  <p className="text-xs text-[#6B7280] mb-4 leading-relaxed">{task.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => updateAdminTaskStatus(task.id, e.target.value as AdminTaskStatus)}
                        className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-hidden"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {task.targetTab && (
                        <button
                          onClick={() => setActiveTab(task.targetTab as any)}
                          className="px-3 py-1 bg-[#0F766E] text-white text-xs font-bold rounded-lg hover:bg-[#0d665f] transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>{task.actionLabel || 'Execute'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: METROPOLITAN & COMPLAINT INTELLIGENCE */}
      {activeSubTab === 'intelligence' && (
        <div className="space-y-6">
          {/* Metropolitan Intelligence */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0F766E]" />
                  <span>Metropolitan Regional Fleet & Ride Intelligence</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Real-time supply vs demand across 7 provincial economic corridors
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cityIntel.map((ci) => (
                <div key={ci.city} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{ci.city}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ci.demandStatus === 'Needs Drivers'
                          ? 'bg-rose-100 text-rose-700'
                          : ci.demandStatus === 'High Demand'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {ci.demandStatus}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-1">
                    <div className="flex items-center justify-between">
                      <span>Completed Rides:</span>
                      <span className="font-bold text-slate-900">{ci.completedRides}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gross Turnover:</span>
                      <span className="font-bold text-slate-900 font-mono">{formatPKR(ci.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Online Drivers:</span>
                      <span className="font-bold text-slate-900">{ci.onlineDrivers} available</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cancellation:</span>
                      <span className="font-bold text-slate-900">{ci.cancellationRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complaint Categorization & Review Priority */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Passenger Complaint Intelligence & Priority Escalation</span>
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Automated categorization with repeat driver detection and dispute severity
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {complaintIntel.categories.map((cat) => (
                <div key={cat.category} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{cat.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : cat.severity === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cat.severity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Incidents Logged:</span>
                    <span className="font-bold text-slate-900">{cat.count} ({cat.percentage}%)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Repeat Drivers Flagged:</span>
                    <span className="font-bold text-rose-600">{cat.repeatDriverCount} drivers</span>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>Review Priority:</span>
                      <span className="font-bold font-mono">{cat.avgReviewPriority}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cat.avgReviewPriority >= 80 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${cat.avgReviewPriority}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: AUTOMATION & INTELLIGENCE RULES */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveAutomationSettings} className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0F766E]" />
                <span>Compliance & Late Pickup Thresholds</span>
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Configure automatic triggers and cooling-off intervals. Rule-based actions are transparently logged.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Late Pickup Threshold (Min)</label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={localSettings.latePickupThresholdMinutes}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      latePickupThresholdMinutes: Number(e.target.value)
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Arrival delays exceeding this duration count as strikes</p>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Suspension Strike Cutoff</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={localSettings.latePickupSuspensionCount}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      latePickupSuspensionCount: Number(e.target.value)
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Number of qualifying delays before 12h cooling-off</p>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Suspension Duration (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={localSettings.suspensionDurationHours}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      suspensionDurationHours: Number(e.target.value)
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Standard temporary suspension duration before reinstatement</p>
              </div>
            </div>
          </div>

          {/* Score Weights Configuration */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0F766E]" />
                <span>Multi-Factor Performance Score Weights (%)</span>
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Adjust relative weighting for the 0–100 composite Driver Performance Score
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {Object.entries(localSettings?.scoreWeights || DEFAULT_SCORE_WEIGHTS || {}).map(([key, weight]) => (
                <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 capitalize mb-1">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={weight}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          scoreWeights: {
                            ...(localSettings.scoreWeights || DEFAULT_SCORE_WEIGHTS),
                            [key]: Number(e.target.value)
                          }
                        })
                      }
                      className="w-full accent-[#0F766E]"
                    />
                    <span className="font-mono font-bold text-slate-900 w-8 text-right">{weight}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetSettings}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Reset to Defaults
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold hover:bg-[#0d665f] transition cursor-pointer shadow-xs"
              >
                Save Automation Settings
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Driver Profile Drawer Modal (if selected) */}
      {selectedDriverForDrawer && (
        <DriverProfileDrawer
          driver={selectedDriverForDrawer}
          onClose={() => setSelectedDriverForDrawer(null)}
        />
      )}
    </div>
  );
};

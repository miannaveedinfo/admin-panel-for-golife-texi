import React, { useState } from 'react';
import {
  PaymentTestSuiteResult,
  DriverWallet,
  TopUpRequest,
  CentralPaymentTransaction,
  PaymentProviderConfig,
  PaymentWebhookRecord,
  PaymentReconciliationItem
} from '../../types/paymentArchitecture';
import {
  runPhase56BTestSuite,
  runPhase59TestSuite,
  INITIAL_PAYMENT_PROVIDERS,
  INITIAL_WEBHOOK_LOGS,
  INITIAL_PAYMENT_RECONCILIATION_ITEMS
} from '../../services/centralPaymentService';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck,
  AlertTriangle,
  Zap,
  Lock,
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react';

interface PaymentTestSuiteTabProps {
  wallets: DriverWallet[];
  topUps: TopUpRequest[];
  transactions: CentralPaymentTransaction[];
  providers?: PaymentProviderConfig[];
  webhooks?: PaymentWebhookRecord[];
  reconciliations?: PaymentReconciliationItem[];
}

export const PaymentTestSuiteTab: React.FC<PaymentTestSuiteTabProps> = ({
  wallets,
  topUps,
  transactions,
  providers = INITIAL_PAYMENT_PROVIDERS,
  webhooks = INITIAL_WEBHOOK_LOGS,
  reconciliations = INITIAL_PAYMENT_RECONCILIATION_ITEMS
}) => {
  const [suiteMode, setSuiteMode] = useState<'phase59' | 'phase56b'>('phase59');
  const [isRunning, setIsRunning] = useState(false);

  // Compute test results dynamically
  const [phase59Results, setPhase59Results] = useState<PaymentTestSuiteResult[]>(() =>
    runPhase59TestSuite(wallets, topUps, transactions, providers, webhooks, reconciliations)
  );

  const [phase56bResults, setPhase56bResults] = useState<PaymentTestSuiteResult[]>(() =>
    runPhase56BTestSuite(wallets, topUps, transactions)
  );

  const activeResults = suiteMode === 'phase59' ? phase59Results : phase56bResults;
  const totalPassed = activeResults.filter((t) => t.passed).length;
  const allPassed = totalPassed === activeResults.length;

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      if (suiteMode === 'phase59') {
        const results = runPhase59TestSuite(
          wallets,
          topUps,
          transactions,
          providers,
          webhooks,
          reconciliations
        );
        setPhase59Results(results);
      } else {
        const results = runPhase56BTestSuite(wallets, topUps, transactions);
        setPhase56bResults(results);
      }
      setIsRunning(false);
    }, 450);
  };

  return (
    <div id="payment-test-suite-tab" className="space-y-6">
      {/* Test Suite Selector Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSuiteMode('phase59')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              suiteMode === 'phase59'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>Phase 59 Gateway Test Suite (22 Tests)</span>
          </button>

          <button
            onClick={() => setSuiteMode('phase56b')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              suiteMode === 'phase56b'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Phase 56-B Financial Ledger Suite (10 Tests)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 font-bold">
            Environment: DEMO MODE (Zero Real Secrets Required)
          </span>
        </div>
      </div>

      {/* Test Suite Summary Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs ${
          allPassed
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <span
            className={`p-3 rounded-2xl ${
              allPassed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
            }`}
          >
            {allPassed ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </span>
          <div>
            <h3 className="text-base font-black">
              {suiteMode === 'phase59'
                ? 'Phase 59 Automated Easypaisa, JazzCash & Gateway Foundation Test Suite'
                : 'Phase 56-B Automated Financial & Top-Up Compliance Test Suite'}
            </h3>
            <p className="text-xs opacity-90 mt-0.5 max-w-3xl leading-relaxed">
              {suiteMode === 'phase59'
                ? 'Validating Rs 100/20k limits, Easypaisa/JazzCash gateway processing, 5-minute operational target, webhook signature HMAC-SHA256, anti-replay idempotency defense, bank reconciliation, cash-only ride enforcement, zero secret leakage, and double-entry immutability.'
                : 'Validating Rs 100/Rs 20k boundaries, duplicate reference detection, state transitions, double-entry wallet ledger integrity, Cash-Only ride rules, and Demo Mode zero-secret protection.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">Pass Rate</div>
            <div className="text-xl font-black font-mono">
              {totalPassed} / {activeResults.length} Tests Passed
            </div>
          </div>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isRunning ? (
              <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Play className="w-4 h-4 text-amber-400" />
            )}
            <span>{isRunning ? 'Running All Assertions...' : 'Execute Suite'}</span>
          </button>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeResults.map((test) => (
          <div
            key={test.id}
            className={`p-4 rounded-2xl border transition shadow-xs space-y-2.5 ${
              test.passed ? 'bg-white border-slate-200' : 'bg-rose-50/60 border-rose-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  {test.id}
                </span>
                <h4 className="text-xs font-bold text-slate-900">{test.testName}</h4>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  test.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {test.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {test.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>

            {/* Scenario */}
            <div className="text-[11px] text-slate-500 font-medium">
              Scenario: <span className="text-slate-700">{test.scenario}</span>
            </div>

            {/* Assertion Message */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-800 font-mono">
              {test.message}
            </div>

            {/* Input / Output Inspection */}
            <details className="text-[10px] text-slate-500 cursor-pointer pt-1">
              <summary className="font-bold hover:text-slate-900 select-none">
                Inspect Test Payload &amp; Assertion State
              </summary>
              <div className="mt-2 p-2 rounded bg-slate-900 text-emerald-400 font-mono overflow-x-auto text-[10px]">
                <pre>{JSON.stringify({ input: test.input, output: test.output }, null, 2)}</pre>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedCountUp } from './components/AnimatedCountUp';
import { 
  Building, 
  ShieldCheck, 
  Coins, 
  Info, 
  CalendarCheck, 
  TrendingUp, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Wallet, 
  FileText,
  HelpCircle,
  Percent,
  Check,
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertTriangle,
  Search,
  Scale,
  Coffee
} from 'lucide-react';

interface AmortizationYear {
  year: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export default function App() {
  // Input states
  const [salary, setSalary] = useState<number>(15000);
  const [interestRate, setInterestRate] = useState<number>(6.0);
  const [repaymentYears, setRepaymentYears] = useState<number>(15);
  
  // Custom loan request mode & requested amount
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [requestedAmount, setRequestedAmount] = useState<number>(1110000);

  // Expanded UI panels
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [showPolicyDetails, setShowPolicyDetails] = useState<boolean>(false);

  // PDF modal states
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [pdfModalTab, setPdfModalTab] = useState<'viewer' | 'calculator'>('viewer');
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfViewMode, setPdfViewMode] = useState<'continuous' | 'paginated'>('continuous');

  // Sidebar link click handler
  const handleSidebarPageClick = (page: number) => {
    setPdfPage(page);
    if (pdfViewMode === 'continuous') {
      const container = document.getElementById('pdf-scroll-container');
      const pageEl = document.getElementById(`pdf-page-${page}`);
      if (container && pageEl) {
        container.scrollTo({
          top: pageEl.offsetTop - container.offsetTop - 16,
          behavior: 'smooth'
        });
      }
    }
  };

  // Priority scorecard states
  const [scoreWorkUnit, setScoreWorkUnit] = useState<'branch' | 'ho'>('branch');
  const [scoreAppraisal, setScoreAppraisal] = useState<number>(105);
  const [scorePriorLoan, setScorePriorLoan] = useState<'none' | 'settled' | 'active'>('none');
  const [scoreJobCategory, setScoreJobCategory] = useState<'managerial' | 'non-managerial'>('non-managerial');
  const [scoreSatisfaction, setScoreSatisfaction] = useState<number>(15); // out of 20
  const [scoreWarning, setScoreWarning] = useState<'none' | 'one_year' | 'six_months' | 'three_months'>('none');

  // Prioritization scorecard calculations
  const calcAppraisalScore = () => {
    if (scoreWorkUnit === 'branch') {
      if (scoreAppraisal > 125) return 60;
      if (scoreAppraisal > 100) return 55;
      if (scoreAppraisal > 85) return 50;
      if (scoreAppraisal > 75) return 45;
      if (scoreAppraisal > 50) return 40;
      return 0;
    } else {
      if (scoreAppraisal > 95) return 40;
      if (scoreAppraisal > 90) return 35;
      if (scoreAppraisal > 85) return 30;
      if (scoreAppraisal > 75) return 25;
      if (scoreAppraisal > 50) return 20;
      return 0;
    }
  };

  const calcPriorLoanScore = () => {
    if (scorePriorLoan === 'none') return 20;
    if (scorePriorLoan === 'settled') return 10;
    return 5;
  };

  const calcJobCategoryScore = () => {
    return scoreJobCategory === 'managerial' ? 20 : 10;
  };

  const calcDeductionScore = () => {
    if (scoreWarning === 'one_year') return 10;
    if (scoreWarning === 'six_months') return 6;
    if (scoreWarning === 'three_months') return 4;
    return 0;
  };

  const activeAppraisalPoints = calcAppraisalScore();
  const activePriorLoanPoints = calcPriorLoanScore();
  const activeJobPoints = calcJobCategoryScore();
  const activeSatisfactionPoints = scoreWorkUnit === 'ho' ? scoreSatisfaction : 0;
  const activeDeductionPoints = calcDeductionScore();

  const totalPriorityScore = Math.max(0, Math.min(100, activeAppraisalPoints + activePriorLoanPoints + activeJobPoints + activeSatisfactionPoints - activeDeductionPoints));

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  // Policy calculation
  const maxEligibleLoan = (salary / 2) * 148;

  // Sync requested amount when policy maximum changes or mode is switched
  useEffect(() => {
    if (!isCustomAmount) {
      setRequestedAmount(maxEligibleLoan);
    } else {
      // Ensure requested amount is within valid boundaries
      if (requestedAmount > maxEligibleLoan) {
        setRequestedAmount(maxEligibleLoan);
      }
    }
  }, [salary, isCustomAmount, maxEligibleLoan]);

  // Calculations based on requested amount (or max loan if not in custom mode)
  const activeLoanAmount = isCustomAmount ? requestedAmount : maxEligibleLoan;

  const monthlyRate = (interestRate / 100) / 12;
  const totalMonths = repaymentYears * 12;

  let monthlyPayment = 0;
  if (activeLoanAmount > 0 && totalMonths > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = activeLoanAmount / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPayment = activeLoanAmount * (monthlyRate * factor) / (factor - 1);
    }
  }

  const totalRepayment = monthlyPayment * totalMonths;
  const totalInterest = Math.max(0, totalRepayment - activeLoanAmount);

  // Amortization schedule generator
  const amortizationSchedule: AmortizationYear[] = [];
  let remainingBalance = activeLoanAmount;

  for (let year = 1; year <= repaymentYears; year++) {
    let yearPrincipalPaid = 0;
    let yearInterestPaid = 0;
    let yearPayment = 0;

    for (let month = 1; month <= 12; month++) {
      if (remainingBalance <= 0) break;
      const interestForMonth = remainingBalance * monthlyRate;
      const principalForMonth = Math.min(monthlyPayment - interestForMonth, remainingBalance);

      yearInterestPaid += interestForMonth;
      yearPrincipalPaid += principalForMonth;
      yearPayment += (interestForMonth + principalForMonth);
      remainingBalance -= principalForMonth;
    }

    amortizationSchedule.push({
      year,
      payment: yearPayment,
      principalPaid: yearPrincipalPaid,
      interestPaid: yearInterestPaid,
      remainingBalance: Math.max(0, remainingBalance)
    });

    if (remainingBalance <= 0) break;
  }

  // Formatting helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const percentPrincipal = totalRepayment > 0 ? (activeLoanAmount / totalRepayment) * 100 : 100;
  const percentInterest = totalRepayment > 0 ? (totalInterest / totalRepayment) * 100 : 0;

  // PDF replication page rendering engine
  const renderPdfPage = (page: number) => {
    switch(page) {
      case 1:
        return (
          <div className="flex flex-col items-center justify-between h-full py-10 text-center select-text">
            <div className="space-y-3">
              <div className="text-sm font-extrabold text-bunna-800 tracking-widest uppercase">BUNNA BANK S.C.</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Human Resource & Credit Operations Division</div>
            </div>
            
            <div className="my-16 space-y-5 max-w-xl">
              <div className="w-16 h-1 bg-bunna-700 mx-auto" />
              <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight uppercase">
                Staff Credit Facility Allocation &amp; Prioritization Guideline
              </h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Procedural Directives &amp; Resource Optimization Rules
              </p>
              <div className="w-16 h-1 bg-bunna-700 mx-auto" />
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Document Information</p>
              <p>Reference Code: <strong className="text-slate-900 font-extrabold">BB/HRD/CRED-2026/04</strong></p>
              <p>Effective Date: <strong className="text-slate-900 font-extrabold">July 1, 2026</strong></p>
              <p>Security Classification: <strong className="text-rose-600 font-extrabold">STRICTLY CONFIDENTIAL - INTERNAL USE ONLY</strong></p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 text-slate-800 select-text">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Table of Contents</h2>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Document Map</p>
            </div>
            <div className="space-y-3 text-xs font-bold text-slate-700">
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                <span>Preamble: Institutional Context</span>
                <span>Page 3</span>
              </div>
              <div className="text-bunna-800 uppercase tracking-wider text-[10px] pt-2">Part 1: Basic Declarations</div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>1.1 Regulatory Background &amp; Philosophy</span>
                <span>Page 4</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>1.2 Core Objectives &amp; Strategic Value</span>
                <span>Page 5</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>1.3 Application Scope &amp; Target Staff Groups</span>
                <span>Page 5</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>1.4 Staff Concession Benefits &amp; Interest Limits</span>
                <span>Page 6</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>1.5 Joint Credit Committee Oversight Protocols</span>
                <span>Page 7</span>
              </div>
              <div className="text-bunna-800 uppercase tracking-wider text-[10px] pt-2">Part 2: Priority Scoring Framework</div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                <span>2.1 Mathematical Prioritization Scoring Weights Table</span>
                <span>Page 8</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>2.2.1 Operating Appraisal KPI Metrics Scoring</span>
                <span>Page 9</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>2.2.2 Historic Credit Benefit Allocation Points</span>
                <span>Page 10</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>2.2.3 Staff Grade &amp; Job Category Weighting</span>
                <span>Page 10</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>2.2.4 Head Office Support Satisfaction System</span>
                <span>Page 11</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>2.3 Disciplinary Actions &amp; Deductions Penalties Table</span>
                <span>Page 12</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>2.4 Funds Allocation Rules &amp; Queue Management</span>
                <span>Page 13</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>2.5 Process Execution &amp; Tie-Breaker Priority rules</span>
                <span>Page 14</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1 pl-4">
                <span>2.6 Departmental Oversight Roles &amp; Responsibilities</span>
                <span>Page 15</span>
              </div>
              <div className="text-bunna-800 uppercase tracking-wider text-[10px] pt-2">Part 3: Implementation</div>
              <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                <span>3.1 Policy Signatures, Seals, &amp; Authorization Enforcements</span>
                <span>Page 16</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Preamble</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">Institutional Context</h2>
            </div>
            <p className="font-medium text-slate-600">
              Bunna Bank S.C. acknowledges that its workforce is the central pillar of its long-term sustainable growth and operational success in the highly competitive Ethiopian financial services landscape. Facilitating secure access to credit remains a vital instrument for maintaining staff motivation, enhancing retention, and fostering deep institutional alignment.
            </p>
            <p className="font-medium text-slate-600">
              However, the expansion of credit facilities must be calibrated against the bank's general risk appetite, regulatory compliance standards set by the National Bank of Ethiopia, and liquidity safeguards. Sound management of staff loans is required to avoid unchecked resource allocation and ensure equitable access across all operational divisions.
            </p>
            <div className="bg-slate-50 p-4 border-l-4 border-bunna-700 rounded-r-xl space-y-2 mt-4">
              <span className="text-[10px] font-black text-bunna-800 uppercase tracking-wider block">Directive Statement</span>
              <p className="font-semibold text-slate-700">
                "All staff credit disbursements shall be processed exclusively in accordance with the formulas, caps, priority rankings, and validation protocols detailed within this document. No arbitrary exceptions shall be sanctioned under any circumstances."
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 1: Basic Declarations</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">1.1 Regulatory Background &amp; Philosophy</h2>
            </div>
            <p className="font-medium text-slate-600">
              This directive replaces all previous internal publications regarding staff credit facilities. Its formulation balances the human resources philosophy of Bunna Bank S.C. with modern banking risk management protocols.
            </p>
            <p className="font-medium text-slate-600">
              Staff credit lines are established not as simple entitlements, but as concessionary strategic financial vehicles. Under this operational design, credit allocations must align with individual performance outputs (KPI points), tenure, and institutional compliance behavior.
            </p>
            <h3 className="font-black text-slate-800 mt-4 text-[11px] uppercase">1.1.2 Ethical Alignment &amp; Standards</h3>
            <p className="font-medium text-slate-600">
              In accordance with Bunna Bank's ethical codes, staff credit allocations are subjected to audit to ensure zero-tolerance of nepotism. Prioritization scores are calculated systematically to eliminate subjective bias during queue evaluations.
            </p>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 1: Basic Declarations</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">1.2 Objectives &amp; 1.3 Scope of Application</h2>
            </div>
            <h3 className="font-black text-slate-800 text-[11px] uppercase">1.2.1 Primary Objectives</h3>
            <ul className="list-disc pl-4 space-y-2 font-medium text-slate-600">
              <li>
                <strong className="text-slate-800 font-extrabold">Retain High Performers:</strong> Anchor highly skilled professional talent inside operating divisions through custom credit lines linked to KPI success.
              </li>
              <li>
                <strong className="text-slate-800 font-extrabold">Standardize Disbursement Limits:</strong> Apply strict, mathematical caps on loan-to-income multiples to guarantee comfortable debt-service ratios.
              </li>
              <li>
                <strong className="text-slate-800 font-extrabold">Maintain Liquidity Buffers:</strong> Buffer the bank's core assets by pacing employee loan disbursements in strict compliance with quarterly budget allocations.
              </li>
            </ul>
            <h3 className="font-black text-slate-800 mt-4 text-[11px] uppercase">1.3.1 Target Groups</h3>
            <p className="font-medium text-slate-600">
              This guideline applies exclusively to permanent employees of Bunna Bank S.C. who have successfully completed their probationary tenure. Temporary personnel, interns, contractors, and third-party outsource service providers are explicitly excluded from these concessionary facilities.
            </p>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 1: Basic Declarations</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">1.4 Staff Concession Benefits &amp; Interest Limits</h2>
            </div>
            <p className="font-medium text-slate-600">
              Bunna Bank offers highly optimized interest rates for its workforce, designed to ease debt service burdens. The standard staff interest rate is capped considerably below commercial rates, currently set at a baseline of <strong className="text-slate-800 font-extrabold">6.0% per annum</strong>.
            </p>
            <h3 className="font-black text-slate-800 text-[11px] uppercase">1.4.2 Debt Service Ratio &amp; Multiple Limit Rule</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-bold text-slate-700">
              <p>The maximum loan sizing is constrained by two strict rules:</p>
              <ul className="list-decimal pl-4 space-y-1 text-[11px] font-medium text-slate-600">
                <li>
                  <strong className="text-slate-800 font-bold">The 50% Salary Rule:</strong> Monthly repayments (Principal + Interest) shall never exceed 50% of the employee's gross monthly salary.
                </li>
                <li>
                  <strong className="text-slate-800 font-bold">The Multiple Rule:</strong> The maximum total facility size shall be capped at exactly <strong className="text-bunna-800 font-extrabold">74 times</strong> the gross monthly salary (or equivalently, 148 times half-salary).
                </li>
              </ul>
            </div>
            <p className="font-medium text-slate-600">
              These restrictions are intended to prevent staff over-indebatedness, ensuring that employees maintain comfortable net take-home salaries for general household livelihoods.
            </p>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 1: Basic Declarations</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">1.5 Joint Credit Committee Oversight Protocols</h2>
            </div>
            <p className="font-medium text-slate-600">
              All staff credit applications undergo rigorous screening by the Staff Joint Credit Committee (SJCC). This committee comprises representatives from:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-medium text-slate-600">
              <li>Human Resource Development Department (HRD)</li>
              <li>Credit Appraisal &amp; Risk Operations Department</li>
              <li>Finance &amp; Treasury Department (to audit liquid assets)</li>
              <li>Staff Association Representatives (as observers)</li>
            </ul>
            <h3 className="font-black text-slate-800 mt-4 text-[11px] uppercase">1.5.3 Appeal and Modification Mechanisms</h3>
            <p className="font-medium text-slate-600">
              Should an employee dispute their priority ranking or score, they may submit a formal appeal to the SJCC within ten business days of quarterly list publications. The decision of the SJCC, following verification of performance appraisals, shall be final.
            </p>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 2: Priority Scoring Framework</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">2.1 Mathematical Prioritization Scoring Weights</h2>
            </div>
            <p className="font-medium text-slate-600">
              When request volumes exceed the quarterly budget allocation, a strict mathematical ranking score of 100 maximum points determines the queue order:
            </p>
            <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-extrabold uppercase">
                  <th className="p-2">Scoring Dimension</th>
                  <th className="p-2 text-right">Branch / CRBBO Staff</th>
                  <th className="p-2 text-right">Head Office Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600 font-medium">
                <tr>
                  <td className="p-2 font-bold text-slate-900">Performance Appraisal Score (KPI points)</td>
                  <td className="p-2 text-right text-slate-900 font-bold">Max 60 Points</td>
                  <td className="p-2 text-right text-slate-900 font-bold">Max 40 Points</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-slate-900">Prior Credit Benefit History</td>
                  <td className="p-2 text-right text-slate-900 font-bold">Max 20 Points</td>
                  <td className="p-2 text-right text-slate-900 font-bold">Max 20 Points</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-slate-900">Staff Position Category Grade</td>
                  <td className="p-2 text-right text-slate-900 font-bold">Max 20 Points</td>
                  <td className="p-2 text-right text-slate-900 font-bold">Max 20 Points</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-slate-900">Support Satisfaction System Rating</td>
                  <td className="p-2 text-right text-slate-400">Not Applicable</td>
                  <td className="p-2 text-right text-slate-900 font-bold">Max 20 Points</td>
                </tr>
                <tr className="bg-bunna-50/40 text-bunna-950 font-extrabold border-t border-slate-300">
                  <td className="p-2">TOTAL CORE WEIGHT LIMIT</td>
                  <td className="p-2 text-right text-bunna-800">100 Points</td>
                  <td className="p-2 text-right text-bunna-800">100 Points</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 9:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 2: Priority Scoring Framework</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">2.2.1 Operating Appraisal KPI Metrics Scoring</h2>
            </div>
            <p className="font-medium text-slate-600">
              The Performance Appraisal Score reflects the latest approved quarterly key performance indicators (KPI). Due to their high-impact contact roles, Branch Staff appraisal metrics carry a heavier maximum weight (60 points) than Head Office roles (40 points).
            </p>
            <div className="space-y-3 font-medium text-slate-600 mt-4">
              <div className="border-l-2 border-bunna-600 pl-3">
                <span className="text-[10px] font-black text-slate-800 uppercase block">Branch / District / CRBBO Scale:</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] mt-1">
                  <li>Above 125 Appraisal Points = <strong className="text-slate-800">60 Scorecard Points</strong></li>
                  <li>101 to 125 Appraisal Points = <strong className="text-slate-800">55 Scorecard Points</strong></li>
                  <li>86 to 100 Appraisal Points = <strong className="text-slate-800">50 Scorecard Points</strong></li>
                  <li>76 to 85 Appraisal Points = <strong className="text-slate-800">45 Scorecard Points</strong></li>
                </ul>
              </div>
              <div className="border-l-2 border-slate-400 pl-3">
                <span className="text-[10px] font-black text-slate-800 uppercase block">Head Office (HO) Scale:</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] mt-1">
                  <li>Above 95 Appraisal Points = <strong className="text-slate-800">40 Scorecard Points</strong></li>
                  <li>91 to 95 Appraisal Points = <strong className="text-slate-800">35 Scorecard Points</strong></li>
                  <li>86 to 90 Appraisal Points = <strong className="text-slate-800">30 Scorecard Points</strong></li>
                  <li>76 to 85 Appraisal Points = <strong className="text-slate-800">25 Scorecard Points</strong></li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 2: Priority Scoring Framework</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">2.2.2 Historic Benefit &amp; 2.2.3 Position Grade Points</h2>
            </div>
            <h3 className="font-black text-slate-800 text-[11px] uppercase">2.2.2 Historic Credit Benefit Points</h3>
            <p className="font-medium text-slate-600">
              To guarantee that credit assets are distributed equitably across the entire workforce, employees who have never benefited from concessionary credit are prioritized:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-medium text-slate-600">
              <li><strong className="text-slate-800 font-extrabold">Never Received Loan:</strong> Earns <strong className="text-slate-800">20 Scorecard Points</strong></li>
              <li><strong className="text-slate-800 font-extrabold">Settled Prior Loan:</strong> Earns <strong className="text-slate-800">10 Scorecard Points</strong></li>
              <li><strong className="text-slate-800 font-extrabold">Active Staff Loan:</strong> Earns <strong className="text-slate-800">5 Scorecard Points</strong></li>
            </ul>
            <h3 className="font-black text-slate-800 mt-4 text-[11px] uppercase">2.2.3 Staff Grade Category Points</h3>
            <p className="font-medium text-slate-600">
              Position categories reflect administrative weight and tenure risks:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-medium text-slate-600">
              <li><strong className="text-slate-800 font-extrabold">Managerial Grades (G11 - Executive):</strong> Earns <strong className="text-slate-800">20 Scorecard Points</strong></li>
              <li><strong className="text-slate-800 font-extrabold">Non-Managerial Grades (G1 - G10):</strong> Earns <strong className="text-slate-800">10 Scorecard Points</strong></li>
            </ul>
          </div>
        );
      case 11:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 2: Priority Scoring Framework</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">2.2.4 Head Office Support Satisfaction System</h2>
            </div>
            <p className="font-medium text-slate-600">
              For Head Office employees, a dedicated portion of their scorecard (<strong className="text-slate-800 font-extrabold">20 points maximum</strong>) depends on the quarterly Service Level Agreement (SLA) feedback.
            </p>
            <p className="font-medium text-slate-600">
              Branches, Districts, and CRBBOs rate HO Support units on a 1-to-5 star system evaluating:
            </p>
            <ul className="list-disc pl-4 space-y-1.5 font-medium text-slate-600">
              <li>
                <strong className="text-slate-800 font-bold">Responsiveness:</strong> Turnaround times on branch requests and technical tickets.
              </li>
              <li>
                <strong className="text-slate-800 font-bold">Accuracy:</strong> Quality and precision of operational support delivered to branch networks.
              </li>
              <li>
                <strong className="text-slate-800 font-bold">Collaboration:</strong> Inter-personal communication effectiveness.
              </li>
            </ul>
            <p className="font-medium text-slate-600">
              Average scores are converted into scorecard priority points, motivating Head Office teams to deliver excellent support to branch operations.
            </p>
          </div>
        );
      case 12:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 2: Priority Scoring Framework</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">2.3 Disciplinary Penalties &amp; 2.4 Deductions Table</h2>
            </div>
            <p className="font-medium text-slate-600">
              Any formal disciplinary actions, compliance failures, or negative audit findings trigger systematic deductions from the employee's total prioritization score.
            </p>
            <table className="w-full text-left border border-rose-100 rounded-lg overflow-hidden text-[10px]">
              <thead>
                <tr className="bg-rose-50 text-rose-950 border-b border-rose-200 font-extrabold uppercase">
                  <th className="p-2">Offense Severity Category</th>
                  <th className="p-2 text-right">Points Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 text-slate-600 font-semibold">
                <tr>
                  <td className="p-2">First Written Warning (issued within last 3 months)</td>
                  <td className="p-2 text-right text-rose-700 font-black">-4 Points</td>
                </tr>
                <tr>
                  <td className="p-2">Second Written Warning (issued within last 6 months)</td>
                  <td className="p-2 text-right text-rose-700 font-black">-6 Points</td>
                </tr>
                <tr>
                  <td className="p-2">Final Warning / Ethical Breach finding (within last 12 months)</td>
                  <td className="p-2 text-right text-rose-700 font-black">-10 Points</td>
                </tr>
                <tr>
                  <td className="p-2">Pending active internal fraud audit</td>
                  <td className="p-2 text-right text-rose-700 font-black">Suspended Facility Eligibility</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 13:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 2: Priority Scoring Framework</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">2.4.3 Quarterly Fund Allocation Rules</h2>
            </div>
            <p className="font-medium text-slate-600">
              Staff credit disbursements are managed in quarterly liquidity cycles. The Board of Directors allocates a portion of liquid reserves for staff facilities every fiscal year.
            </p>
            <p className="font-medium text-slate-600">
              If the cumulative value of approved loan applications exceeds the quarterly allocation, applications are queued by score. Standard liquidity buffers mandate that:
            </p>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">Rule of Rollover:</span>
              <p className="font-medium text-slate-600">
                "Applications that cannot be cleared in the active quarter due to budget caps are rolled over into the next quarter's queue, receiving an automatic priority bonus of <strong className="text-slate-800 font-extrabold">+5 points</strong> for the next cycle."
              </p>
            </div>
          </div>
        );
      case 14:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 2: Priority Scoring Framework</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">2.5 Process Execution &amp; Tie-Breaker Priority Rules</h2>
            </div>
            <p className="font-medium text-slate-600">
              When two or more applicants register identical prioritization scores, ties are resolved using the following sequential hierarchy:
            </p>
            <div className="space-y-3 font-semibold text-slate-700">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-bunna-50 border border-bunna-200 flex items-center justify-center text-[10px] font-black text-bunna-800 shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className="text-[11px] font-black text-slate-800">Continuous Service Tenure:</h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">The employee with longer continuous permanent service at Bunna Bank is placed ahead in the queue.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-bunna-50 border border-bunna-200 flex items-center justify-center text-[10px] font-black text-bunna-800 shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="text-[11px] font-black text-slate-800">Appraisal Score Metric (KPI):</h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">If tenure is equal, the employee with the higher average appraisal score across the last four quarters is favored.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-bunna-50 border border-bunna-200 flex items-center justify-center text-[10px] font-black text-bunna-800 shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className="text-[11px] font-black text-slate-800">Employee Age Seniority:</h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">If a tie remains, the older employee by birthdate is prioritized.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 15:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 2: Priority Scoring Framework</span>
              <h2 className="text-sm font-black text-slate-900 uppercase">2.6 Departmental Oversight Roles &amp; Responsibilities</h2>
            </div>
            <p className="font-medium text-slate-600">
              Responsibility for running this prioritization model is split across key operational stakeholders:
            </p>
            <ul className="list-disc pl-4 space-y-2 font-medium text-slate-600">
              <li>
                <strong className="text-slate-800 font-extrabold">Human Resource Development:</strong> Provides quarterly verified performance appraisal scores and monitors disciplinary actions or warnings.
              </li>
              <li>
                <strong className="text-slate-800 font-extrabold">Credit Operations Department:</strong> Analyzes loan repayment capacities, debt service ratios, and ensures security verification.
              </li>
              <li>
                <strong className="text-slate-800 font-extrabold">Branch Managers:</strong> Verify employee salary statements and process initial application uploads to the HR portal.
              </li>
            </ul>
          </div>
        );
      case 16:
        return (
          <div className="space-y-4 text-slate-800 text-xs leading-relaxed font-semibold select-text flex flex-col justify-between h-full select-text">
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <span className="text-[9px] font-black text-bunna-700 uppercase tracking-widest">Part 3: Miscellaneous</span>
                <h2 className="text-sm font-black text-slate-900 uppercase">3.1 Signatures &amp; Authorization Enforcements</h2>
              </div>
              <p className="font-medium text-slate-600">
                This document is officially approved by the Board of Directors of Bunna Bank S.C. and HR operations.
              </p>
              <p className="font-medium text-slate-600">
                The provisions herein take full force and effect across all branches, district offices, and central Head Office units starting <strong className="text-slate-800">July 1, 2026</strong>.
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col items-center text-[10px] font-bold text-slate-500">
              <div className="space-y-4 text-center">
                <div className="h-10 flex items-end justify-center">
                  <span className="border-b border-slate-300 w-32 block italic font-medium">Approved</span>
                </div>
                <div>
                  <p className="font-black text-slate-800 text-xs uppercase tracking-wider">Board of Directors</p>
                  <p className="text-[9px] uppercase tracking-wider">Bunna Bank S.C. Executive Committee</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800 antialiased font-sans selection:bg-bunna-200 selection:text-bunna-900 relative overflow-x-hidden">
      
      {/* Premium Decorative background blur blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-bunna-200/40 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-100/50 blur-[150px] pointer-events-none -z-10" />

      {/* Header / Brand Navigation */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-bunna-700 to-bunna-900 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-bunna-900/15 ring-1 ring-white/20">
              <Building className="text-white w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">Bunna Bank</h1>
              <p className="text-[10px] sm:text-xs font-bold text-bunna-600 uppercase tracking-[0.2em]">Staff Loan Calculator</p>
            </div>
          </div>
          
          <div className="relative flex flex-col items-center select-none pt-2.5">
            {/* Hanging ropes to make it literally a hanging sign */}
            <div className="absolute top-[-18px] flex justify-between w-14 h-[18px] pointer-events-none">
              <div className="w-[1.5px] bg-gradient-to-b from-slate-200 to-amber-700/60" />
              <div className="w-[1.5px] bg-gradient-to-b from-slate-200 to-amber-700/60" />
            </div>

            {/* Animating swinging hanging sign */}
            <motion.a
              href="https://ye-buna.com/kassahunmulatu"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-amber-700 via-[#825330] to-amber-950 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-amber-950/15 hover:shadow-lg hover:shadow-amber-950/25 border-t border-amber-500/40 border-b border-amber-950/60 transition-all cursor-pointer group origin-top"
              animate={{ 
                rotate: [2, -2, 1.5, -1.5, 2],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ 
                scale: 1.05,
                rotate: [-5, 5, -3, 3, 0],
                transition: { duration: 0.5 }
              }}
            >
              {/* Glowing notification dot */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>

              <Coffee className="w-4 h-4 text-amber-200 group-hover:animate-bounce transition-transform" />
              <span className="tracking-wide">Buy me Coffee</span>
            </motion.a>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative z-10">
        
        {/* Left Column: Interactive Settings and Policy Parameters */}
        <div id="calculator-inputs" className="w-full lg:w-[45%] flex flex-col gap-6 sm:gap-8">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl sm:rounded-[2rem] shadow-xl shadow-slate-100/40 p-5 sm:p-8 border border-white">
            <div className="mb-6 sm:mb-8">
              <span className="text-[11px] font-extrabold text-bunna-600 bg-bunna-50 border border-bunna-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Step 1
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-3">Loan parameters</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed">
                Adjust your salary details, repayment timeline, and interest rates to calculate maximum eligible thresholds.
              </p>
            </div>

            <div className="space-y-5 sm:space-y-6">
              
              {/* Gross Monthly Salary */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-300 focus-within:ring-2 focus-within:ring-bunna-600 focus-within:bg-white group">
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="salary" className="text-xs sm:text-sm font-bold text-slate-700">
                    Gross Monthly Salary
                  </label>
                  <span className="text-[10px] font-bold text-bunna-800 bg-bunna-100/60 px-2 py-0.5 rounded-md">
                    ETB
                  </span>
                </div>
                
                <div className="relative flex items-center mb-1">
                  <span className="absolute left-3 text-slate-400 font-extrabold text-lg sm:text-xl">Br.</span>
                  <input 
                    id="salary"
                    type="number" 
                    value={salary}
                    min={2000}
                    max={500000}
                    step={1000}
                    onChange={(e) => setSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-transparent border-none text-xl sm:text-2xl font-extrabold text-slate-900 focus:outline-none focus:ring-0"
                  />
                </div>

                <div className="relative pt-2 pb-1">
                  <input 
                    type="range" 
                    min={2000} 
                    max={200000} 
                    step={1000} 
                    value={salary} 
                    onChange={(e) => setSalary(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-bunna-700"
                    style={{
                      background: `linear-gradient(to right, #7a4534 0%, #7a4534 ${Math.min(100, ((salary - 2000) / (200000 - 2000)) * 100)}%, #e5e7eb ${Math.min(100, ((salary - 2000) / (200000 - 2000)) * 100)}%, #e5e7eb 100%)`,
                      height: '6px',
                      borderRadius: '999px'
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                    <span>Br. 2,000</span>
                    <span>Br. 200,000</span>
                  </div>
                </div>
              </div>

              {/* Annual Interest Rate */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-300 focus-within:ring-2 focus-within:ring-bunna-600 focus-within:bg-white group">
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="interestRate" className="text-xs sm:text-sm font-bold text-slate-700">
                    Annual Interest Rate
                  </label>
                  <span className="text-[10px] font-bold text-bunna-800 bg-bunna-100/60 px-2 py-0.5 rounded-md">
                    % per annum
                  </span>
                </div>
                
                <div className="relative flex items-center mb-1">
                  <input 
                    id="interestRate"
                    type="number" 
                    value={interestRate}
                    min={0}
                    max={25}
                    step={0.1}
                    onChange={(e) => setInterestRate(Math.min(25, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-full px-2 py-2 sm:py-2.5 bg-transparent border-none text-xl sm:text-2xl font-extrabold text-slate-900 focus:outline-none focus:ring-0"
                  />
                  <span className="absolute right-3 text-slate-400 font-extrabold text-lg sm:text-xl">%</span>
                </div>

                <div className="relative pt-2 pb-1">
                  <input 
                    type="range" 
                    min={0} 
                    max={25} 
                    step={0.5} 
                    value={interestRate} 
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-bunna-700"
                    style={{
                      background: `linear-gradient(to right, #7a4534 0%, #7a4534 ${(interestRate / 25) * 100}%, #e5e7eb ${(interestRate / 25) * 100}%, #e5e7eb 100%)`,
                      height: '6px',
                      borderRadius: '999px'
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                    <span>0.0%</span>
                    <span>25.0%</span>
                  </div>
                </div>
              </div>

              {/* Repayment Term */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-300 focus-within:ring-2 focus-within:ring-bunna-600 focus-within:bg-white group">
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="repaymentYears" className="text-xs sm:text-sm font-bold text-slate-700">
                    Repayment Period
                  </label>
                  <span className="text-[10px] font-bold text-bunna-800 bg-bunna-100/60 px-2 py-0.5 rounded-md">
                    Years
                  </span>
                </div>
                
                <div className="relative flex items-center mb-1">
                  <input 
                    id="repaymentYears"
                    type="number" 
                    value={repaymentYears}
                    min={1}
                    max={40}
                    step={1}
                    onChange={(e) => setRepaymentYears(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-2 py-2 sm:py-2.5 bg-transparent border-none text-xl sm:text-2xl font-extrabold text-slate-900 focus:outline-none focus:ring-0"
                  />
                  <span className="absolute right-3 text-slate-400 font-bold text-sm sm:text-base">Years</span>
                </div>

                <div className="relative pt-2 pb-1">
                  <input 
                    type="range" 
                    min={1} 
                    max={30} 
                    step={1} 
                    value={repaymentYears} 
                    onChange={(e) => setRepaymentYears(parseInt(e.target.value))}
                    className="w-full cursor-pointer accent-bunna-700"
                    style={{
                      background: `linear-gradient(to right, #7a4534 0%, #7a4534 ${((repaymentYears - 1) / 29) * 100}%, #e5e7eb ${((repaymentYears - 1) / 29) * 100}%, #e5e7eb 100%)`,
                      height: '6px',
                      borderRadius: '999px'
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                    <span>1 Year</span>
                    <span>30 Years</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Requested Loan Customization Card (Premium Feature Addition) */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-white shadow-xl shadow-slate-100/40">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-bunna-600" />
                  Loan custom amount
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Toggle to calculate repayments for an amount less than your maximum eligibility limit.
                </p>
              </div>
              
              {/* iOS style toggle switch */}
              <button 
                onClick={() => setIsCustomAmount(!isCustomAmount)}
                aria-label="Toggle custom loan amount"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isCustomAmount ? 'bg-bunna-700' : 'bg-slate-200'
                }`}
              >
                <span 
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isCustomAmount ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isCustomAmount && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
                    <div className="bg-bunna-50 border border-bunna-100/70 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-bunna-800">Requested Amount</span>
                        <span className="text-[10px] font-extrabold text-slate-400">Max Limit: Br. {formatCurrency(maxEligibleLoan)}</span>
                      </div>
                      
                      <div className="relative flex items-center mb-3">
                        <span className="absolute left-2 text-slate-400 font-bold text-lg">Br.</span>
                        <input 
                          type="number"
                          value={requestedAmount}
                          min={10000}
                          max={maxEligibleLoan}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setRequestedAmount(Math.min(maxEligibleLoan, val));
                          }}
                          className="w-full pl-8 pr-3 py-1.5 bg-transparent border-none text-xl font-extrabold text-slate-900 focus:outline-none focus:ring-0"
                        />
                      </div>

                      <input 
                        type="range"
                        min={10000}
                        max={maxEligibleLoan}
                        step={5000}
                        value={requestedAmount}
                        onChange={(e) => setRequestedAmount(parseFloat(e.target.value))}
                        className="w-full accent-bunna-700 cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #7a4534 0%, #7a4534 ${((requestedAmount - 10000) / (maxEligibleLoan - 10000)) * 100}%, #e5e7eb ${((requestedAmount - 10000) / (maxEligibleLoan - 10000)) * 100}%, #e5e7eb 100%)`,
                          height: '4px',
                          borderRadius: '999px'
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Visual Dashboard and Estimates */}
        <div id="calculator-results" className="w-full lg:w-[55%] flex flex-col gap-6 sm:gap-8 lg:sticky lg:top-28">
          
          {/* Main Hero Card: Maximum Eligibility Limit */}
          <div className="bg-gradient-to-br from-bunna-950 via-bunna-900 to-bunna-800 rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-bunna-900/20 p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden ring-1 ring-white/10 print-card print:text-black">
            
            {/* Elegant Background Card Art */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-bunna-gold opacity-10 rounded-full blur-2xl transform translate-x-1/2 translate-y-1/2 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm shadow-inner text-xs font-semibold text-bunna-100 tracking-wide uppercase">
                  <CheckCircle2 className="w-4 h-4 text-bunna-gold" />
                  <span>Maximum Eligibility Limit</span>
                </div>
              </div>
              
              <div className="flex items-baseline flex-wrap gap-x-2 sm:gap-x-3 gap-y-1">
                <span className="text-xl sm:text-3xl font-bold text-bunna-300">ETB</span>
                <span className="text-3xl sm:text-5xl lg:text-6xl leading-none font-black text-white tracking-tight drop-shadow-md break-all">
                  <AnimatedCountUp value={maxEligibleLoan} formatter={formatCurrency} />
                </span>
              </div>

              {isCustomAmount && (
                <div className="mt-4 sm:mt-5 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-bunna-gold" />
                    <span className="text-xs font-medium text-bunna-200">Requested Amount Selected:</span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    ETB <AnimatedCountUp value={requestedAmount} formatter={formatCurrency} />
                  </span>
                </div>
              )}
              
              <div className="mt-6 sm:mt-8 flex items-start gap-3 sm:gap-4 border-t border-white/10 pt-5 sm:pt-6">
                <Info className="w-5 h-5 text-bunna-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-medium text-bunna-200/90 leading-relaxed">
                  Based on your current gross salary of <strong className="text-white">Br. {formatCurrency(salary)}</strong>, your maximum eligible bank staff loan limit is calculated in accordance with internal bank policy.
                </p>
              </div>
            </div>
          </div>

          {/* Core Monthly Payment & Interest Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Monthly Repayment Widget */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-[2rem] shadow-lg shadow-slate-100/40 p-5 sm:p-7 border border-white hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                  Monthly Installment
                </h3>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Wallet className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  <AnimatedCountUp value={monthlyPayment} formatter={formatCurrency} />
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-400">/mo</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-2 leading-relaxed">
                Principal & interest combined.
              </p>
            </div>

            {/* Total Interest Widget */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-[2rem] shadow-lg shadow-slate-100/40 p-5 sm:p-7 border border-white hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                  Total Interest cost
                </h3>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100/50">
                  <TrendingUp className="w-5 h-5 text-amber-700" />
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  <AnimatedCountUp value={totalInterest} formatter={formatCurrency} />
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-400">ETB</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-2 leading-relaxed">
                Interest over {repaymentYears} years at {interestRate}%.
              </p>
            </div>

            {/* Total Repayment Widget */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-[2rem] shadow-lg shadow-slate-100/40 p-5 sm:p-7 border border-white hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                  Total Repayment
                </h3>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                  <Coins className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  <AnimatedCountUp value={totalRepayment} formatter={formatCurrency} />
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-400">ETB</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-2 leading-relaxed">
                Total principal & interest combined.
              </p>
            </div>
          </div>

          {/* Visual Breakdown and Amortization Panel */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg shadow-slate-100/40 p-5 sm:p-8 border border-white flex flex-col gap-6">
            
            {/* Repayment Breakdown Section */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-3.5 bg-bunna-700 rounded-full" />
                Repayment Breakdown
              </h3>
              
              {/* Premium Multi-color progress/bar */}
              <div className="w-full h-4 sm:h-5 rounded-full flex overflow-hidden bg-slate-100 shadow-inner mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentPrincipal}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-bunna-800 to-bunna-600"
                  title={`Principal: ${percentPrincipal.toFixed(1)}%`}
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentInterest}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-300"
                  title={`Interest: ${percentInterest.toFixed(1)}%`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-bunna-700 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Principal Amount</p>
                    <p className="text-sm font-extrabold text-slate-900">
                      ETB <AnimatedCountUp value={activeLoanAmount} formatter={formatCurrency} />
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {percentPrincipal.toFixed(1)}% of total repayment
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Total Interest</p>
                    <p className="text-sm font-extrabold text-slate-900">
                      ETB <AnimatedCountUp value={totalInterest} formatter={formatCurrency} />
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {percentInterest.toFixed(1)}% of total repayment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bunna Policy Lending Guidelines - Interactive PDF Document Trigger */}
            <div className="border-t border-slate-100 pt-5">
              <button 
                onClick={() => {
                  setPdfModalTab('viewer');
                  setShowPdfModal(true);
                }}
                className="w-full flex items-center justify-between text-left hover:bg-bunna-50/50 p-2.5 -mx-2.5 rounded-xl transition-all duration-200 focus:outline-none"
                id="bunna-policy-guidelines-link"
              >
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2.5 text-slate-800">
                  <BookOpen className="w-4.5 h-4.5 text-bunna-600 animate-pulse" />
                  BUNNA POLICY LENDING GUIDELINES
                </span>
                <span className="text-[10px] font-black text-bunna-800 bg-bunna-100/60 border border-bunna-200 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-bunna-700 animate-ping" />
                  Show Official PDF
                </span>
              </button>
              
              {/* Short inline teaser of the guidelines */}
              <div className="mt-2 text-[11px] text-slate-500 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                <p>
                  Official internal document: <strong>Staff Credit Facility Allocation & Prioritization Guideline (July 2026)</strong>. Click above to browse the full 16-page guidelines or calculate your prioritized ranking score instantly!
                </p>
                <button
                  onClick={() => {
                    setPdfModalTab('calculator');
                    setShowPdfModal(true);
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-black text-bunna-700 hover:text-bunna-900 transition-colors focus:outline-none"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Interactive Prioritization Scorecard &rarr;</span>
                </button>
              </div>
            </div>

            {/* Amortization Accordion */}
            <div className="border-t border-slate-100 pt-5">
              <button 
                onClick={() => setShowAmortization(!showAmortization)}
                className="w-full flex items-center justify-between text-left text-slate-700 hover:text-slate-900 transition-colors py-1.5 focus:outline-none"
              >
                <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-bunna-600" />
                  Year-by-Year Amortization Schedule
                </span>
                {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence initial={false}>
                {showAmortization && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 overflow-x-auto">
                      <table className="w-full text-left text-xs font-semibold">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400">
                            <th className="py-2 pr-2">Year</th>
                            <th className="py-2 px-2 text-right">Payment (Annual)</th>
                            <th className="py-2 px-2 text-right">Principal Paid</th>
                            <th className="py-2 px-2 text-right">Interest Paid</th>
                            <th className="py-2 pl-2 text-right">Remaining Bal.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-600">
                          {amortizationSchedule.map((row) => (
                            <tr key={row.year} className="hover:bg-slate-50/50">
                              <td className="py-2 pr-2 font-bold text-slate-900">Yr {row.year}</td>
                              <td className="py-2 px-2 text-right font-mono text-slate-800">
                                Br. {formatCurrency(row.payment)}
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-emerald-600">
                                Br. {formatCurrency(row.principalPaid)}
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-amber-600">
                                Br. {formatCurrency(row.interestPaid)}
                              </td>
                              <td className="py-2 pl-2 text-right font-mono text-slate-900">
                                Br. {formatCurrency(row.remainingBalance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Print/Export Button */}
            <div className="border-t border-slate-100 pt-5 print:hidden">
              <button 
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-900 hover:bg-bunna-900 text-white rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:shadow-lg shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
              >
                <Printer className="w-4.5 h-4.5" />
                <span>Export Official Estimate</span>
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 sm:py-8 text-center border-t border-slate-200/50 bg-white/40 backdrop-blur-sm px-4 print:hidden">
        <p className="text-xs text-slate-400 font-semibold tracking-wide">
          &copy; 2026 All rights reserved. Built by Kassahun Mulatu.
        </p>
      </footer>

      {/* Interactive PDF Guidelines & Scorecard Modal */}
      <AnimatePresence>
        {showPdfModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 select-none print:hidden"
          >
            <motion.div 
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              className="bg-slate-50 w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl border border-white/60 flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-white px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-bunna-800 to-bunna-950 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-bunna-900/10 shrink-0">
                    <BookOpen className="w-5 h-5 text-bunna-200" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">Bunna Bank Policy Portal</h3>
                    <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">Internal Staff Credit Policy (July 2026)</p>
                  </div>
                </div>
                
                {/* Tabs Selector */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                  <button 
                    onClick={() => setPdfModalTab('viewer')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      pdfModalTab === 'viewer' ? 'bg-white text-bunna-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Official Document PDF</span>
                  </button>
                  <button 
                    onClick={() => setPdfModalTab('calculator')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      pdfModalTab === 'calculator' ? 'bg-white text-bunna-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5 text-bunna-gold" />
                    <span>Prioritization Scorecard</span>
                  </button>
                </div>

                <button 
                  onClick={() => setShowPdfModal(false)}
                  className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Core Area */}
              <div className="flex-grow flex overflow-hidden">
                {pdfModalTab === 'viewer' ? (
                  <>
                    {/* Sidebar quick links - Left side navigation */}
                    <div className="hidden md:block w-72 bg-white border-r border-slate-100 p-5 overflow-y-auto shrink-0 select-none">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Jump to Section</h4>
                      <div className="space-y-1 text-xs">
                        <button 
                          onClick={() => handleSidebarPageClick(1)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 1 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>Cover & Title Page</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 1</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(2)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 2 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>Table of Content</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 2</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(3)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 3 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>Preamble</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 3</span>
                        </button>
                        <div className="pt-2 pb-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Part 1: Introduction</span>
                        </div>
                        <button 
                          onClick={() => handleSidebarPageClick(4)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 4 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>1.1 Background</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 4</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(5)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 5 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>1.2 - 1.3 Objective & Scope</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 5</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(6)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 6 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>1.4 - 1.5 Benefits & Limit</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 6</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(7)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 7 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>1.5.3 - 1.5.4 Oversight</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 7</span>
                        </button>
                        <div className="pt-2 pb-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Part 2: Prioritization</span>
                        </div>
                        <button 
                          onClick={() => handleSidebarPageClick(8)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 8 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>2.1 Scoring Weights Table</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 8</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(9)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 9 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>2.2.1 Appraisal Points</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 9</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(10)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 10 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>2.2.2 - 2.2.3 Benefit History</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 10</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(11)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 11 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>2.2.4 HO Satisfaction</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 11</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(12)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 12 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>2.3 - 2.4 Warnings Table</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 12</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(13)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 13 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>2.4.3 Fund Allocation</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 13</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(14)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 14 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>2.5 Process & Tie-Breakers</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 14</span>
                        </button>
                        <button 
                          onClick={() => handleSidebarPageClick(15)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 15 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>2.6 Roles & Responsibilities</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 15</span>
                        </button>
                        <div className="pt-2 pb-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Part 3: Miscellaneous</span>
                        </div>
                        <button 
                          onClick={() => handleSidebarPageClick(16)}
                          className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                            pdfPage === 16 ? 'bg-bunna-50 text-bunna-900 border-l-4 border-bunna-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>Part 3 & Effective Date</span>
                          <span className="text-[10px] font-normal text-slate-400">Pg 16</span>
                        </button>
                      </div>
                    </div>

                    {/* Main Paper Reader Space */}
                    <div className="flex-grow flex flex-col overflow-hidden bg-slate-100 p-3 sm:p-5 select-text relative">
                      {/* View mode toggle sub-header */}
                      <div className="mb-4 bg-white rounded-2xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200/60 shadow-sm shrink-0 select-none">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider pl-1.5">View Mode:</span>
                          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/30">
                            <button
                              onClick={() => setPdfViewMode('continuous')}
                              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                                pdfViewMode === 'continuous' ? 'bg-white text-bunna-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Continuous Scroll (All 16 Pages)
                            </button>
                            <button
                              onClick={() => setPdfViewMode('paginated')}
                              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                                pdfViewMode === 'paginated' ? 'bg-white text-bunna-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Single Page
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          {pdfViewMode === 'continuous' ? (
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                              📖 Reading entire 16-page guide
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-bunna-800 bg-bunna-50 border border-bunna-200 px-3 py-1 rounded-full">
                              📄 Reading single page
                            </span>
                          )}
                        </div>
                      </div>

                      {pdfViewMode === 'continuous' ? (
                        /* Continuous Scroll Mode - Renders all 16 pages sequentially */
                        <div 
                          id="pdf-scroll-container" 
                          className="flex-grow overflow-y-auto space-y-8 pb-10 scroll-smooth pr-1 select-text"
                        >
                          {Array.from({ length: 16 }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <div 
                                key={pageNum}
                                id={`pdf-page-${pageNum}`}
                                className="bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8 md:p-10 shadow-lg max-w-3xl mx-auto w-full relative min-h-[500px] transition-shadow hover:shadow-xl"
                              >
                                {/* Page Header Bar */}
                                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6 select-none text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <span>Bunna Bank S.C. Guidelines</span>
                                  <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-extrabold text-[10px]">Page {pageNum} of 16</span>
                                </div>

                                <div className="relative min-h-[350px]">
                                  {renderPdfPage(pageNum)}
                                </div>

                                {/* Official stamp signature overlay */}
                                {pageNum > 2 && <OfficialSeal />}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Standard Single Page Paginated Mode */
                        <>
                          {/* Paper sheet simulator */}
                          <div className="flex-grow overflow-y-auto bg-white rounded-2xl border border-slate-200/60 p-6 sm:p-8 md:p-10 shadow-lg max-w-3xl mx-auto w-full relative min-h-[450px]">
                            {renderPdfPage(pdfPage)}
                            {pdfPage > 2 && <OfficialSeal />}
                          </div>

                          {/* Pagination Controls bar */}
                          <div className="mt-4 bg-white rounded-2xl p-2.5 flex items-center justify-between shadow-md max-w-3xl mx-auto w-full border border-slate-200/50 select-none">
                            <button 
                              disabled={pdfPage === 1}
                              onClick={() => setPdfPage(prev => Math.max(1, prev - 1))}
                              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 focus:outline-none"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Prev</span>
                            </button>
                            
                            {/* Page drop selection list */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Page</span>
                              <select 
                                value={pdfPage}
                                onChange={(e) => setPdfPage(parseInt(e.target.value))}
                                className="bg-slate-100 border-none text-slate-800 font-extrabold text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-bunna-700 focus:outline-none"
                              >
                                {Array.from({ length: 16 }, (_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                              </select>
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">of 16</span>
                            </div>

                            <button 
                              disabled={pdfPage === 16}
                              onClick={() => setPdfPage(prev => Math.min(16, prev + 1))}
                              className="px-3 py-1.5 bg-bunna-800 hover:bg-bunna-900 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 focus:outline-none"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  /* TAB: SCORECARD CALCULATOR */
                  <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-slate-50 p-4 sm:p-5 md:p-6 gap-6 justify-between select-text">
                    
                    {/* Score Inputs Form */}
                    <div className="w-full md:w-1/2 overflow-y-auto bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm space-y-5">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Scale className="w-5 h-5 text-bunna-700" />
                          PRICING PRIORITIZATION MODEL
                        </h4>
                        <p className="text-slate-400 text-[11px] mt-1 font-semibold leading-relaxed">
                          Input your quarterly data points specified in Section 2.1 to instantly calculate your official prioritisation points weight in the sequential queue.
                        </p>
                      </div>

                      {/* Work unit selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          Operating Division / Work Unit
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button 
                            onClick={() => setScoreWorkUnit('branch')}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                              scoreWorkUnit === 'branch' 
                                ? 'bg-bunna-50 border-bunna-700 text-bunna-900 shadow-sm font-extrabold' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>Branch / District / CRBBO</span>
                            <span className="text-[9px] font-medium text-slate-400">Appraisal Weight: 60 points max</span>
                          </button>
                          <button 
                            onClick={() => setScoreWorkUnit('ho')}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                              scoreWorkUnit === 'ho' 
                                ? 'bg-bunna-50 border-bunna-700 text-bunna-900 shadow-sm font-extrabold' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>Head Office (HO) Unit</span>
                            <span className="text-[9px] font-medium text-slate-400">Appraisal Weight: 40 points max</span>
                          </button>
                        </div>
                      </div>

                      {/* Performance Appraisal Points input */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label htmlFor="scoreAppraisal" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            Performance Appraisal Score (KPI points)
                          </label>
                          <span className="text-[10px] font-black text-bunna-700 bg-bunna-50 px-2 py-0.5 rounded-full">
                            Max 150
                          </span>
                        </div>
                        <input 
                          id="scoreAppraisal"
                          type="number" 
                          min={0}
                          max={150}
                          value={scoreAppraisal}
                          onChange={(e) => setScoreAppraisal(Math.min(150, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-bunna-700"
                        />
                        <div className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          {scoreWorkUnit === 'branch' ? (
                            <span>Above 125 KPI points = <strong>60 scorecard points</strong>. 100 to 125 = <strong>55 points</strong>. 85 to 100 = <strong>50 points</strong>.</span>
                          ) : (
                            <span>Above 95 KPI points = <strong>40 scorecard points</strong>. 90 to 95 = <strong>35 points</strong>. 85 to 90 = <strong>30 points</strong>.</span>
                          )}
                        </div>
                      </div>

                      {/* Prior Credit Benefit status selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          Prior Credit Benefit History (Section 2.2.2)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => setScorePriorLoan('none')}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center leading-tight ${
                              scorePriorLoan === 'none' 
                                ? 'bg-bunna-50 border-bunna-700 text-bunna-900 font-extrabold shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Never Received (20 pts)
                          </button>
                          <button 
                            onClick={() => setScorePriorLoan('settled')}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center leading-tight ${
                              scorePriorLoan === 'settled' 
                                ? 'bg-bunna-50 border-bunna-700 text-bunna-900 font-extrabold shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Settled Loan (10 pts)
                          </button>
                          <button 
                            onClick={() => setScorePriorLoan('active')}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center leading-tight ${
                              scorePriorLoan === 'active' 
                                ? 'bg-bunna-50 border-bunna-700 text-bunna-900 font-extrabold shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Active Balance (5 pts)
                          </button>
                        </div>
                      </div>

                      {/* Job level position selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          Staff Position Category (Section 2.2.3)
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button 
                            onClick={() => setScoreJobCategory('managerial')}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center ${
                              scoreJobCategory === 'managerial' 
                                ? 'bg-bunna-50 border-bunna-700 text-bunna-900 font-extrabold shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>Managerial Grade</span>
                            <span className="text-[9px] font-normal text-slate-400">Earns 20 points</span>
                          </button>
                          <button 
                            onClick={() => setScoreJobCategory('non-managerial')}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center ${
                              scoreJobCategory === 'non-managerial' 
                                ? 'bg-bunna-50 border-bunna-700 text-bunna-900 font-extrabold shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>Non-Managerial Grade</span>
                            <span className="text-[9px] font-normal text-slate-400">Earns 10 points</span>
                          </button>
                        </div>
                      </div>

                      {/* Head Office Satisfaction input slider */}
                      {scoreWorkUnit === 'ho' && (
                        <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                              Work Unit Satisfaction Rating
                            </label>
                            <span className="text-xs font-extrabold text-bunna-800">{scoreSatisfaction} / 20 points</span>
                          </div>
                          <input 
                            type="range"
                            min={0}
                            max={20}
                            step={1}
                            value={scoreSatisfaction}
                            onChange={(e) => setScoreSatisfaction(parseInt(e.target.value))}
                            className="w-full accent-bunna-700 cursor-pointer"
                          />
                          <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                            Evaluated quarterly based on support service responsiveness, quality and effectiveness scores as rated by Branches.
                          </p>
                        </div>
                      )}

                      {/* Warnings / Disciplinary penalties selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          Disciplinary Warnings / Ethical Deductions (Section 2.3)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => setScoreWarning('none')}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center ${
                              scoreWarning === 'none' 
                                ? 'bg-bunna-50 border-bunna-700 text-bunna-900 font-extrabold shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            No Warnings (0 pts)
                          </button>
                          <button 
                            onClick={() => setScoreWarning('three_months')}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center ${
                              scoreWarning === 'three_months' 
                                ? 'bg-rose-50 border-rose-200 text-rose-950 font-extrabold shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            1st Warning &lt; 3mo (-4 pts)
                          </button>
                          <button 
                            onClick={() => setScoreWarning('six_months')}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center ${
                              scoreWarning === 'six_months' 
                                ? 'bg-rose-50 border-rose-200 text-rose-950 font-extrabold shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            2nd Warning &lt; 6mo (-6 pts)
                          </button>
                          <button 
                            onClick={() => setScoreWarning('one_year')}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center ${
                              scoreWarning === 'one_year' 
                                ? 'bg-rose-50 border-rose-300 text-rose-950 font-extrabold shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Last Warning &lt; 1yr (-10 pts)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Score Results Presentation Dashboard */}
                    <div className="w-full md:w-1/2 flex flex-col justify-between bg-gradient-to-br from-bunna-950 via-bunna-900 to-bunna-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-bunna-gold opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                      
                      <div className="space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 backdrop-blur-sm rounded-full text-[9px] font-black text-bunna-100 uppercase tracking-widest">
                          <Award className="w-3.5 h-3.5 text-bunna-gold" />
                          <span>Calculated priority status</span>
                        </div>

                        <div>
                          <p className="text-[10px] text-bunna-300 font-extrabold tracking-wider uppercase">Your Prioritization Score</p>
                          <div className="flex items-baseline gap-1.5 mt-1.5">
                            <span className="text-6xl sm:text-7xl font-black text-white leading-none tracking-tighter">
                              <AnimatedCountUp value={totalPriorityScore} />
                            </span>
                            <span className="text-xl font-bold text-bunna-300">/ 100</span>
                          </div>
                        </div>

                        {/* Breakdown Table */}
                        <div className="border-t border-white/10 pt-4 space-y-3 text-xs font-semibold text-bunna-200">
                          <h5 className="font-black uppercase tracking-wider text-white text-[10px]">Points Breakdown</h5>
                          
                          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                            <span>Work Unit Performance Appraisal Points:</span>
                            <span className="font-extrabold text-white text-sm">+{activeAppraisalPoints}</span>
                          </div>
                          
                          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                            <span>Prior Credit Benefit Status Points:</span>
                            <span className="font-extrabold text-white text-sm">+{activePriorLoanPoints}</span>
                          </div>
                          
                          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                            <span>Staff Job Category Position Grade:</span>
                            <span className="font-extrabold text-white text-sm">+{activeJobPoints}</span>
                          </div>
                          
                          {scoreWorkUnit === 'ho' && (
                            <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                              <span>Head Office Work Unit Satisfaction Rating:</span>
                              <span className="font-extrabold text-white text-sm">+{activeSatisfactionPoints}</span>
                            </div>
                          )}

                          {activeDeductionPoints > 0 && (
                            <div className="flex justify-between items-center text-rose-300 bg-rose-950/40 p-2 rounded-xl border border-rose-900/40">
                              <span className="flex items-center gap-1 font-bold">
                                <AlertTriangle className="w-4 h-4 text-rose-400" />
                                Ethical Warning Deduction:
                              </span>
                              <span className="font-black text-sm">-{activeDeductionPoints} points</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Priorities and Outlook description */}
                      <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 relative z-10 text-xs">
                        <p className="font-black text-bunna-300 uppercase tracking-widest text-[10px]">Calculated Queue Outlook:</p>
                        <p className="text-sm font-extrabold text-white leading-relaxed">
                          {totalPriorityScore >= 80 ? (
                            <span className="text-emerald-400 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                              Platinum Prioritystanding (Rank Bracket 1)
                            </span>
                          ) : totalPriorityScore >= 60 ? (
                            <span className="text-amber-300 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                              Gold Prioritystanding (Rank Bracket 2)
                            </span>
                          ) : (
                            <span className="text-slate-300 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                              Standard Queue Status
                            </span>
                          )}
                        </p>
                        <p className="text-bunna-200 leading-relaxed font-medium text-[11px]">
                          {totalPriorityScore >= 80 
                            ? "Excellent priority standing! You are positioned at the upper tier of the sequential funding queue. Your request will likely clear early in the next liquidity window."
                            : totalPriorityScore >= 60
                            ? "Solid standing. Your application holds moderate priority in the sequential funding queue. Disbursal timeline depends on available quarterly budget allocations."
                            : "Standard prioritization level. In high-demand quarters with tight liquidity safeguards, you may experience rollover delays into subsequent fiscal cycles."}
                        </p>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

{/* Sub-components for PDF replication stamp */}
const OfficialSeal = () => (
  <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 w-28 h-28 border-[3px] border-indigo-600/60 rounded-full flex flex-col items-center justify-center text-center text-[8px] font-bold text-indigo-600/70 uppercase tracking-tight select-none rotate-[-6deg] pointer-events-none bg-indigo-50/10 backdrop-blur-[0.5px]">
    <div className="border border-dashed border-indigo-600/50 rounded-full w-[94px] h-[94px] flex flex-col items-center justify-center p-1">
      <span className="text-[7px]">ቡና ባንክ አ.ማ.</span>
      <span className="font-extrabold my-0.5 tracking-wider">BUNNA BANK S.C</span>
      <span className="text-[6px] tracking-widest text-indigo-600/60 font-mono">JULY 2026</span>
      {/* Hand drawn signature path replica */}
      <svg className="w-12 h-6 absolute text-indigo-500/70" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10,25 Q25,5 40,30 T70,10 T90,35 M20,20 Q50,45 80,15" />
      </svg>
      <span className="text-[5px] mt-1 tracking-widest">AUTHORIZED</span>
    </div>
  </div>
);



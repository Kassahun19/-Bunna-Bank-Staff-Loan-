/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Check
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
          
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-bunna-50 border border-bunna-100 rounded-full text-xs sm:text-sm font-semibold text-bunna-800 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-bunna-600 flex-shrink-0" />
            <span className="hidden sm:inline">Internal policy compliant</span>
            <span className="sm:hidden">Compliant</span>
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
                  {formatCurrency(maxEligibleLoan)}
                </span>
              </div>

              {isCustomAmount && (
                <div className="mt-4 sm:mt-5 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-bunna-gold" />
                    <span className="text-xs font-medium text-bunna-200">Requested Amount Selected:</span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    ETB {formatCurrency(requestedAmount)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
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
                  {formatCurrency(monthlyPayment)}
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
                  {formatCurrency(totalInterest)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-400">ETB</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-2 leading-relaxed">
                Interest over {repaymentYears} years at {interestRate}%.
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
                      ETB {formatCurrency(activeLoanAmount)}
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
                      ETB {formatCurrency(totalInterest)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {percentInterest.toFixed(1)}% of total repayment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Policy Helper Accordion */}
            <div className="border-t border-slate-100 pt-5">
              <button 
                onClick={() => setShowPolicyDetails(!showPolicyDetails)}
                className="w-full flex items-center justify-between text-left text-slate-700 hover:text-slate-900 transition-colors py-1.5 focus:outline-none"
              >
                <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-bunna-600" />
                  Bunna Policy Lending Guidelines
                </span>
                {showPolicyDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <AnimatePresence initial={false}>
                {showPolicyDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pb-1 text-xs text-slate-500 leading-relaxed space-y-3 font-medium">
                      <p>
                        Bunna Bank provides premium lending rates and maximum flexibility for its dedicated staff. The policy formula guarantees fair allocation based on monthly salaries:
                      </p>
                      <ul className="list-disc pl-4 space-y-1.5">
                        <li>
                          <strong>Debt Service Ratio:</strong> Loans are qualified based on your gross monthly salary to ensure comfortable repayments.
                        </li>
                        <li>
                          <strong>Eligibility Limit:</strong> Staff are eligible for customized high-limit loan packages.
                        </li>
                        <li>
                          <strong>Interest Concession:</strong> Staff loan rates are usually capped considerably lower than standard commercial rates to support financial security.
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

    </div>
  );
}


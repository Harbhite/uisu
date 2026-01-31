import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calculator, Percent, Scale, Clock, Calendar, 
  Ruler, Thermometer, DollarSign, PieChart, Hash,
  Box, Gauge, TrendingUp, Activity
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// ============= THEME CONFIGURATION =============
const calculatorThemes: { [key: string]: { bg: string; accent: string; text: string; button: string; border: string } } = {
  basic: { bg: 'bg-ui-blue', accent: 'border-l-white/20', text: 'text-white', button: 'bg-white/10 hover:bg-white/20', border: 'border-white/10' },
  scientific: { bg: 'bg-slate-900', accent: 'border-l-nobel-gold', text: 'text-nobel-gold', button: 'bg-slate-800 text-slate-400 hover:bg-nobel-gold hover:text-ui-blue', border: 'border-slate-800' },
  percentage: { bg: 'bg-emerald-800', accent: 'border-l-emerald-400', text: 'text-emerald-100', button: 'bg-emerald-900/50 hover:bg-emerald-700', border: 'border-emerald-700' },
  unit: { bg: 'bg-violet-800', accent: 'border-l-violet-400', text: 'text-violet-100', button: 'bg-violet-900/50 hover:bg-violet-700', border: 'border-violet-700' },
  age: { bg: 'bg-amber-700', accent: 'border-l-amber-300', text: 'text-amber-100', button: 'bg-amber-900/50 hover:bg-amber-600', border: 'border-amber-600' },
  bmi: { bg: 'bg-rose-800', accent: 'border-l-rose-400', text: 'text-rose-100', button: 'bg-rose-900/50 hover:bg-rose-700', border: 'border-rose-700' },
  loan: { bg: 'bg-teal-800', accent: 'border-l-teal-400', text: 'text-teal-100', button: 'bg-teal-900/50 hover:bg-teal-700', border: 'border-teal-700' },
  tip: { bg: 'bg-orange-700', accent: 'border-l-orange-300', text: 'text-orange-100', button: 'bg-orange-900/50 hover:bg-orange-600', border: 'border-orange-600' },
  discount: { bg: 'bg-indigo-800', accent: 'border-l-indigo-400', text: 'text-indigo-100', button: 'bg-indigo-900/50 hover:bg-indigo-700', border: 'border-indigo-700' },
  base: { bg: 'bg-cyan-800', accent: 'border-l-cyan-400', text: 'text-cyan-100', button: 'bg-cyan-900/50 hover:bg-cyan-700', border: 'border-cyan-700' },
  geometry: { bg: 'bg-lime-900', accent: 'border-l-lime-400', text: 'text-lime-100', button: 'bg-lime-950/50 hover:bg-lime-800', border: 'border-lime-800' },
  speed: { bg: 'bg-fuchsia-900', accent: 'border-l-fuchsia-400', text: 'text-fuchsia-100', button: 'bg-fuchsia-950/50 hover:bg-fuchsia-800', border: 'border-fuchsia-800' },
  compound: { bg: 'bg-yellow-900', accent: 'border-l-yellow-400', text: 'text-yellow-100', button: 'bg-yellow-950/50 hover:bg-yellow-800', border: 'border-yellow-800' },
  bmr: { bg: 'bg-red-900', accent: 'border-l-red-400', text: 'text-red-100', button: 'bg-red-950/50 hover:bg-red-800', border: 'border-red-800' },
};

// Helper to get theme classes
const useTheme = (id: string) => calculatorThemes[id] || calculatorThemes.basic;

// ============= SHARED COMPONENTS =============
const CalculatorCard = ({ children, themeId }: { children: React.ReactNode, themeId: string }) => {
  const theme = useTheme(themeId);
  return (
    <div className={`${theme.bg} ${theme.border} border-l-4 ${theme.accent} p-8 max-w-md mx-auto shadow-2xl relative overflow-hidden group transition-colors duration-500`}>
      {/* Decorative Elements mimicking Resource Card */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-50" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-black/20 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const CalculatorHeader = ({ title }: { title: string }) => (
  <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-60 mb-1 text-white">Utility</p>
      <h3 className="font-serif italic text-2xl text-white">{title}</h3>
    </div>
  </div>
);

const ResultDisplay = ({ label, value, themeId }: { label?: string, value: string, themeId: string }) => {
  return (
    <div className="bg-black/20 backdrop-blur-md p-6 text-center border border-white/10 shadow-inner mt-6 rounded-sm">
      {label && <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">{label}</p>}
      <div className="text-3xl font-mono tracking-widest text-white truncate">{value}</div>
    </div>
  );
};

const StyledInput = ({ label, ...props }: any) => (
  <div>
    <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 block">{label}</label>
    <Input
      {...props}
      className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:border-white/40 focus:ring-0 rounded-sm"
    />
  </div>
);

const StyledSelect = ({ label, children, ...props }: any) => (
  <div>
    {label && <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 block">{label}</label>}
    <Select {...props}>
      <SelectTrigger className="bg-black/20 border-white/10 text-white focus:ring-0 rounded-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-slate-800 text-white">
        {children}
      </SelectContent>
    </Select>
  </div>
);

// ============= BASIC CALCULATOR =============
const BasicCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const theme = useTheme('basic');

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const performOperation = (operator: string) => {
    if (operator === '=') {
      try {
        const fullExpression = expression + display;
        const result = eval(fullExpression.replace(/×/g, '*').replace(/÷/g, '/'));
        setDisplay(String(result));
        setExpression('');
      } catch {
        setDisplay('Error');
      }
      setWaitingForOperand(true);
      return;
    }
    setExpression(expression + display + operator);
    setWaitingForOperand(true);
  };

  const buttons = [
    { label: 'C', action: () => { setDisplay('0'); setExpression(''); }, className: 'bg-white/20 text-white font-bold' },
    { label: '±', action: () => setDisplay(String(-parseFloat(display))) },
    { label: '%', action: () => setDisplay(String(parseFloat(display) / 100)) },
    { label: '÷', action: () => performOperation('÷'), className: 'bg-white/30 font-bold' },
    { label: '7', action: () => inputDigit('7') },
    { label: '8', action: () => inputDigit('8') },
    { label: '9', action: () => inputDigit('9') },
    { label: '×', action: () => performOperation('×'), className: 'bg-white/30 font-bold' },
    { label: '4', action: () => inputDigit('4') },
    { label: '5', action: () => inputDigit('5') },
    { label: '6', action: () => inputDigit('6') },
    { label: '−', action: () => performOperation('-'), className: 'bg-white/30 font-bold' },
    { label: '1', action: () => inputDigit('1') },
    { label: '2', action: () => inputDigit('2') },
    { label: '3', action: () => inputDigit('3') },
    { label: '+', action: () => performOperation('+'), className: 'bg-white/30 font-bold' },
    { label: '0', action: () => inputDigit('0'), className: 'col-span-2' },
    { label: '.', action: () => !display.includes('.') && setDisplay(display + '.') },
    { label: '=', action: () => performOperation('='), className: 'bg-white text-ui-blue font-bold hover:bg-white/90' },
  ];

  return (
    <CalculatorCard themeId="basic">
      <CalculatorHeader title="Standard Mode" />
      <div className="bg-black/20 p-6 mb-6 rounded-sm border border-white/10 text-right">
        <div className="text-xs text-white/60 h-5 font-mono">{expression}</div>
        <div className="text-4xl font-mono text-white tracking-widest">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`p-4 text-lg font-mono transition-all duration-200 border border-white/5 rounded-sm ${btn.className || 'bg-white/5 hover:bg-white/10 text-white'}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </CalculatorCard>
  );
};

// ============= SCIENTIFIC CALCULATOR =============
const ScientificCalculator = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [isRadians, setIsRadians] = useState(true);
  const theme = useTheme('scientific');

  const evaluate = () => {
    try {
      let evalExpr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/∛\(/g, 'Math.cbrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/abs\(/g, 'Math.abs(');

      if (!isRadians) {
        evalExpr = evalExpr.replace(/(sin|cos|tan)\(([^)]+)\)/g, (_, func, arg) => `Math.${func}((${arg}) * Math.PI / 180)`);
      } else {
        evalExpr = evalExpr.replace(/(sin|cos|tan)\(/g, (_, func) => `Math.${func}(`);
      }

      evalExpr = evalExpr.replace(/a(sin|cos|tan)\(/g, (_, func) => `Math.a${func}(`);

      // eslint-disable-next-line no-eval
      const res = eval(evalExpr);
      setResult(String(Number(res).toFixed(4)).replace(/\.?0+$/, ''));
    } catch {
      setResult('Error');
    }
  };

  const insert = (val: string) => setExpression(prev => prev + val);
  const sciKeys = [
    { label: '(', val: '(' }, { label: ')', val: ')' }, { label: '^', val: '^' }, { label: '√', val: '√(' }, { label: '∛', val: '∛(' },
    { label: 'sin', val: 'sin(' }, { label: 'cos', val: 'cos(' }, { label: 'tan', val: 'tan(' }, { label: 'log', val: 'log(' }, { label: 'ln', val: 'ln(' },
    { label: '1/x', val: '^(-1)' }, { label: 'e', val: 'e' }, { label: 'π', val: 'π' }, { label: 'EXP', val: '*10^' }, { label: 'abs', val: 'abs(' },
  ];

  return (
    <CalculatorCard themeId="scientific">
      <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-60 mb-1 text-nobel-gold">Advanced</p>
          <h3 className="font-serif italic text-2xl text-white">Scientific Mode</h3>
        </div>
        <button onClick={() => setIsRadians(!isRadians)} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-white/5 text-nobel-gold border border-white/10 hover:bg-white/10 transition-colors">
          {isRadians ? 'RAD' : 'DEG'}
        </button>
      </div>

      <div className="bg-black/30 p-6 mb-6 rounded-sm border border-white/10 text-right font-mono">
        <div className="text-xs text-white/50 mb-2 h-4">{result !== '' && '='} {result}</div>
        <div className="text-2xl text-nobel-gold break-all tracking-wider">{expression || '0'}</div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {sciKeys.map((btn) => (
          <button
            key={btn.label}
            onClick={() => insert(btn.val)}
            className="p-3 text-[9px] font-bold uppercase tracking-wider bg-white/5 text-white/70 border border-white/5 hover:bg-nobel-gold hover:text-ui-blue transition-all duration-200 rounded-sm"
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 border-t border-white/10 pt-4">
        <button onClick={() => { setExpression(''); setResult(''); }} className="p-4 text-sm font-bold text-red-400 bg-red-900/20 hover:bg-red-900/40 rounded-sm">AC</button>
        <button onClick={() => setExpression(p => p.slice(0, -1))} className="p-4 text-sm font-bold text-white bg-white/5 hover:bg-white/10 rounded-sm">⌫</button>
        <button onClick={() => insert('%')} className="p-4 text-sm font-bold text-white bg-white/5 hover:bg-white/10 rounded-sm">%</button>
        <button onClick={() => insert('÷')} className="p-4 text-lg text-ui-blue bg-nobel-gold hover:bg-white rounded-sm">÷</button>

        {[7, 8, 9].map(n => <button key={n} onClick={() => insert(String(n))} className="p-4 text-lg font-mono text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-sm">{n}</button>)}
        <button onClick={() => insert('×')} className="p-4 text-lg text-ui-blue bg-nobel-gold hover:bg-white rounded-sm">×</button>

        {[4, 5, 6].map(n => <button key={n} onClick={() => insert(String(n))} className="p-4 text-lg font-mono text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-sm">{n}</button>)}
        <button onClick={() => insert('-')} className="p-4 text-lg text-ui-blue bg-nobel-gold hover:bg-white rounded-sm">−</button>

        {[1, 2, 3].map(n => <button key={n} onClick={() => insert(String(n))} className="p-4 text-lg font-mono text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-sm">{n}</button>)}
        <button onClick={() => insert('+')} className="p-4 text-lg text-ui-blue bg-nobel-gold hover:bg-white rounded-sm">+</button>

        <button onClick={() => insert('0')} className="col-span-2 p-4 text-lg font-mono text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-sm">0</button>
        <button onClick={() => insert('.')} className="p-4 text-lg font-mono text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-sm">.</button>
        <button onClick={evaluate} className="p-4 text-lg font-bold text-white bg-ui-blue hover:bg-ui-blue/80 rounded-sm">=</button>
      </div>
    </CalculatorCard>
  );
};

// ============= PERCENTAGE CALCULATOR =============
const PercentageCalculator = () => {
  const [value, setValue] = useState('');
  const [percent, setPercent] = useState('');
  const [mode, setMode] = useState<'of' | 'increase' | 'decrease' | 'what'>('of');

  const calculate = () => {
    const v = parseFloat(value);
    const p = parseFloat(percent);
    if (isNaN(v) || isNaN(p)) return '—';
    switch (mode) {
      case 'of': return ((p / 100) * v).toFixed(2);
      case 'increase': return (v + (v * p / 100)).toFixed(2);
      case 'decrease': return (v - (v * p / 100)).toFixed(2);
      case 'what': return ((p / v) * 100).toFixed(2) + '%';
      default: return '—';
    }
  };

  return (
    <CalculatorCard themeId="percentage">
      <CalculatorHeader title="Percentage Mode" />
      <div className="space-y-4">
        <StyledSelect value={mode} onValueChange={(v: any) => setMode(v)}>
          <SelectItem value="of">What is X% of Y?</SelectItem>
          <SelectItem value="increase">Increase Y by X%</SelectItem>
          <SelectItem value="decrease">Decrease Y by X%</SelectItem>
          <SelectItem value="what">X is what % of Y?</SelectItem>
        </StyledSelect>

        <div className="grid grid-cols-2 gap-4">
          <StyledInput label={mode === 'what' ? 'Part' : 'Percentage'} type="number" value={percent} onChange={(e: any) => setPercent(e.target.value)} />
          <StyledInput label={mode === 'what' ? 'Whole' : 'Value'} type="number" value={value} onChange={(e: any) => setValue(e.target.value)} />
        </div>

        <ResultDisplay value={calculate()} label="Result" themeId="percentage" />
      </div>
    </CalculatorCard>
  );
};

// ============= UNIT CONVERTER =============
const UnitConverter = () => {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [category, setCategory] = useState('length');

  const conversions: any = {
    length: { m: 1, km: 0.001, cm: 100, mm: 1000, mi: 0.000621371, ft: 3.28084, in: 39.3701, yd: 1.09361 },
    weight: { kg: 1, g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274, t: 0.001 },
    temperature: { c: 1, f: 1, k: 1 }
  };

  const unitNames: any = {
    m: 'Meters', km: 'Kilometers', cm: 'Centimeters', mm: 'Millimeters', mi: 'Miles', ft: 'Feet', in: 'Inches', yd: 'Yards',
    kg: 'Kilograms', g: 'Grams', mg: 'Milligrams', lb: 'Pounds', oz: 'Ounces', t: 'Tonnes', c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin'
  };

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return '—';
    if (category === 'temperature') {
      let c = fromUnit === 'c' ? v : fromUnit === 'f' ? (v - 32) * 5/9 : v - 273.15;
      if (toUnit === 'c') return c.toFixed(2);
      if (toUnit === 'f') return ((c * 9/5) + 32).toFixed(2);
      return (c + 273.15).toFixed(2);
    }
    return ((v / conversions[category][fromUnit]) * conversions[category][toUnit]).toFixed(4);
  };

  return (
    <CalculatorCard themeId="unit">
      <CalculatorHeader title="Unit Conversion" />
      <div className="space-y-4">
        <StyledSelect value={category} onValueChange={(v: any) => { setCategory(v); setFromUnit(Object.keys(conversions[v])[0]); setToUnit(Object.keys(conversions[v])[1]); }}>
          <SelectItem value="length">Length</SelectItem>
          <SelectItem value="weight">Weight</SelectItem>
          <SelectItem value="temperature">Temperature</SelectItem>
        </StyledSelect>

        <StyledInput type="number" value={value} onChange={(e: any) => setValue(e.target.value)} placeholder="Enter value" />

        <div className="grid grid-cols-2 gap-4">
          <StyledSelect value={fromUnit} onValueChange={setFromUnit}>
            {Object.keys(conversions[category]).map(u => <SelectItem key={u} value={u}>{unitNames[u]}</SelectItem>)}
          </StyledSelect>
          <StyledSelect value={toUnit} onValueChange={setToUnit}>
            {Object.keys(conversions[category]).map(u => <SelectItem key={u} value={u}>{unitNames[u]}</SelectItem>)}
          </StyledSelect>
        </div>

        <ResultDisplay value={convert()} label={unitNames[toUnit]} themeId="unit" />
      </div>
    </CalculatorCard>
  );
};

// ============= AGE CALCULATOR =============
const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const calculateAge = () => {
    if (!birthDate) return { years: 0, months: 0, days: 0, totalDays: 0 };
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(target.getFullYear(), target.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    return { years, months, days, totalDays: Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)) };
  };

  const age = calculateAge();

  return (
    <CalculatorCard themeId="age">
      <CalculatorHeader title="Chronological Age" />
      <div className="space-y-4">
        <StyledInput label="Date of Birth" type="date" value={birthDate} onChange={(e: any) => setBirthDate(e.target.value)} className="bg-black/20 border-white/10 text-white [color-scheme:dark]" />
        <StyledInput label="Target Date" type="date" value={targetDate} onChange={(e: any) => setTargetDate(e.target.value)} className="bg-black/20 border-white/10 text-white [color-scheme:dark]" />

        <div className="bg-black/20 border border-white/10 rounded-sm p-6 mt-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 text-center mb-4">Calculated Duration</p>
          <div className="grid grid-cols-3 gap-4 text-center text-white">
            <div><p className="text-3xl font-mono">{age.years}</p><p className="text-[8px] uppercase">Years</p></div>
            <div><p className="text-3xl font-mono">{age.months}</p><p className="text-[8px] uppercase">Months</p></div>
            <div><p className="text-3xl font-mono">{age.days}</p><p className="text-[8px] uppercase">Days</p></div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-center text-white/60 text-xs font-mono uppercase">
            Total: <span className="text-white">{age.totalDays.toLocaleString()}</span> days
          </div>
        </div>
      </div>
    </CalculatorCard>
  );
};

// ============= BMI CALCULATOR =============
const BMICalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h) || h === 0) return 0;
    return unit === 'metric' ? w / ((h / 100) ** 2) : (w / (h ** 2)) * 703;
  };

  const bmi = calculateBMI();
  const getCategory = (b: number) => {
    if (b < 18.5) return 'Underweight';
    if (b < 25) return 'Normal';
    if (b < 30) return 'Overweight';
    return 'Obese';
  };

  return (
    <CalculatorCard themeId="bmi">
      <CalculatorHeader title="Body Mass Index" />
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setUnit('metric')} className={`flex-1 ${unit === 'metric' ? 'bg-white text-rose-900' : 'bg-transparent text-white/60 border-white/20'}`}>Metric</Button>
          <Button variant="outline" size="sm" onClick={() => setUnit('imperial')} className={`flex-1 ${unit === 'imperial' ? 'bg-white text-rose-900' : 'bg-transparent text-white/60 border-white/20'}`}>Imperial</Button>
        </div>
        <StyledInput label={`Weight (${unit === 'metric' ? 'kg' : 'lbs'})`} type="number" value={weight} onChange={(e: any) => setWeight(e.target.value)} />
        <StyledInput label={`Height (${unit === 'metric' ? 'cm' : 'inches'})`} type="number" value={height} onChange={(e: any) => setHeight(e.target.value)} />
        <div className="bg-black/20 p-6 text-center border border-white/10 mt-4 text-white">
          <p className="text-[10px] uppercase font-bold tracking-widest mb-2 opacity-60">Your BMI</p>
          <p className="text-5xl font-serif mb-2">{bmi > 0 ? bmi.toFixed(1) : '—'}</p>
          <p className="text-lg font-bold uppercase tracking-widest">{bmi > 0 ? getCategory(bmi) : 'Enter data'}</p>
        </div>
      </div>
    </CalculatorCard>
  );
};

// ============= LOAN/EMI CALCULATOR =============
const LoanCalculator = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(tenure);
    if (isNaN(p) || isNaN(r) || isNaN(n) || r === 0) return { emi: 0, total: 0, interest: 0 };
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    return { emi, total, interest: total - p };
  };

  const { emi, total, interest } = calculate();

  return (
    <CalculatorCard themeId="loan">
      <CalculatorHeader title="Loan Amortization" />
      <div className="space-y-4">
        <StyledInput label="Loan Amount (₦)" type="number" value={principal} onChange={(e: any) => setPrincipal(e.target.value)} />
        <StyledInput label="Annual Rate (%)" type="number" value={rate} onChange={(e: any) => setRate(e.target.value)} />
        <StyledInput label="Tenure (Months)" type="number" value={tenure} onChange={(e: any) => setTenure(e.target.value)} />
        <div className="bg-black/20 p-6 space-y-4 border border-white/10 mt-4 text-white">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Monthly EMI</p>
            <p className="text-3xl font-serif">₦{emi > 0 ? emi.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-center">
            <div><p className="text-[9px] uppercase opacity-60">Interest</p><p className="font-mono">₦{interest > 0 ? interest.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}</p></div>
            <div><p className="text-[9px] uppercase opacity-60">Total</p><p className="font-mono">₦{total > 0 ? total.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}</p></div>
          </div>
        </div>
      </div>
    </CalculatorCard>
  );
};

// ============= TIP CALCULATOR =============
const TipCalculator = () => {
  const [bill, setBill] = useState('');
  const [tipPercent, setTipPercent] = useState('15');
  const [people, setPeople] = useState('1');

  const calculate = () => {
    const b = parseFloat(bill);
    const t = parseFloat(tipPercent);
    const p = parseFloat(people);
    if (isNaN(b)) return { tip: 0, total: 0, perPerson: 0 };
    const tip = b * (t / 100);
    const total = b + tip;
    return { tip, total, perPerson: total / (p || 1) };
  };

  const { tip, total, perPerson } = calculate();

  return (
    <CalculatorCard themeId="tip">
      <CalculatorHeader title="Gratuity Splitter" />
      <div className="space-y-4">
        <StyledInput label="Bill Amount (₦)" type="number" value={bill} onChange={(e: any) => setBill(e.target.value)} />
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 block">Tip Percentage</label>
          <div className="flex gap-2 mb-2">
            {[10, 15, 20].map(t => (
              <button key={t} onClick={() => setTipPercent(String(t))} className={`px-3 py-1 text-xs border rounded-sm ${tipPercent === String(t) ? 'bg-white text-orange-800' : 'bg-transparent text-white border-white/20'}`}>{t}%</button>
            ))}
          </div>
          <StyledInput type="number" value={tipPercent} onChange={(e: any) => setTipPercent(e.target.value)} placeholder="Custom %" />
        </div>
        <StyledInput label="Split Between" type="number" value={people} onChange={(e: any) => setPeople(e.target.value)} min="1" />

        <div className="bg-black/20 p-6 mt-4 border border-white/10 text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-[9px] uppercase opacity-60">Tip</p><p className="font-mono">₦{tip.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
            <div><p className="text-[9px] uppercase opacity-60">Total</p><p className="font-mono">₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
            <div><p className="text-[9px] uppercase opacity-60">Per Person</p><p className="font-mono">₦{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
          </div>
        </div>
      </div>
    </CalculatorCard>
  );
};

// ============= DISCOUNT CALCULATOR =============
const DiscountCalculator = () => {
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [mode, setMode] = useState<'percent' | 'amount'>('percent');

  const calculate = () => {
    const p = parseFloat(originalPrice);
    const d = parseFloat(discount);
    if (isNaN(p)) return { savings: 0, finalPrice: 0 };
    const savings = mode === 'percent' ? p * (d / 100) : d || 0;
    return { savings, finalPrice: p - savings };
  };

  const { savings, finalPrice } = calculate();

  return (
    <CalculatorCard themeId="discount">
      <CalculatorHeader title="Price Reduction" />
      <div className="space-y-4">
        <StyledInput label="Original Price (₦)" type="number" value={originalPrice} onChange={(e: any) => setOriginalPrice(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMode('percent')} className={`flex-1 ${mode === 'percent' ? 'bg-white text-indigo-900' : 'bg-transparent text-white/60 border-white/20'}`}>Percent Off</Button>
          <Button variant="outline" size="sm" onClick={() => setMode('amount')} className={`flex-1 ${mode === 'amount' ? 'bg-white text-indigo-900' : 'bg-transparent text-white/60 border-white/20'}`}>Amount Off</Button>
        </div>
        <StyledInput label={`Discount ${mode === 'percent' ? '(%)' : '(₦)'}`} type="number" value={discount} onChange={(e: any) => setDiscount(e.target.value)} />

        <div className="bg-black/20 border border-white/10 p-6 mt-4 text-white">
          <div className="text-center mb-4">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Final Price</p>
            <p className="text-4xl font-serif">₦{finalPrice > 0 ? finalPrice.toLocaleString() : '—'}</p>
          </div>
          <div className="text-center border-t border-white/10 pt-4">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">You Save</p>
            <p className="text-lg font-mono">₦{savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>
    </CalculatorCard>
  );
};

// ============= BASE CONVERTER =============
const BaseConverter = () => {
  const [value, setValue] = useState('');
  const [fromBase, setFromBase] = useState('10');

  const convert = (toBase: number) => {
    const num = parseInt(value, parseInt(fromBase));
    if (isNaN(num)) return '—';
    return num.toString(toBase).toUpperCase();
  };

  return (
    <CalculatorCard themeId="base">
      <CalculatorHeader title="Radix Conversion" />
      <div className="space-y-4">
        <StyledInput label="Input Number" type="text" value={value} onChange={(e: any) => setValue(e.target.value)} />
        <StyledSelect label="From Base" value={fromBase} onValueChange={setFromBase}>
          <SelectItem value="2">Binary</SelectItem>
          <SelectItem value="8">Octal</SelectItem>
          <SelectItem value="10">Decimal</SelectItem>
          <SelectItem value="16">Hexadecimal</SelectItem>
        </StyledSelect>

        <div className="bg-black/20 p-6 space-y-3 mt-4 border border-white/10 text-white font-mono text-sm">
          {[2, 8, 10, 16].map(base => (
            <div key={base} className="flex justify-between">
              <span className="opacity-60 text-[10px] uppercase font-bold tracking-widest">Base {base}</span>
              <span>{convert(base)}</span>
            </div>
          ))}
        </div>
      </div>
    </CalculatorCard>
  );
};

// ============= GEOMETRIC CALCULATOR =============
const GeometricCalculator = () => {
  const [shape, setShape] = useState('circle');
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');

  const calculate = () => {
    const a = parseFloat(v1);
    const b = parseFloat(v2);
    if (isNaN(a)) return 0;
    switch (shape) {
      case 'circle': return Math.PI * a * a;
      case 'rectangle': return a * (isNaN(b) ? 0 : b);
      case 'sphere': return (4/3) * Math.PI * Math.pow(a, 3);
      case 'cylinder': return Math.PI * a * a * (isNaN(b) ? 0 : b);
      default: return 0;
    }
  };

  return (
    <CalculatorCard themeId="geometry">
      <CalculatorHeader title="Geometric Analysis" />
      <div className="space-y-4">
        <StyledSelect value={shape} onValueChange={setShape}>
          <SelectItem value="circle">Circle Area</SelectItem>
          <SelectItem value="rectangle">Rectangle Area</SelectItem>
          <SelectItem value="sphere">Sphere Volume</SelectItem>
          <SelectItem value="cylinder">Cylinder Volume</SelectItem>
        </StyledSelect>
        <StyledInput label={shape === 'rectangle' ? 'Length' : 'Radius'} type="number" value={v1} onChange={(e: any) => setV1(e.target.value)} />
        {(shape === 'rectangle' || shape === 'cylinder') && (
          <StyledInput label={shape === 'rectangle' ? 'Width' : 'Height'} type="number" value={v2} onChange={(e: any) => setV2(e.target.value)} />
        )}
        <ResultDisplay value={calculate().toFixed(2)} label="Result" themeId="geometry" />
      </div>
    </CalculatorCard>
  );
};

// ============= SPEED CALCULATOR =============
const SpeedDistanceTimeCalculator = () => {
  const [target, setTarget] = useState('speed');
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');

  const calculate = () => {
    const a = parseFloat(v1);
    const b = parseFloat(v2);
    if (isNaN(a) || isNaN(b)) return 0;
    if (target === 'speed') return b === 0 ? 0 : a / b;
    if (target === 'distance') return a * b;
    return b === 0 ? 0 : a / b;
  };

  return (
    <CalculatorCard themeId="speed">
      <CalculatorHeader title="Velocity Dynamics" />
      <div className="space-y-4">
        <StyledSelect label="Calculate For" value={target} onValueChange={setTarget}>
          <SelectItem value="speed">Speed (v)</SelectItem>
          <SelectItem value="distance">Distance (d)</SelectItem>
          <SelectItem value="time">Time (t)</SelectItem>
        </StyledSelect>
        <div className="grid grid-cols-2 gap-4">
          <StyledInput label={target === 'distance' ? 'Speed' : 'Distance'} type="number" value={v1} onChange={(e: any) => setV1(e.target.value)} />
          <StyledInput label={target === 'speed' ? 'Time' : target === 'distance' ? 'Time' : 'Speed'} type="number" value={v2} onChange={(e: any) => setV2(e.target.value)} />
        </div>
        <ResultDisplay value={calculate().toFixed(2)} label={`Result (${target})`} themeId="speed" />
      </div>
    </CalculatorCard>
  );
};

// ============= COMPOUND INTEREST =============
const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState('12');

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const n = parseFloat(frequency);
    if (isNaN(p) || isNaN(r) || isNaN(t)) return 0;
    return p * Math.pow(1 + (r / n), n * t);
  };

  return (
    <CalculatorCard themeId="compound">
      <CalculatorHeader title="Compound Growth" />
      <div className="space-y-4">
        <StyledInput label="Principal Amount (₦)" type="number" value={principal} onChange={(e: any) => setPrincipal(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <StyledInput label="Rate (%)" type="number" value={rate} onChange={(e: any) => setRate(e.target.value)} />
          <StyledInput label="Time (Years)" type="number" value={time} onChange={(e: any) => setTime(e.target.value)} />
        </div>
        <StyledSelect label="Compound Frequency" value={frequency} onValueChange={setFrequency}>
          <SelectItem value="1">Annually</SelectItem>
          <SelectItem value="4">Quarterly</SelectItem>
          <SelectItem value="12">Monthly</SelectItem>
        </StyledSelect>
        <ResultDisplay value={`₦${calculate().toLocaleString(undefined, { maximumFractionDigits: 2 })}`} label="Total Value" themeId="compound" />
      </div>
    </CalculatorCard>
  );
};

// ============= BMR CALCULATOR =============
const BMRCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('1.2');

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    const act = parseFloat(activity);
    if (isNaN(w) || isNaN(h) || isNaN(a)) return 0;
    let bmr = (10 * w) + (6.25 * h) - (5 * a) + (gender === 'male' ? 5 : -161);
    return bmr * act;
  };

  return (
    <CalculatorCard themeId="bmr">
      <CalculatorHeader title="Metabolic Rate" />
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setGender('male')} className={`flex-1 ${gender === 'male' ? 'bg-white text-red-900' : 'bg-transparent text-white/60 border-white/20'}`}>Male</Button>
          <Button variant="outline" size="sm" onClick={() => setGender('female')} className={`flex-1 ${gender === 'female' ? 'bg-white text-red-900' : 'bg-transparent text-white/60 border-white/20'}`}>Female</Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StyledInput label="Weight" type="number" value={weight} onChange={(e: any) => setWeight(e.target.value)} />
          <StyledInput label="Height" type="number" value={height} onChange={(e: any) => setHeight(e.target.value)} />
          <StyledInput label="Age" type="number" value={age} onChange={(e: any) => setAge(e.target.value)} />
        </div>
        <StyledSelect label="Activity Level" value={activity} onValueChange={setActivity}>
          <SelectItem value="1.2">Sedentary</SelectItem>
          <SelectItem value="1.375">Light Exercise</SelectItem>
          <SelectItem value="1.55">Moderate Exercise</SelectItem>
          <SelectItem value="1.725">Heavy Exercise</SelectItem>
          <SelectItem value="1.9">Athlete</SelectItem>
        </StyledSelect>
        <ResultDisplay value={Math.round(calculate()).toLocaleString()} label="Daily Calories (TDEE)" themeId="bmr" />
      </div>
    </CalculatorCard>
  );
};

// ============= MAIN PAGE =============
const calculators = [
  { id: 'basic', name: 'Basic', icon: Calculator, description: 'Standard arithmetic operations' },
  { id: 'scientific', name: 'Scientific', icon: Hash, description: 'Trigonometry, logs, and more' },
  { id: 'percentage', name: 'Percentage', icon: Percent, description: 'Percent calculations' },
  { id: 'unit', name: 'Unit Converter', icon: Ruler, description: 'Convert between units' },
  { id: 'age', name: 'Age Calculator', icon: Calendar, description: 'Calculate exact age' },
  { id: 'bmi', name: 'BMI Calculator', icon: Scale, description: 'Body Mass Index' },
  { id: 'loan', name: 'Loan/EMI', icon: DollarSign, description: 'Monthly payments' },
  { id: 'tip', name: 'Tip Calculator', icon: PieChart, description: 'Split bills easily' },
  { id: 'discount', name: 'Discount', icon: DollarSign, description: 'Sale price calculator' },
  { id: 'base', name: 'Number Base', icon: Hash, description: 'Binary, hex, octal' },
  { id: 'geometry', name: 'Geometry', icon: Box, description: 'Area and Volume' },
  { id: 'speed', name: 'Speed/Distance', icon: Gauge, description: 'Velocity calculations' },
  { id: 'compound', name: 'Compound Interest', icon: TrendingUp, description: 'Investment growth' },
  { id: 'bmr', name: 'BMR/TDEE', icon: Activity, description: 'Metabolic Rate' },
];

const CalculatorSuitePage = () => {
  const navigate = useNavigate();
  const [activeCalc, setActiveCalc] = useState('basic');

  const renderCalculator = () => {
    switch (activeCalc) {
      case 'basic': return <BasicCalculator />;
      case 'scientific': return <ScientificCalculator />;
      case 'percentage': return <PercentageCalculator />;
      case 'unit': return <UnitConverter />;
      case 'age': return <AgeCalculator />;
      case 'bmi': return <BMICalculator />;
      case 'loan': return <LoanCalculator />;
      case 'tip': return <TipCalculator />;
      case 'discount': return <DiscountCalculator />;
      case 'base': return <BaseConverter />;
      case 'geometry': return <GeometricCalculator />;
      case 'speed': return <SpeedDistanceTimeCalculator />;
      case 'compound': return <CompoundInterestCalculator />;
      case 'bmr': return <BMRCalculator />;
      default: return <BasicCalculator />;
    }
  };

  const activeCalculator = calculators.find(c => c.id === activeCalc);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <SEO 
        title="Calculator Suite - Resources" 
        description="A comprehensive collection of calculators for everyday calculations." 
      />

      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/resources')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Resources</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator size={16} className="text-nobel-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Utility Tool</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif text-ui-blue leading-tight mb-4">
            Calculator <span className="italic text-slate-400">Suite</span>
          </h1>
          
          <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">
            A comprehensive collection of 14 calculators for all your everyday mathematical needs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-md mx-auto mb-8 relative z-10">
            <Select value={activeCalc} onValueChange={setActiveCalc}>
              <SelectTrigger className="w-full bg-white/60 backdrop-blur-md border-slate-200 h-12">
                <SelectValue placeholder="Select a calculator" />
              </SelectTrigger>
              <SelectContent className="bg-white/80 backdrop-blur-md max-h-[300px]">
                {calculators.map((calc) => {
                  const Icon = calc.icon;
                  return (
                    <SelectItem key={calc.id} value={calc.id}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-slate-500" />
                        <span>{calc.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif text-ui-blue mb-2">{activeCalculator?.name} Calculator</h2>
            <p className="text-slate-500">{activeCalculator?.description}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCalc}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderCalculator()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CalculatorSuitePage;

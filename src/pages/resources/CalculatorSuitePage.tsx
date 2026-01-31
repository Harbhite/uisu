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

// ============= SHARED STYLES =============
const calculatorCardClass = "bg-slate-900 border border-slate-800 border-l-4 border-l-nobel-gold p-8 max-w-md mx-auto shadow-2xl relative overflow-hidden group";
const calculatorHeaderClass = "flex justify-between items-center mb-6 border-b border-white/5 pb-4";
const calculatorTitleClass = "font-serif italic text-nobel-gold text-lg";
const inputLabelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block";
const inputClass = "bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-nobel-gold";
const resultDisplayClass = "bg-slate-950 text-nobel-gold p-6 text-center border border-white/5 shadow-inner mt-6";
const resultLabelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2";
const resultValueClass = "text-3xl font-mono tracking-widest";
const actionButtonClass = "w-full py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-ui-blue transition-all mt-4";

// ============= BASIC CALCULATOR =============
const BasicCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setWaitingForOperand(false);
  };

  const performOperation = (operator: string) => {
    const inputValue = parseFloat(display);
    
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
    { label: 'C', action: clear, className: 'bg-red-950 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white' },
    { label: '±', action: () => setDisplay(String(-parseFloat(display))), className: 'bg-slate-800 text-slate-400' },
    { label: '%', action: () => setDisplay(String(parseFloat(display) / 100)), className: 'bg-slate-800 text-slate-400' },
    { label: '÷', action: () => performOperation('÷'), className: 'bg-ui-blue text-white hover:bg-nobel-gold hover:text-ui-blue' },
    { label: '7', action: () => inputDigit('7') },
    { label: '8', action: () => inputDigit('8') },
    { label: '9', action: () => inputDigit('9') },
    { label: '×', action: () => performOperation('×'), className: 'bg-ui-blue text-white hover:bg-nobel-gold hover:text-ui-blue' },
    { label: '4', action: () => inputDigit('4') },
    { label: '5', action: () => inputDigit('5') },
    { label: '6', action: () => inputDigit('6') },
    { label: '−', action: () => performOperation('-'), className: 'bg-ui-blue text-white hover:bg-nobel-gold hover:text-ui-blue' },
    { label: '1', action: () => inputDigit('1') },
    { label: '2', action: () => inputDigit('2') },
    { label: '3', action: () => inputDigit('3') },
    { label: '+', action: () => performOperation('+'), className: 'bg-ui-blue text-white hover:bg-nobel-gold hover:text-ui-blue' },
    { label: '0', action: () => inputDigit('0'), className: 'col-span-2' },
    { label: '.', action: inputDecimal },
    { label: '=', action: () => performOperation('='), className: 'bg-nobel-gold text-ui-blue hover:bg-white' },
  ];

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Standard Mode</h3>
      </div>
      <div className="bg-slate-950 text-nobel-gold p-6 mb-6 rounded-none border border-white/5 shadow-inner">
        <div className="text-xs text-slate-500 h-5 overflow-hidden text-right font-mono">{expression}</div>
        <div className="text-3xl font-mono text-right truncate tracking-widest">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`p-4 text-lg font-mono transition-all duration-300 border border-white/5 ${btn.className || 'bg-slate-800/50 text-white hover:bg-white/10'}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============= SCIENTIFIC CALCULATOR =============
const ScientificCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [isRadians, setIsRadians] = useState(true);

  const calculate = (fn: string) => {
    const num = parseFloat(display);
    let result: number;
    const angle = isRadians ? num : (num * Math.PI) / 180;
    
    switch (fn) {
      case 'sin': result = Math.sin(angle); break;
      case 'cos': result = Math.cos(angle); break;
      case 'tan': result = Math.tan(angle); break;
      case 'log': result = Math.log10(num); break;
      case 'ln': result = Math.log(num); break;
      case 'sqrt': result = Math.sqrt(num); break;
      case 'square': result = num * num; break;
      case 'cube': result = num * num * num; break;
      case 'inverse': result = 1 / num; break;
      case 'factorial': 
        result = num < 0 ? NaN : num <= 1 ? 1 : parseFloat(String([...Array(Math.floor(num))].reduce((a, _, i) => a * (i + 1), 1)));
        break;
      case 'pi': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case 'exp': result = Math.exp(num); break;
      case 'abs': result = Math.abs(num); break;
      default: result = num;
    }
    setDisplay(String(result));
  };

  const inputDigit = (digit: string) => {
    setDisplay(display === '0' || display === 'Error' ? digit : display + digit);
  };

  const clear = () => setDisplay('0');

  const scientificButtons = [
    { label: 'sin', action: () => calculate('sin') },
    { label: 'cos', action: () => calculate('cos') },
    { label: 'tan', action: () => calculate('tan') },
    { label: 'log', action: () => calculate('log') },
    { label: 'ln', action: () => calculate('ln') },
    { label: '√', action: () => calculate('sqrt') },
    { label: 'x²', action: () => calculate('square') },
    { label: 'x³', action: () => calculate('cube') },
    { label: '1/x', action: () => calculate('inverse') },
    { label: 'n!', action: () => calculate('factorial') },
    { label: 'π', action: () => calculate('pi') },
    { label: 'e', action: () => calculate('e') },
    { label: 'eˣ', action: () => calculate('exp') },
    { label: '|x|', action: () => calculate('abs') },
    { label: 'C', action: clear, className: 'bg-red-950 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white' },
  ];

  return (
    <div className={calculatorCardClass}>
       {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-nobel-gold/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Scientific Mode</h3>
        <button
          onClick={() => setIsRadians(!isRadians)}
          className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-slate-800 text-slate-400 border border-white/5 hover:text-nobel-gold transition-colors"
        >
          {isRadians ? 'RAD' : 'DEG'}
        </button>
      </div>

      <div className="bg-slate-950 text-nobel-gold p-6 mb-6 rounded-none border border-white/5 shadow-inner">
        <div className="text-3xl font-mono text-right truncate tracking-widest">{display}</div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {scientificButtons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`p-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${btn.className || 'bg-slate-800 text-slate-400 border border-white/5 hover:bg-nobel-gold hover:text-ui-blue'}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-4">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map(n => (
          <button
            key={n}
            onClick={() => inputDigit(String(n))}
            className={`p-4 text-lg font-mono transition-all duration-300 bg-slate-800/50 text-white border border-white/5 hover:bg-white/10 hover:border-white/20 ${n === 0 ? 'col-span-4' : ''}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
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
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Percentage Mode</h3>
      </div>
      <div className="space-y-4">
        <Select value={mode} onValueChange={(v: any) => setMode(v)}>
          <SelectTrigger className="w-full bg-slate-950 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-white">
            <SelectItem value="of">What is X% of Y?</SelectItem>
            <SelectItem value="increase">Increase Y by X%</SelectItem>
            <SelectItem value="decrease">Decrease Y by X%</SelectItem>
            <SelectItem value="what">X is what % of Y?</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={inputLabelClass}>{mode === 'what' ? 'Part' : 'Percentage'}</label>
            <Input
              type="number"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              placeholder={mode === 'what' ? 'Part value' : 'e.g., 25'}
              className={inputClass}
            />
          </div>
          <div>
            <label className={inputLabelClass}>{mode === 'what' ? 'Whole' : 'Value'}</label>
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 200"
              className={inputClass}
            />
          </div>
        </div>

        <div className={resultDisplayClass}>
          <p className={resultLabelClass}>Result</p>
          <p className={resultValueClass}>{calculate()}</p>
        </div>
      </div>
    </div>
  );
};

// ============= UNIT CONVERTER =============
const UnitConverter = () => {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [category, setCategory] = useState('length');

  const conversions: { [key: string]: { [key: string]: number } } = {
    length: {
      m: 1, km: 0.001, cm: 100, mm: 1000, mi: 0.000621371, 
      ft: 3.28084, in: 39.3701, yd: 1.09361
    },
    weight: {
      kg: 1, g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274, t: 0.001
    },
    temperature: {
      c: 1, f: 1, k: 1 // Special handling needed
    }
  };

  const unitNames: { [key: string]: string } = {
    m: 'Meters', km: 'Kilometers', cm: 'Centimeters', mm: 'Millimeters',
    mi: 'Miles', ft: 'Feet', in: 'Inches', yd: 'Yards',
    kg: 'Kilograms', g: 'Grams', mg: 'Milligrams', lb: 'Pounds', oz: 'Ounces', t: 'Tonnes',
    c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin'
  };

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return '—';

    if (category === 'temperature') {
      let celsius: number;
      if (fromUnit === 'c') celsius = v;
      else if (fromUnit === 'f') celsius = (v - 32) * 5/9;
      else celsius = v - 273.15;

      if (toUnit === 'c') return celsius.toFixed(2);
      if (toUnit === 'f') return ((celsius * 9/5) + 32).toFixed(2);
      return (celsius + 273.15).toFixed(2);
    }

    const baseValue = v / conversions[category][fromUnit];
    return (baseValue * conversions[category][toUnit]).toFixed(4);
  };

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Unit Conversion</h3>
      </div>
      <div className="space-y-4">
        <Select value={category} onValueChange={(v) => { setCategory(v); setFromUnit(Object.keys(conversions[v])[0]); setToUnit(Object.keys(conversions[v])[1]); }}>
          <SelectTrigger className="w-full bg-slate-950 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-white">
            <SelectItem value="length">Length</SelectItem>
            <SelectItem value="weight">Weight</SelectItem>
            <SelectItem value="temperature">Temperature</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value"
          className={inputClass}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger className="bg-slate-950 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              {Object.keys(conversions[category]).map(u => (
                <SelectItem key={u} value={u}>{unitNames[u]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger className="bg-slate-950 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              {Object.keys(conversions[category]).map(u => (
                <SelectItem key={u} value={u}>{unitNames[u]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={resultDisplayClass}>
          <p className={resultLabelClass}>{unitNames[toUnit]}</p>
          <p className={resultValueClass}>{convert()}</p>
        </div>
      </div>
    </div>
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

    if (days < 0) {
      months--;
      days += new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays };
  };

  const age = calculateAge();

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Chronological Age</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className={inputLabelClass}>Date of Birth</label>
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>
        <div>
          <label className={inputLabelClass}>Target Date</label>
          <Input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>

        <div className="bg-slate-950 border border-white/5 rounded-none p-6 mt-6">
          <p className={`${resultLabelClass} text-center mb-4`}>Calculated Duration</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-mono text-white">{age.years}</p>
              <p className="text-[8px] uppercase tracking-widest text-slate-500">Years</p>
            </div>
            <div>
              <p className="text-3xl font-mono text-white">{age.months}</p>
              <p className="text-[8px] uppercase tracking-widest text-slate-500">Months</p>
            </div>
            <div>
              <p className="text-3xl font-mono text-white">{age.days}</p>
              <p className="text-[8px] uppercase tracking-widest text-slate-500">Days</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total: <span className="text-nobel-gold">{age.totalDays.toLocaleString()}</span> days</p>
          </div>
        </div>
      </div>
    </div>
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

    if (unit === 'metric') {
      return w / ((h / 100) ** 2);
    } else {
      return (w / (h ** 2)) * 703;
    }
  };

  const bmi = calculateBMI();

  const getCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };

  const category = getCategory(bmi);

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Body Mass Index</h3>
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant={unit === 'metric' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setUnit('metric')}
            className={`flex-1 ${unit === 'metric' ? 'bg-ui-blue hover:bg-ui-blue/90' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white hover:bg-white/5'}`}
          >
            Metric
          </Button>
          <Button 
            variant={unit === 'imperial' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setUnit('imperial')}
            className={`flex-1 ${unit === 'imperial' ? 'bg-ui-blue hover:bg-ui-blue/90' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white hover:bg-white/5'}`}
          >
            Imperial
          </Button>
        </div>

        <div>
          <label className={inputLabelClass}>
            Weight ({unit === 'metric' ? 'kg' : 'lbs'})
          </label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
            className={inputClass}
          />
        </div>
        <div>
          <label className={inputLabelClass}>
            Height ({unit === 'metric' ? 'cm' : 'inches'})
          </label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={unit === 'metric' ? 'e.g., 175' : 'e.g., 69'}
            className={inputClass}
          />
        </div>

        <div className="bg-slate-950 p-6 text-center border border-white/5 mt-4">
          <p className={resultLabelClass}>Your BMI</p>
          <p className="text-5xl font-serif mb-2 text-white">{bmi > 0 ? bmi.toFixed(1) : '—'}</p>
          <p className={`text-lg font-bold uppercase tracking-widest ${bmi > 0 ? category.color : 'text-slate-600'}`}>{bmi > 0 ? category.label : 'Enter data'}</p>
        </div>
      </div>
    </div>
  );
};

// ============= LOAN/EMI CALCULATOR =============
const LoanCalculator = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');

  const calculateEMI = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(tenure);
    
    if (isNaN(p) || isNaN(r) || isNaN(n) || r === 0 || n === 0) return { emi: 0, total: 0, interest: 0 };

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - p;

    return { emi, total, interest };
  };

  const { emi, total, interest } = calculateEMI();

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Loan Amortization</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className={inputLabelClass}>Loan Amount (₦)</label>
          <Input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g., 1000000"
            className={inputClass}
          />
        </div>
        <div>
          <label className={inputLabelClass}>Annual Interest Rate (%)</label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g., 15"
            className={inputClass}
          />
        </div>
        <div>
          <label className={inputLabelClass}>Tenure (months)</label>
          <Input
            type="number"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            placeholder="e.g., 24"
            className={inputClass}
          />
        </div>

        <div className="bg-slate-950 p-6 space-y-4 border border-white/5 mt-4">
          <div className="text-center">
            <p className={resultLabelClass}>Monthly EMI</p>
            <p className="text-3xl font-serif text-nobel-gold">₦{emi > 0 ? emi.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className={resultLabelClass}>Total Interest</p>
              <p className="text-sm font-mono text-white">₦{interest > 0 ? interest.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}</p>
            </div>
            <div className="text-center">
              <p className={resultLabelClass}>Total Payment</p>
              <p className="text-sm font-mono text-white">₦{total > 0 ? total.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    
    if (isNaN(b) || b === 0) return { tip: 0, total: 0, perPerson: 0 };

    const tip = b * (t / 100);
    const total = b + tip;
    const perPerson = total / (p || 1);

    return { tip, total, perPerson };
  };

  const { tip, total, perPerson } = calculate();

  const quickTips = [10, 15, 18, 20, 25];

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Gratuity Splitter</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className={inputLabelClass}>Bill Amount (₦)</label>
          <Input
            type="number"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            placeholder="e.g., 5000"
            className={inputClass}
          />
        </div>

        <div>
          <label className={inputLabelClass}>Tip Percentage</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {quickTips.map(t => (
              <Button
                key={t}
                variant="outline"
                size="sm"
                onClick={() => setTipPercent(String(t))}
                className={tipPercent === String(t) ? 'bg-nobel-gold text-ui-blue border-nobel-gold' : 'bg-transparent border-slate-700 text-slate-400 hover:text-white'}
              >
                {t}%
              </Button>
            ))}
          </div>
          <Input
            type="number"
            value={tipPercent}
            onChange={(e) => setTipPercent(e.target.value)}
            placeholder="Custom %"
            className={inputClass}
          />
        </div>

        <div>
          <label className={inputLabelClass}>Split Between</label>
          <Input
            type="number"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder="Number of people"
            min="1"
            className={inputClass}
          />
        </div>

        <div className="bg-slate-950 p-6 mt-4 border border-white/5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className={resultLabelClass}>Tip</p>
              <p className="text-lg font-mono text-white">₦{tip.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className={resultLabelClass}>Total</p>
              <p className="text-lg font-mono text-white">₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className={resultLabelClass}>Per Person</p>
              <p className="text-lg font-mono text-white">₦{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= DISCOUNT CALCULATOR =============
const DiscountCalculator = () => {
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [mode, setMode] = useState<'percent' | 'amount'>('percent');

  const calculate = () => {
    const price = parseFloat(originalPrice);
    const disc = parseFloat(discount);
    
    if (isNaN(price)) return { savings: 0, finalPrice: 0, percentOff: 0 };

    let savings: number;
    if (mode === 'percent') {
      savings = price * (disc / 100);
    } else {
      savings = disc || 0;
    }

    const finalPrice = price - savings;
    const percentOff = (savings / price) * 100;

    return { savings, finalPrice, percentOff };
  };

  const { savings, finalPrice, percentOff } = calculate();

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Price Reduction</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className={inputLabelClass}>Original Price (₦)</label>
          <Input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="e.g., 10000"
            className={inputClass}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            variant={mode === 'percent' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMode('percent')}
            className={`flex-1 ${mode === 'percent' ? 'bg-ui-blue hover:bg-ui-blue/90' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white hover:bg-white/5'}`}
          >
            Percent Off
          </Button>
          <Button 
            variant={mode === 'amount' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMode('amount')}
            className={`flex-1 ${mode === 'amount' ? 'bg-ui-blue hover:bg-ui-blue/90' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white hover:bg-white/5'}`}
          >
            Amount Off
          </Button>
        </div>

        <div>
          <label className={inputLabelClass}>
            Discount {mode === 'percent' ? '(%)' : '(₦)'}
          </label>
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder={mode === 'percent' ? 'e.g., 20' : 'e.g., 2000'}
            className={inputClass}
          />
        </div>

        <div className="bg-emerald-950/30 border border-emerald-900/50 p-6 rounded-none mt-4">
          <div className="text-center mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Final Price</p>
            <p className="text-4xl font-serif text-white">₦{finalPrice > 0 ? finalPrice.toLocaleString() : '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">You Save</p>
              <p className="text-lg font-mono text-white">₦{savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Discount</p>
              <p className="text-lg font-mono text-white">{percentOff.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= NUMBER BASE CONVERTER =============
const BaseConverter = () => {
  const [value, setValue] = useState('');
  const [fromBase, setFromBase] = useState('10');

  const convert = (toBase: number) => {
    const num = parseInt(value, parseInt(fromBase));
    if (isNaN(num)) return '—';
    return num.toString(toBase).toUpperCase();
  };

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Radix Conversion</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className={inputLabelClass}>Input Number</label>
          <Input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter number"
            className={inputClass}
          />
        </div>

        <div>
          <label className={inputLabelClass}>From Base</label>
          <Select value={fromBase} onValueChange={setFromBase}>
            <SelectTrigger className="bg-slate-950 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="2">Binary (Base 2)</SelectItem>
              <SelectItem value="8">Octal (Base 8)</SelectItem>
              <SelectItem value="10">Decimal (Base 10)</SelectItem>
              <SelectItem value="16">Hexadecimal (Base 16)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-slate-950 p-6 space-y-3 mt-4 border border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Binary</span>
            <span className="font-mono text-white">{convert(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Octal</span>
            <span className="font-mono text-white">{convert(8)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Decimal</span>
            <span className="font-mono text-white">{convert(10)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Hexadecimal</span>
            <span className="font-mono text-white">{convert(16)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= NEW: GEOMETRIC CALCULATOR =============
const GeometricCalculator = () => {
  const [shape, setShape] = useState('circle');
  const [v1, setV1] = useState(''); // radius, length
  const [v2, setV2] = useState(''); // width, height

  const calculate = () => {
    const a = parseFloat(v1);
    const b = parseFloat(v2);
    if (isNaN(a)) return { result: 0, label: 'Result' };

    switch (shape) {
      case 'circle': return { result: Math.PI * a * a, label: 'Area' };
      case 'rectangle': return { result: a * (isNaN(b) ? 0 : b), label: 'Area' };
      case 'sphere': return { result: (4/3) * Math.PI * Math.pow(a, 3), label: 'Volume' };
      case 'cylinder': return { result: Math.PI * a * a * (isNaN(b) ? 0 : b), label: 'Volume' };
      default: return { result: 0, label: '-' };
    }
  };

  const { result, label } = calculate();

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Geometric Analysis</h3>
      </div>
      <div className="space-y-4">
        <Select value={shape} onValueChange={setShape}>
          <SelectTrigger className="bg-slate-950 border-white/10 text-white"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-white">
            <SelectItem value="circle">Circle Area</SelectItem>
            <SelectItem value="rectangle">Rectangle Area</SelectItem>
            <SelectItem value="sphere">Sphere Volume</SelectItem>
            <SelectItem value="cylinder">Cylinder Volume</SelectItem>
          </SelectContent>
        </Select>

        <div>
          <label className={inputLabelClass}>
            {shape === 'rectangle' ? 'Length' : 'Radius'}
          </label>
          <Input
            type="number"
            value={v1}
            onChange={(e) => setV1(e.target.value)}
            className={inputClass}
          />
        </div>

        {(shape === 'rectangle' || shape === 'cylinder') && (
          <div>
            <label className={inputLabelClass}>
              {shape === 'rectangle' ? 'Width' : 'Height'}
            </label>
            <Input
              type="number"
              value={v2}
              onChange={(e) => setV2(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div className={resultDisplayClass}>
          <p className={resultLabelClass}>{label}</p>
          <p className={resultValueClass}>{result > 0 ? result.toFixed(2) : '—'}</p>
        </div>
      </div>
    </div>
  );
};

// ============= NEW: SPEED / DISTANCE / TIME =============
const SpeedDistanceTimeCalculator = () => {
  const [target, setTarget] = useState('speed'); // what to find
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');

  const calculate = () => {
    const a = parseFloat(v1);
    const b = parseFloat(v2);
    if (isNaN(a) || isNaN(b)) return 0;

    switch (target) {
      case 'speed': // Distance / Time
        return b === 0 ? 0 : a / b;
      case 'distance': // Speed * Time
        return a * b;
      case 'time': // Distance / Speed
        return b === 0 ? 0 : a / b;
      default: return 0;
    }
  };

  const result = calculate();

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Velocity Dynamics</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className={inputLabelClass}>Calculate For</label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger className="bg-slate-950 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="speed">Speed (v)</SelectItem>
              <SelectItem value="distance">Distance (d)</SelectItem>
              <SelectItem value="time">Time (t)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={inputLabelClass}>
              {target === 'speed' ? 'Distance' : target === 'distance' ? 'Speed' : 'Distance'}
            </label>
            <Input
              type="number"
              value={v1}
              onChange={(e) => setV1(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={inputLabelClass}>
              {target === 'speed' ? 'Time' : target === 'distance' ? 'Time' : 'Speed'}
            </label>
            <Input
              type="number"
              value={v2}
              onChange={(e) => setV2(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className={resultDisplayClass}>
          <p className={resultLabelClass}>Result ({target})</p>
          <p className={resultValueClass}>{result > 0 ? result.toFixed(2) : '—'}</p>
        </div>
      </div>
    </div>
  );
};

// ============= NEW: COMPOUND INTEREST =============
const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState('12'); // monthly

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const n = parseFloat(frequency);

    if (isNaN(p) || isNaN(r) || isNaN(t)) return { amount: 0, interest: 0 };

    const amount = p * Math.pow(1 + (r / n), n * t);
    return { amount, interest: amount - p };
  };

  const { amount, interest } = calculate();

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Compound Growth</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className={inputLabelClass}>Principal Amount (₦)</label>
          <Input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={inputLabelClass}>Rate (%)</label>
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={inputLabelClass}>Time (Years)</label>
            <Input
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={inputLabelClass}>Compound Frequency</label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="bg-slate-950 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="1">Annually</SelectItem>
              <SelectItem value="4">Quarterly</SelectItem>
              <SelectItem value="12">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-slate-950 p-6 mt-4 border border-white/5 space-y-4">
          <div className="text-center">
             <p className={resultLabelClass}>Total Value</p>
             <p className="text-3xl font-serif text-nobel-gold">₦{amount > 0 ? amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</p>
          </div>
           <div className="text-center pt-4 border-t border-white/5">
             <p className={resultLabelClass}>Total Interest</p>
             <p className="text-lg font-mono text-white">+{interest > 0 ? interest.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= NEW: BMR CALCULATOR =============
const BMRCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('1.2');

  const calculate = () => {
    const w = parseFloat(weight); // kg
    const h = parseFloat(height); // cm
    const a = parseFloat(age); // years
    const act = parseFloat(activity);

    if (isNaN(w) || isNaN(h) || isNaN(a)) return 0;

    // Mifflin-St Jeor Equation
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += gender === 'male' ? 5 : -161;

    return bmr * act;
  };

  const calories = calculate();

  return (
    <div className={calculatorCardClass}>
      <div className={calculatorHeaderClass}>
        <h3 className={calculatorTitleClass}>Metabolic Rate</h3>
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
           <Button
            variant={gender === 'male' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGender('male')}
            className={`flex-1 ${gender === 'male' ? 'bg-ui-blue hover:bg-ui-blue/90' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white hover:bg-white/5'}`}
          >
            Male
          </Button>
          <Button
            variant={gender === 'female' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGender('female')}
            className={`flex-1 ${gender === 'female' ? 'bg-ui-blue hover:bg-ui-blue/90' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white hover:bg-white/5'}`}
          >
            Female
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
             <label className={inputLabelClass}>Weight (kg)</label>
             <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} />
          </div>
          <div>
             <label className={inputLabelClass}>Height (cm)</label>
             <Input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} />
          </div>
          <div>
             <label className={inputLabelClass}>Age</label>
             <Input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
           <label className={inputLabelClass}>Activity Level</label>
           <Select value={activity} onValueChange={setActivity}>
            <SelectTrigger className="bg-slate-950 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="1.2">Sedentary (Office job)</SelectItem>
              <SelectItem value="1.375">Light Exercise (1-3 days)</SelectItem>
              <SelectItem value="1.55">Moderate Exercise (3-5 days)</SelectItem>
              <SelectItem value="1.725">Heavy Exercise (6-7 days)</SelectItem>
              <SelectItem value="1.9">Athlete (2x daily)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={resultDisplayClass}>
           <p className={resultLabelClass}>Daily Calories (TDEE)</p>
           <p className={resultValueClass}>{calories > 0 ? Math.round(calories).toLocaleString() : '—'}</p>
           <p className="text-[10px] text-slate-500 mt-2">Maintenance Calories</p>
        </div>
      </div>
    </div>
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
        {/* Back Button */}
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

        {/* Header */}
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

        {/* Main Calculator Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Calculator Selector */}
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

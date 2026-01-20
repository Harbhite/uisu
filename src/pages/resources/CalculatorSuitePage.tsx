import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calculator, Percent, Scale, Clock, Calendar, 
  Ruler, Thermometer, DollarSign, PieChart, Hash
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

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
    { label: 'C', action: clear, className: 'bg-red-100 text-red-600 hover:bg-red-200' },
    { label: '±', action: () => setDisplay(String(-parseFloat(display))), className: 'bg-slate-100' },
    { label: '%', action: () => setDisplay(String(parseFloat(display) / 100)), className: 'bg-slate-100' },
    { label: '÷', action: () => performOperation('÷'), className: 'bg-nobel-gold text-white hover:bg-nobel-gold/90' },
    { label: '7', action: () => inputDigit('7') },
    { label: '8', action: () => inputDigit('8') },
    { label: '9', action: () => inputDigit('9') },
    { label: '×', action: () => performOperation('×'), className: 'bg-nobel-gold text-white hover:bg-nobel-gold/90' },
    { label: '4', action: () => inputDigit('4') },
    { label: '5', action: () => inputDigit('5') },
    { label: '6', action: () => inputDigit('6') },
    { label: '−', action: () => performOperation('-'), className: 'bg-nobel-gold text-white hover:bg-nobel-gold/90' },
    { label: '1', action: () => inputDigit('1') },
    { label: '2', action: () => inputDigit('2') },
    { label: '3', action: () => inputDigit('3') },
    { label: '+', action: () => performOperation('+'), className: 'bg-nobel-gold text-white hover:bg-nobel-gold/90' },
    { label: '0', action: () => inputDigit('0'), className: 'col-span-2' },
    { label: '.', action: inputDecimal },
    { label: '=', action: () => performOperation('='), className: 'bg-ui-blue text-white hover:bg-ui-blue/90' },
  ];

  return (
    <div className="bg-white border border-slate-200 p-6 max-w-sm mx-auto">
      <div className="bg-slate-900 text-white p-4 mb-4 rounded-lg">
        <div className="text-xs text-slate-400 h-5 overflow-hidden">{expression}</div>
        <div className="text-3xl font-mono text-right truncate">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`p-4 text-lg font-medium rounded-lg transition-colors ${btn.className || 'bg-slate-50 hover:bg-slate-100'}`}
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
        result = num < 0 ? NaN : num <= 1 ? 1 : num * parseFloat(String([...Array(Math.floor(num))].reduce((a, _, i) => a * (i + 1), 1)));
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
    { label: 'C', action: clear, className: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="bg-white border border-slate-200 p-6 max-w-md mx-auto">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsRadians(!isRadians)}
          className="text-xs px-3 py-1 rounded bg-slate-100"
        >
          {isRadians ? 'RAD' : 'DEG'}
        </button>
      </div>
      <div className="bg-slate-900 text-white p-4 mb-4 rounded-lg">
        <div className="text-3xl font-mono text-right truncate">{display}</div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {scientificButtons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`p-3 text-sm font-medium rounded-lg transition-colors ${btn.className || 'bg-slate-100 hover:bg-slate-200'}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map(n => (
          <button
            key={n}
            onClick={() => inputDigit(String(n))}
            className="p-3 text-lg font-medium rounded-lg bg-slate-50 hover:bg-slate-100"
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
      case 'what': return ((v / p) * 100).toFixed(2) + '%';
      default: return '—';
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <Select value={mode} onValueChange={(v) => setMode(v as 'of' | 'increase' | 'decrease' | 'what')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="of">What is X% of Y?</SelectItem>
            <SelectItem value="increase">Increase Y by X%</SelectItem>
            <SelectItem value="decrease">Decrease Y by X%</SelectItem>
            <SelectItem value="what">X is what % of Y?</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">{mode === 'what' ? 'Part' : 'Percentage'}</label>
            <Input
              type="number"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              placeholder={mode === 'what' ? 'Part value' : 'e.g., 25'}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">{mode === 'what' ? 'Whole' : 'Value'}</label>
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 200"
            />
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 text-center rounded-lg">
          <p className="text-xs text-slate-400 mb-2">Result</p>
          <p className="text-4xl font-serif">{calculate()}</p>
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
    <div className="bg-white border border-slate-200 p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <Select value={category} onValueChange={(v) => { setCategory(v); setFromUnit(Object.keys(conversions[v])[0]); setToUnit(Object.keys(conversions[v])[1]); }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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
          className="text-lg"
        />

        <div className="grid grid-cols-2 gap-4">
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(conversions[category]).map(u => (
                <SelectItem key={u} value={u}>{unitNames[u]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(conversions[category]).map(u => (
                <SelectItem key={u} value={u}>{unitNames[u]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-slate-900 text-white p-6 text-center rounded-lg">
          <p className="text-xs text-slate-400 mb-2">{unitNames[toUnit]}</p>
          <p className="text-4xl font-serif">{convert()}</p>
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
    <div className="bg-white border border-slate-200 p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Date of Birth</label>
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Target Date</label>
          <Input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-lg">
          <p className="text-xs text-slate-400 mb-4 text-center">Your Age</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-serif">{age.years}</p>
              <p className="text-xs text-slate-400">Years</p>
            </div>
            <div>
              <p className="text-3xl font-serif">{age.months}</p>
              <p className="text-xs text-slate-400">Months</p>
            </div>
            <div>
              <p className="text-3xl font-serif">{age.days}</p>
              <p className="text-xs text-slate-400">Days</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <p className="text-sm text-slate-300">Total: <span className="font-bold">{age.totalDays.toLocaleString()}</span> days</p>
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
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-500' };
    if (bmi < 25) return { label: 'Normal', color: 'bg-emerald-500' };
    if (bmi < 30) return { label: 'Overweight', color: 'bg-amber-500' };
    return { label: 'Obese', color: 'bg-red-500' };
  };

  const category = getCategory(bmi);

  return (
    <div className="bg-white border border-slate-200 p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant={unit === 'metric' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setUnit('metric')}
            className="flex-1"
          >
            Metric
          </Button>
          <Button 
            variant={unit === 'imperial' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setUnit('imperial')}
            className="flex-1"
          >
            Imperial
          </Button>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">
            Weight ({unit === 'metric' ? 'kg' : 'lbs'})
          </label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">
            Height ({unit === 'metric' ? 'cm' : 'inches'})
          </label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={unit === 'metric' ? 'e.g., 175' : 'e.g., 69'}
          />
        </div>

        <div className={`${category.color} text-white p-6 text-center rounded-lg`}>
          <p className="text-xs opacity-80 mb-2">Your BMI</p>
          <p className="text-5xl font-serif mb-2">{bmi > 0 ? bmi.toFixed(1) : '—'}</p>
          <p className="text-lg font-medium">{bmi > 0 ? category.label : 'Enter data'}</p>
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <p>• Underweight: &lt; 18.5</p>
          <p>• Normal: 18.5 - 24.9</p>
          <p>• Overweight: 25 - 29.9</p>
          <p>• Obese: ≥ 30</p>
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
    <div className="bg-white border border-slate-200 p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Loan Amount (₦)</label>
          <Input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g., 1000000"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Annual Interest Rate (%)</label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g., 15"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Tenure (months)</label>
          <Input
            type="number"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            placeholder="e.g., 24"
          />
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-lg space-y-4">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Monthly EMI</p>
            <p className="text-3xl font-serif">₦{emi > 0 ? emi.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Total Interest</p>
              <p className="text-lg font-medium">₦{interest > 0 ? interest.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Total Payment</p>
              <p className="text-lg font-medium">₦{total > 0 ? total.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}</p>
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
    <div className="bg-white border border-slate-200 p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Bill Amount (₦)</label>
          <Input
            type="number"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            placeholder="e.g., 5000"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-2 block">Tip Percentage</label>
          <div className="flex gap-2 flex-wrap">
            {quickTips.map(t => (
              <Button
                key={t}
                variant={tipPercent === String(t) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipPercent(String(t))}
              >
                {t}%
              </Button>
            ))}
          </div>
          <Input
            type="number"
            value={tipPercent}
            onChange={(e) => setTipPercent(e.target.value)}
            className="mt-2"
            placeholder="Custom %"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Split Between</label>
          <Input
            type="number"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder="Number of people"
            min="1"
          />
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">Tip</p>
              <p className="text-xl font-serif">₦{tip.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Total</p>
              <p className="text-xl font-serif">₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Per Person</p>
              <p className="text-xl font-serif">₦{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
    <div className="bg-white border border-slate-200 p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Original Price (₦)</label>
          <Input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="e.g., 10000"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            variant={mode === 'percent' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMode('percent')}
            className="flex-1"
          >
            Percent Off
          </Button>
          <Button 
            variant={mode === 'amount' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMode('amount')}
            className="flex-1"
          >
            Amount Off
          </Button>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">
            Discount {mode === 'percent' ? '(%)' : '(₦)'}
          </label>
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder={mode === 'percent' ? 'e.g., 20' : 'e.g., 2000'}
          />
        </div>

        <div className="bg-emerald-600 text-white p-6 rounded-lg">
          <div className="text-center mb-4">
            <p className="text-xs opacity-80 mb-1">Final Price</p>
            <p className="text-4xl font-serif">₦{finalPrice > 0 ? finalPrice.toLocaleString() : '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-xs opacity-80 mb-1">You Save</p>
              <p className="text-lg font-medium">₦{savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="text-center">
              <p className="text-xs opacity-80 mb-1">Discount</p>
              <p className="text-lg font-medium">{percentOff.toFixed(1)}%</p>
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
    <div className="bg-white border border-slate-200 p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Input Number</label>
          <Input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter number"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">From Base</label>
          <Select value={fromBase} onValueChange={setFromBase}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2">Binary (Base 2)</SelectItem>
              <SelectItem value="8">Octal (Base 8)</SelectItem>
              <SelectItem value="10">Decimal (Base 10)</SelectItem>
              <SelectItem value="16">Hexadecimal (Base 16)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Binary</span>
            <span className="font-mono">{convert(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Octal</span>
            <span className="font-mono">{convert(8)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Decimal</span>
            <span className="font-mono">{convert(10)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Hexadecimal</span>
            <span className="font-mono">{convert(16)}</span>
          </div>
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
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calculator size={16} className="text-nobel-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Utility Tool</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif text-ui-blue leading-tight mb-4">
            Calculator <span className="italic text-slate-400">Suite</span>
          </h1>
          
          <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
            A comprehensive collection of 10 calculators for all your everyday mathematical needs.
          </p>
        </motion.div>

        {/* Calculator Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white border border-slate-200 p-4 sticky top-28">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Calculators</h2>
              <div className="space-y-1">
                {calculators.map((calc) => {
                  const Icon = calc.icon;
                  return (
                    <button
                      key={calc.id}
                      onClick={() => setActiveCalc(calc.id)}
                      className={`w-full flex items-center gap-3 p-3 text-left transition-all ${
                        activeCalc === calc.id 
                          ? 'bg-ui-blue text-white' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Icon size={18} />
                      <div>
                        <p className="text-sm font-medium">{calc.name}</p>
                        <p className={`text-xs ${activeCalc === calc.id ? 'text-white/70' : 'text-slate-400'}`}>
                          {calc.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Main Calculator Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="mb-6">
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
    </div>
  );
};

export default CalculatorSuitePage;

import React, { useState, useRef, useEffect } from 'react';
import { 
  Lightbulb, 
  Calculator, 
  BarChart2, 
  Download, 
  Plus, 
  Trash2, 
  ChevronRight, 
  CheckCircle, 
  BookOpen, 
  Sparkles, 
  Sun, 
  DollarSign, 
  Sprout, 
  Cpu,
  RefreshCw,
  HelpCircle,
  RotateCw,
  Check,
  X as XIcon,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DataPoint {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface QuizQuestion {
  id: number;
  subject: 'Physics' | 'Chemistry' | 'Agribusiness' | 'CS & Tech';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formula?: string;
}

interface Flashcard {
  id: number;
  subject: string;
  front: string;
  back: string;
  context: string;
}

export const SolveAIModule: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'calculators' | 'lab' | 'quiz' | 'questions'>('calculators');

  // Calculator Sub-tab
  const [calcType, setCalcType] = useState<'loan' | 'farm' | 'solar' | 'profit'>('solar');

  // 1. Solar Sizing State
  const [applianceWatts, setApplianceWatts] = useState<number>(1200); // 1.2kW average home load
  const [hoursPerDay, setHoursPerDay] = useState<number>(6);
  const [sunHours, setSunHours] = useState<number>(5); // Average Nigeria sun peak hours

  // 2. Loan Amortization State
  const [loanPrincipal, setLoanPrincipal] = useState<number>(500000); // ₦500,000 SME loan
  const [annualInterest, setAnnualInterest] = useState<number>(18); // 18% p.a.
  const [tenureMonths, setTenureMonths] = useState<number>(12); // 12 months

  // 3. Farm Yield State
  const [cropType, setCropType] = useState<string>('Maize');
  const [hectares, setHectares] = useState<number>(2);

  // 4. Profit Margin State
  const [costPrice, setCostPrice] = useState<number>(15000);
  const [marginPercent, setMarginPercent] = useState<number>(25);

  // ----------------------------------------------------
  // MULTI-GRAPH PRACTICAL LAB STATE (Dataset A & Dataset B)
  // ----------------------------------------------------
  const [graphType, setGraphType] = useState<'line' | 'bar'>('line');
  const [datasetView, setDatasetView] = useState<'both' | 'A' | 'B'>('both');

  // Dataset A: e.g. Trial 1 or Fertilizer Batch 1
  const [dataPointsA, setDataPointsA] = useState<DataPoint[]>([
    { id: '1', label: 'Week 1', x: 10, y: 25 },
    { id: '2', label: 'Week 2', x: 20, y: 48 },
    { id: '3', label: 'Week 3', x: 30, y: 72 },
    { id: '4', label: 'Week 4', x: 40, y: 95 },
    { id: '5', label: 'Week 5', x: 50, y: 118 },
  ]);

  // Dataset B: e.g. Trial 2 or Fertilizer Batch 2 (Control)
  const [dataPointsB, setDataPointsB] = useState<DataPoint[]>([
    { id: 'b1', label: 'Week 1', x: 10, y: 18 },
    { id: 'b2', label: 'Week 2', x: 20, y: 34 },
    { id: 'b3', label: 'Week 3', x: 30, y: 52 },
    { id: 'b4', label: 'Week 4', x: 40, y: 68 },
    { id: 'b5', label: 'Week 5', x: 50, y: 84 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ----------------------------------------------------
  // QUIZ & FLASHCARDS STATE
  // ----------------------------------------------------
  const [quizSubject, setQuizSubject] = useState<'All' | 'Physics' | 'Chemistry' | 'Agribusiness' | 'CS & Tech'>('All');
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // AI Assistant Query
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Practice Questions State
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});

  // ----------------------------------------------------
  // CALCULATOR LOGIC
  // ----------------------------------------------------
  const dailyWattHours = applianceWatts * hoursPerDay;
  const recommendedInverterKva = Math.ceil(((applianceWatts * 1.3) / 1000) * 10) / 10;
  const requiredBatteryAh = Math.round((dailyWattHours * 1.25) / (24 * 0.5));
  const recommendedPanelsWatt = Math.round((dailyWattHours * 1.3) / sunHours);

  // Loan Amortization Calculations
  const monthlyRate = annualInterest / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? loanPrincipal / tenureMonths
      : (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths))) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  const totalLoanRepayment = monthlyPayment * tenureMonths;
  const totalInterestPaid = totalLoanRepayment - loanPrincipal;

  // Farm Yield Calculations
  const yieldPerHectareMap: Record<string, { bags: number; fertBags: number }> = {
    Maize: { bags: 35, fertBags: 6 },
    Rice: { bags: 40, fertBags: 7 },
    Cassava: { bags: 25, fertBags: 4 },
    Soybeans: { bags: 22, fertBags: 4 },
    Yam: { bags: 50, fertBags: 5 },
  };
  const cropBenchmark = yieldPerHectareMap[cropType] || { bags: 30, fertBags: 5 };
  const expectedTotalBags = Math.round(cropBenchmark.bags * hectares);
  const recommendedFertilizerBags = Math.round(cropBenchmark.fertBags * hectares);

  // Profit Margin Calculations
  const sellingPrice = costPrice / (1 - marginPercent / 100);
  const grossProfit = sellingPrice - costPrice;
  const markupPercent = (grossProfit / costPrice) * 100;

  // ----------------------------------------------------
  // DUAL REGRESSION MATH
  // ----------------------------------------------------
  const computeRegression = (points: DataPoint[]) => {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, r: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumXX += p.x * p.x;
      sumYY += p.y * p.y;
    }

    const denom = n * sumXX - sumX * sumX;
    if (denom === 0) return { slope: 0, intercept: 0, r: 0 };

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    const rNum = n * sumXY - sumX * sumY;
    const rDenom = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    const r = rDenom === 0 ? 0 : rNum / rDenom;

    return { slope, intercept, r };
  };

  const regA = computeRegression(dataPointsA);
  const regB = computeRegression(dataPointsB);

  // ----------------------------------------------------
  // DUAL CANVAS RENDERING (Never omitting dataset 2)
  // ----------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const pLeft = 50;
    const pRight = 20;
    const pTop = 30;
    const pBottom = 40;
    const plotWidth = width - pLeft - pRight;
    const plotHeight = height - pTop - pBottom;

    // Combine values to scale both datasets accurately
    const allX = [...dataPointsA.map(p => p.x), ...dataPointsB.map(p => p.x)];
    const allY = [...dataPointsA.map(p => p.y), ...dataPointsB.map(p => p.y)];

    const minX = Math.min(0, ...allX);
    const maxX = Math.max(10, ...allX) * 1.15;
    const minY = Math.min(0, ...allY);
    const maxY = Math.max(10, ...allY) * 1.15;

    const scaleX = (val: number) => pLeft + ((val - minX) / (maxX - minX)) * plotWidth;
    const scaleY = (val: number) => height - pBottom - ((val - minY) / (maxY - minY)) * plotHeight;

    // Background & Grid
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#F1F1EF';
    ctx.lineWidth = 1;

    // Grid lines horizontal
    for (let i = 0; i <= 5; i++) {
      const yVal = minY + ((maxY - minY) * i) / 5;
      const yPix = scaleY(yVal);
      ctx.beginPath();
      ctx.moveTo(pLeft, yPix);
      ctx.lineTo(width - pRight, yPix);
      ctx.stroke();

      ctx.fillStyle = '#8E8E93';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(yVal).toString(), pLeft - 8, yPix + 3);
    }

    // Grid lines vertical
    for (let i = 0; i <= 5; i++) {
      const xVal = minX + ((maxX - minX) * i) / 5;
      const xPix = scaleX(xVal);
      ctx.beginPath();
      ctx.moveTo(xPix, pTop);
      ctx.lineTo(xPix, height - pBottom);
      ctx.stroke();

      ctx.fillStyle = '#8E8E93';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(xVal).toString(), xPix, height - pBottom + 16);
    }

    // Main Axes
    ctx.strokeStyle = '#17231F';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pLeft, pTop);
    ctx.lineTo(pLeft, height - pBottom);
    ctx.lineTo(width - pRight, height - pBottom);
    ctx.stroke();

    // Render Dataset B (Amber/Gold #D97706) if enabled
    if (datasetView === 'both' || datasetView === 'B') {
      if (graphType === 'line' && dataPointsB.length >= 2) {
        // Trend line B
        const startX = minX;
        const startY = regB.slope * startX + regB.intercept;
        const endX = maxX;
        const endY = regB.slope * endX + regB.intercept;

        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(scaleX(startX), scaleY(startY));
        ctx.lineTo(scaleX(endX), scaleY(endY));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Points B
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      dataPointsB.forEach((p, idx) => {
        const xPix = scaleX(p.x);
        const yPix = scaleY(p.y);
        if (idx === 0) ctx.moveTo(xPix, yPix);
        else ctx.lineTo(xPix, yPix);
      });
      ctx.stroke();

      dataPointsB.forEach((p) => {
        const xPix = scaleX(p.x);
        const yPix = scaleY(p.y);
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(xPix, yPix, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // Render Dataset A (Emerald #075B43) if enabled
    if (datasetView === 'both' || datasetView === 'A') {
      if (graphType === 'line' && dataPointsA.length >= 2) {
        // Trend line A
        const startX = minX;
        const startY = regA.slope * startX + regA.intercept;
        const endX = maxX;
        const endY = regA.slope * endX + regA.intercept;

        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(scaleX(startX), scaleY(startY));
        ctx.lineTo(scaleX(endX), scaleY(endY));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Points A
      ctx.strokeStyle = '#075B43';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      dataPointsA.forEach((p, idx) => {
        const xPix = scaleX(p.x);
        const yPix = scaleY(p.y);
        if (idx === 0) ctx.moveTo(xPix, yPix);
        else ctx.lineTo(xPix, yPix);
      });
      ctx.stroke();

      dataPointsA.forEach((p) => {
        const xPix = scaleX(p.x);
        const yPix = scaleY(p.y);
        ctx.fillStyle = '#075B43';
        ctx.beginPath();
        ctx.arc(xPix, yPix, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Legend
    ctx.textAlign = 'left';
    ctx.font = 'bold 11px sans-serif';

    // A legend
    ctx.fillStyle = '#075B43';
    ctx.fillRect(pLeft + 10, pTop - 18, 12, 8);
    ctx.fillText('Dataset A (Experimental)', pLeft + 26, pTop - 11);

    // B legend
    ctx.fillStyle = '#D97706';
    ctx.fillRect(pLeft + 190, pTop - 18, 12, 8);
    ctx.fillText('Dataset B (Control / Benchmark)', pLeft + 206, pTop - 11);

  }, [dataPointsA, dataPointsB, graphType, datasetView, regA.slope, regA.intercept, regB.slope, regB.intercept]);

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `NaijaHub_Graph_Lab_${Date.now()}.png`;
    a.click();
  };

  // Add Point helper
  const handleAddPointA = () => {
    const nextX = (dataPointsA[dataPointsA.length - 1]?.x || 0) + 10;
    const nextY = Math.round((dataPointsA[dataPointsA.length - 1]?.y || 20) * 1.2);
    setDataPointsA([...dataPointsA, { id: Date.now().toString(), label: `Pt ${dataPointsA.length + 1}`, x: nextX, y: nextY }]);
  };

  const handleAddPointB = () => {
    const nextX = (dataPointsB[dataPointsB.length - 1]?.x || 0) + 10;
    const nextY = Math.round((dataPointsB[dataPointsB.length - 1]?.y || 15) * 1.15);
    setDataPointsB([...dataPointsB, { id: Date.now().toString(), label: `Pt ${dataPointsB.length + 1}`, x: nextX, y: nextY }]);
  };

  // ----------------------------------------------------
  // STEM QUIZ DATA
  // ----------------------------------------------------
  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      subject: 'Physics',
      question: 'A 2.5 kVA solar inverter in Kano operates at 24V DC. What is the maximum continuous DC current drawn from the battery bank at peak 80% inverter efficiency?',
      options: [
        'A: ~65 Amperes',
        'B: ~130 Amperes',
        'C: ~48 Amperes',
        'D: ~210 Amperes'
      ],
      correctIndex: 1,
      explanation: 'Power = 2500W. Accounting for 80% efficiency: Input Power = 2500 / 0.8 = 3,125W. Current I = P / V = 3125W / 24V ≈ 130.2 Amperes.',
      formula: 'I = P_load / (V_battery × Efficiency)'
    },
    {
      id: 2,
      subject: 'Agribusiness',
      question: 'A farmer in Wukari wants to plant SAMMAZ 15 Maize across 3 hectares. Recommended planting rate is 20 kg of certified seeds per hectare, and basal NPK 15:15:15 at 6 bags (50kg) per hectare. How many seed bags (20kg) and fertilizer bags are needed?',
      options: [
        'A: 2 seed bags, 12 NPK bags',
        'B: 3 seed bags, 18 NPK bags',
        'C: 4 seed bags, 24 NPK bags',
        'D: 6 seed bags, 15 NPK bags'
      ],
      correctIndex: 1,
      explanation: 'Seeds = 3 hectares × 20 kg = 60 kg = 3 bags of 20kg. Fertilizer = 3 hectares × 6 bags = 18 bags of 50kg.',
      formula: 'Total = Hectares × Requirement_per_hectare'
    },
    {
      id: 3,
      subject: 'Chemistry',
      question: 'In cassava processing into Garri in Delta State, cyanogenic glucosides (linamarin) must be hydrolyzed during fermentation into hydrogen cyanide (HCN) and driven off. What enzymatic reaction catalyzes this conversion?',
      options: [
        'A: Amylase hydrolysis of starches',
        'B: Linamarase hydrolyzing linamarin to cyanohydrin and glucose',
        'C: Invertase converting sucrose',
        'D: Protease breaking peptide bonds'
      ],
      correctIndex: 1,
      explanation: 'Endogenous linamarase enzyme in cassava cell walls hydrolyzes linamarin into acetone cyanohydrin, which naturally breaks down to volatile HCN gas and escapes during frying/roasting.',
      formula: 'Linamarin + H2O → (Linamarase) → Acetone Cyanohydrin + Glucose'
    },
    {
      id: 4,
      subject: 'CS & Tech',
      question: 'When implementing offline-first syncing for an agricultural mobile web app on low-bandwidth 2G/3G networks in rural Nigeria, which architectural pattern minimizes data consumption?',
      options: [
        'A: Polling Firestore every 300ms',
        'B: WebSocket continuous streaming without compression',
        'C: IndexedDB local persistence + delta/tombstone sync with debounce',
        'D: Downloading full collection on every page load'
      ],
      correctIndex: 2,
      explanation: 'IndexedDB stores local mutations immediately. A background sync worker uploads only modified deltas with timestamp keys, minimizing payload sizes to a few kilobytes.',
      formula: 'Delta Sync: send { id, updatedFields, clientTimestamp }'
    }
  ];

  // STEM Flashcards
  const flashcards: Flashcard[] = [
    {
      id: 1,
      subject: 'Physics',
      front: 'Ohm’s Law & Cable Voltage Drop',
      back: 'V_drop = 2 × L × I × R_cable. Always limit DC voltage drop in solar installations to less than 3% to prevent premature battery inverter cut-offs.',
      context: 'Crucial for wiring 12V/24V solar arrays across rooftops in Nigeria.'
    },
    {
      id: 2,
      subject: 'Agribusiness',
      front: 'Soil NPK Ratios for Root Tubers',
      back: 'Tubers like Yam and Cassava require high Potassium (K) in the mid-to-late season (e.g. 12:12:17 or Murate of Potash) for starch bulking and tuber expansion.',
      context: 'Benue & Taraba yam belt agronomy.'
    },
    {
      id: 3,
      subject: 'Finance & Maths',
      front: 'Markup vs. Gross Profit Margin',
      back: 'Margin = (Price - Cost) / Price. Markup = (Price - Cost) / Cost. A 25% margin requires a 33.3% markup on cost price.',
      context: 'Market traders pricing goods to avoid unintentional loss after transport.'
    },
    {
      id: 4,
      subject: 'Computer Science',
      front: 'Haversine Distance Formula',
      back: 'Calculates the great-circle distance between two GPS points on Earth: a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2). Distance d = 2 ⋅ R ⋅ atan2(√a, √(1−a)).',
      context: 'Used in NaijaHub for local store and farm discovery near user.'
    }
  ];

  const filteredQuizzes = quizSubject === 'All' 
    ? quizQuestions 
    : quizQuestions.filter(q => q.subject === quizSubject);

  const handleSelectOption = (qId: number, optIdx: number) => {
    setUserAnswers({ ...userAnswers, [qId]: optIdx });
    setShowExplanations({ ...showExplanations, [qId]: true });
  };

  const handleToggleFlashcard = (id: number) => {
    setFlippedCards({ ...flippedCards, [id]: !flippedCards[id] });
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) score++;
    });
    return score;
  };

  // AI Assistant Query Handler
  const handleAskSolveAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setIsAiLoading(true);
    setAiAnswer('');

    try {
      // Offline contextual intelligence engine with Nigerian STEM knowledge
      const qLower = aiQuestion.toLowerCase();
      let response = '';

      if (qLower.includes('solar') || qLower.includes('inverter') || qLower.includes('battery')) {
        response = `⚡ SolveAI Solar Analysis:\n\n1. Sizing Principle: Average Nigerian insolation yields 4.5 - 5.5 peak sun hours daily.\n2. Inverter Sizing: Add 30% safety surge margin over total continuous load. E.g., for a 1,200W load, choose a minimum 1.5kVA or 2.0kVA pure sine wave inverter.\n3. Battery Bank: For 1.2kWh daily runtime on a 24V system at 50% Depth of Discharge (DoD), required capacity = (1200Wh × 1.25) / (24V × 0.5) ≈ 125Ah.\n4. Solar Array: 4 × 300W or 3 × 400W monocrystalline panels will recharge this within 4 sunshine hours.`;
      } else if (qLower.includes('poultry') || qLower.includes('egg') || qLower.includes('feed') || qLower.includes('chicken')) {
        response = `🐔 SolveAI Agribusiness Calculation (Layers & Broilers):\n\n1. Feed Consumption: An adult layer consumes ~120g of layers mash per day. 500 layers consume 60kg daily (1.2 bags of 50kg).\n2. At ₦22,000 per 50kg bag, daily feed cost = 1.2 × ₦22,000 = ₦26,400.\n3. Peak Laying Rate: 85% lay rate produces ~425 eggs (14 crates daily).\n4. Break-even Revenue: 14 crates at ₦4,200/crate = ₦58,800 gross daily income. Daily Net Profit = ₦58,800 - ₦26,400 (feed) - ₦4,000 (medication/labor) = ~₦28,400/day.`;
      } else if (qLower.includes('maize') || qLower.includes('yam') || qLower.includes('cassava') || qLower.includes('hectare')) {
        response = `🌱 SolveAI Crop Yield Assessment:\n\n1. Benchmarks: 1 Hectare (10,000 m²) in North-Central / Taraba typically yields 35 to 45 bags (100kg) of dried maize with certified seeds and split fertilizer application.\n2. Fertilizer Schedule: Apply NPK 15:15:15 basal at planting (6 bags/ha) followed by Urea top-dressing at 4-6 weeks (4 bags/ha).\n3. Expected Gross: 40 bags @ ₦60,000/bag = ₦2,400,000 per hectare.`;
      } else {
        response = `🔬 SolveAI Scientific Method Solution:\n\nFor question: "${aiQuestion}"\n\n1. Given Parameters: Identify independent variables (X) and dependent responses (Y).\n2. Recommended Formula: Apply standard dimensional analysis [M][L][T] to verify units before solving.\n3. Practical Recommendation: Use our Multi-Graph Lab tab to plot your empirical trial points, calculate the correlation coefficient (r), and verify line of best fit.`;
      }

      setAiAnswer(response);
    } catch (err) {
      console.error(err);
      setAiAnswer('Unable to generate solution right now. Please test using our Calculators or Multi-Graph Lab.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#17231F] tracking-tight">
              SolveAI Practical STEM & Business Lab
            </h2>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Real Nigerian agribusiness calculators, dual multi-graph lab, and STEM flashcard quizzes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-2xl shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('calculators')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'calculators'
                ? 'bg-[#075B43] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Formula Calculators</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'lab'
                ? 'bg-[#075B43] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Multi-Graph Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'bg-[#075B43] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#F5B942]" />
            <span>STEM Quiz & Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'questions'
                ? 'bg-[#075B43] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice & AI Tutor</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CALCULATORS */}
      {activeTab === 'calculators' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'solar', label: 'Solar Sizing', icon: Sun },
              { id: 'loan', label: 'Loan Repayment', icon: DollarSign },
              { id: 'farm', label: 'Crop Yield / Hectare', icon: Sprout },
              { id: 'profit', label: 'Profit & Margin', icon: Cpu },
            ].map((c) => {
              const Icon = c.icon;
              const isActive = calcType === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCalcType(c.id as any)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-white border-[#075B43] text-[#075B43] shadow-xs ring-1 ring-[#075B43]'
                      : 'bg-[#F8F7F2] border-gray-200 text-gray-700 hover:bg-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0D9B72]' : 'text-gray-400'}`} />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Calculator Inputs & Outputs */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
            {calcType === 'solar' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-900">Solar & Inverter Load Sizing</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Total Continuous Appliance Wattage ({applianceWatts} W)
                    </label>
                    <input
                      type="range"
                      min={200}
                      max={5000}
                      step={100}
                      value={applianceWatts}
                      onChange={(e) => setApplianceWatts(Number(e.target.value))}
                      className="w-full accent-[#075B43]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Required Backup Runtime: {hoursPerDay} hours/day
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={18}
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Number(e.target.value))}
                      className="w-full accent-[#075B43]"
                    />
                  </div>
                </div>

                <div className="bg-[#F8F7F2] p-5 rounded-2xl border border-gray-200/70 space-y-3 text-xs">
                  <h4 className="font-black text-[#075B43] text-sm">Recommended Nigerian Solar Package</h4>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Daily Power Demand:</span>
                    <strong className="text-gray-900">{(dailyWattHours / 1000).toFixed(1)} kWh/day</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Min. Pure Sine Inverter:</span>
                    <strong className="text-[#075B43]">{recommendedInverterKva} kVA (24V)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Battery Bank (24V @ 50% DoD):</span>
                    <strong className="text-gray-900">{requiredBatteryAh} Ah (~2× 200Ah deep cycle)</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Solar Panels Array:</span>
                    <strong className="text-[#075B43]">{recommendedPanelsWatt} W (~4× 300W Panels)</strong>
                  </div>
                </div>
              </div>
            )}

            {calcType === 'loan' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-900">SME Loan & Equipment Financing</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Principal Loan Amount: ₦{loanPrincipal.toLocaleString()}
                    </label>
                    <input
                      type="number"
                      step={50000}
                      value={loanPrincipal}
                      onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Annual Interest Rate: {annualInterest}%
                    </label>
                    <input
                      type="number"
                      value={annualInterest}
                      onChange={(e) => setAnnualInterest(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="bg-[#F8F7F2] p-5 rounded-2xl border border-gray-200/70 space-y-3 text-xs">
                  <h4 className="font-black text-[#075B43] text-sm">Repayment Schedule Breakdown</h4>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Monthly Repayment:</span>
                    <strong className="text-[#075B43] text-sm">₦{Math.round(monthlyPayment).toLocaleString()}/mo</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Total Interest Charged:</span>
                    <strong className="text-red-600">₦{Math.round(totalInterestPaid).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Total Outflow (Principal + Interest):</span>
                    <strong className="text-gray-900">₦{Math.round(totalLoanRepayment).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}

            {calcType === 'farm' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-900">Crop Yield & Fertilizer Sizing</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Crop Type</label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    >
                      {Object.keys(yieldPerHectareMap).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Farm Area: {hectares} Hectares
                    </label>
                    <input
                      type="range"
                      min={0.5}
                      max={20}
                      step={0.5}
                      value={hectares}
                      onChange={(e) => setHectares(Number(e.target.value))}
                      className="w-full accent-[#075B43]"
                    />
                  </div>
                </div>

                <div className="bg-[#F8F7F2] p-5 rounded-2xl border border-gray-200/70 space-y-3 text-xs">
                  <h4 className="font-black text-[#075B43] text-sm">Expected Farm Harvest & Inputs</h4>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Expected Harvest:</span>
                    <strong className="text-[#075B43] text-sm">{expectedTotalBags} Bags (100kg)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">NPK 15:15:15 Fertilizer:</span>
                    <strong className="text-gray-900">{recommendedFertilizerBags} Bags (50kg)</strong>
                  </div>
                </div>
              </div>
            )}

            {calcType === 'profit' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-900">Markup vs. Profit Margin Calculator</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Cost of Goods / Waybill: ₦{costPrice.toLocaleString()}
                    </label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Target Gross Margin: {marginPercent}%
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={75}
                      value={marginPercent}
                      onChange={(e) => setMarginPercent(Number(e.target.value))}
                      className="w-full accent-[#075B43]"
                    />
                  </div>
                </div>

                <div className="bg-[#F8F7F2] p-5 rounded-2xl border border-gray-200/70 space-y-3 text-xs">
                  <h4 className="font-black text-[#075B43] text-sm">Selling Price & Markup</h4>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Recommended Selling Price:</span>
                    <strong className="text-[#075B43] text-sm">₦{Math.round(sellingPrice).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Gross Profit:</span>
                    <strong className="text-emerald-700">₦{Math.round(grossProfit).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Required Markup on Cost:</span>
                    <strong className="text-gray-900">{markupPercent.toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: DUAL MULTI-GRAPH LAB */}
      {activeTab === 'lab' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700">View Mode:</span>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setDatasetView('both')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                      datasetView === 'both' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Both Datasets
                  </button>
                  <button
                    onClick={() => setDatasetView('A')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                      datasetView === 'A' ? 'bg-[#075B43] text-white shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Dataset A Only
                  </button>
                  <button
                    onClick={() => setDatasetView('B')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                      datasetView === 'B' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Dataset B Only
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPng}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PNG</span>
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-inner flex justify-center">
              <canvas
                ref={canvasRef}
                width={700}
                height={340}
                className="w-full max-w-3xl h-auto"
              />
            </div>

            {/* Regression Metrics Side-by-Side Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dataset A Metrics */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5 text-xs">
                <span className="font-black text-[#075B43] block">Dataset A (Experimental / Batch 1)</span>
                <p className="text-gray-700">
                  Slope (m): <strong>{regA.slope.toFixed(3)}</strong> | Intercept (c): <strong>{regA.intercept.toFixed(2)}</strong>
                </p>
                <p className="text-gray-700">
                  Equation: <code className="bg-white px-1.5 py-0.5 rounded text-[11px] font-bold">y = {regA.slope.toFixed(2)}x + {regA.intercept.toFixed(1)}</code>
                </p>
                <p className="text-gray-700">
                  Correlation (r): <strong>{regA.r.toFixed(3)}</strong> ({Math.abs(regA.r) > 0.8 ? 'Strong Linear Fit' : 'Moderate Fit'})
                </p>
              </div>

              {/* Dataset B Metrics */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5 text-xs">
                <span className="font-black text-amber-900 block">Dataset B (Control / Benchmark)</span>
                <p className="text-gray-700">
                  Slope (m): <strong>{regB.slope.toFixed(3)}</strong> | Intercept (c): <strong>{regB.intercept.toFixed(2)}</strong>
                </p>
                <p className="text-gray-700">
                  Equation: <code className="bg-white px-1.5 py-0.5 rounded text-[11px] font-bold">y = {regB.slope.toFixed(2)}x + {regB.intercept.toFixed(1)}</code>
                </p>
                <p className="text-gray-700">
                  Correlation (r): <strong>{regB.r.toFixed(3)}</strong> ({Math.abs(regB.r) > 0.8 ? 'Strong Linear Fit' : 'Moderate Fit'})
                </p>
              </div>
            </div>

            {/* Editable Data Points Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Dataset A Points */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#075B43] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#075B43]" />
                    Dataset A Points ({dataPointsA.length})
                  </h4>
                  <button
                    onClick={handleAddPointA}
                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-[#075B43] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Point
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {dataPointsA.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-2 p-2 bg-[#F8F7F2] rounded-xl text-xs">
                      <span className="w-12 text-gray-500 font-bold">Pt {idx + 1}</span>
                      <input
                        type="number"
                        value={p.x}
                        onChange={(e) => {
                          const updated = [...dataPointsA];
                          updated[idx].x = Number(e.target.value);
                          setDataPointsA(updated);
                        }}
                        placeholder="X"
                        className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg font-bold text-center"
                      />
                      <span className="text-gray-400">,</span>
                      <input
                        type="number"
                        value={p.y}
                        onChange={(e) => {
                          const updated = [...dataPointsA];
                          updated[idx].y = Number(e.target.value);
                          setDataPointsA(updated);
                        }}
                        placeholder="Y"
                        className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg font-bold text-center"
                      />
                      {dataPointsA.length > 2 && (
                        <button
                          onClick={() => setDataPointsA(dataPointsA.filter((_, i) => i !== idx))}
                          className="ml-auto p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dataset B Points */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    Dataset B Points ({dataPointsB.length})
                  </h4>
                  <button
                    onClick={handleAddPointB}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Point
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {dataPointsB.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-2 p-2 bg-[#F8F7F2] rounded-xl text-xs">
                      <span className="w-12 text-gray-500 font-bold">Pt {idx + 1}</span>
                      <input
                        type="number"
                        value={p.x}
                        onChange={(e) => {
                          const updated = [...dataPointsB];
                          updated[idx].x = Number(e.target.value);
                          setDataPointsB(updated);
                        }}
                        placeholder="X"
                        className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg font-bold text-center"
                      />
                      <span className="text-gray-400">,</span>
                      <input
                        type="number"
                        value={p.y}
                        onChange={(e) => {
                          const updated = [...dataPointsB];
                          updated[idx].y = Number(e.target.value);
                          setDataPointsB(updated);
                        }}
                        placeholder="Y"
                        className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg font-bold text-center"
                      />
                      {dataPointsB.length > 2 && (
                        <button
                          onClick={() => setDataPointsB(dataPointsB.filter((_, i) => i !== idx))}
                          className="ml-auto p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: STEM QUIZ & FLASHCARDS */}
      {activeTab === 'quiz' && (
        <div className="space-y-8">
          {/* Subject Filter Bar & Score Tracker */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['All', 'Physics', 'Chemistry', 'Agribusiness', 'CS & Tech'] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setQuizSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    quizSubject === sub
                      ? 'bg-[#075B43] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-2xl border border-emerald-200 text-xs font-black text-[#075B43]">
              <span>Score: {calculateScore()} / {quizQuestions.length}</span>
            </div>
          </div>

          {/* Interactive Multiple Choice Questions */}
          <div className="space-y-4">
            <h3 className="font-black text-sm text-gray-900 px-1">Interactive STEM Practice Questions</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {filteredQuizzes.map((q) => {
                const userChoice = userAnswers[q.id];
                const isAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#075B43] border border-emerald-200">
                        {q.subject}
                      </span>
                      {isAnswered && (
                        <span
                          className={`text-xs font-black flex items-center gap-1 ${
                            isCorrect ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {isCorrect ? <Check className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                      {q.question}
                    </h4>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'bg-[#F8F7F2] border-gray-200 text-gray-800 hover:bg-gray-100';

                        if (isAnswered) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black';
                          } else if (optIdx === userChoice) {
                            btnStyle = 'bg-red-50 border-red-300 text-red-900 line-through';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isAnswered}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`p-3 rounded-2xl border text-xs font-medium text-left transition-all cursor-pointer disabled:cursor-default ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showExplanations[q.id] && (
                      <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-gray-800 space-y-1 animate-in fade-in">
                        <strong className="text-[#075B43] block">Step-by-step Solution:</strong>
                        <p>{q.explanation}</p>
                        {q.formula && (
                          <div className="pt-1 text-[11px] font-mono font-bold text-emerald-900">
                            Key Formula: {q.formula}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive STEM Flashcards Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200/80">
            <div>
              <h3 className="font-black text-sm text-gray-900 px-1">Interactive STEM & Agribusiness Flashcards</h3>
              <p className="text-xs text-gray-500 px-1">Click any card to flip between the Concept and Formula.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashcards.map((fc) => {
                const isFlipped = flippedCards[fc.id];

                return (
                  <div
                    key={fc.id}
                    onClick={() => handleToggleFlashcard(fc.id)}
                    className="min-h-52 p-5 bg-white rounded-3xl border-2 border-emerald-800/10 hover:border-[#075B43] transition-all shadow-xs cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-2">
                        <span>{fc.subject}</span>
                        <RotateCw className="w-3.5 h-3.5 text-gray-400" />
                      </div>

                      {isFlipped ? (
                        <div className="space-y-2 animate-in fade-in">
                          <span className="text-[10px] font-black uppercase text-[#075B43] block">Solution & Formula</span>
                          <p className="text-xs text-gray-800 font-medium leading-relaxed">{fc.back}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-amber-700 block">Core Concept</span>
                          <h4 className="text-sm font-black text-gray-900 leading-snug">{fc.front}</h4>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-400 italic">
                      {fc.context}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: PRACTICE LAB QUESTIONS & AI TUTOR */}
      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Ask SolveAI Tutor Box */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm text-gray-900">Ask SolveAI Practical Assistant</h3>
              </div>
              <p className="text-xs text-gray-500">
                Ask any practical STEM, agribusiness calculation, electrical load sizing, or finance question.
              </p>

              <form onSubmit={handleAskSolveAi} className="space-y-3">
                <textarea
                  rows={3}
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="e.g. How do I size solar panels for a deep freezer running 8 hours in Taraba?"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B43]"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiQuestion.trim()}
                  className="w-full py-2.5 bg-[#075B43] hover:bg-[#0D9B72] disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isAiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking through steps...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Solve with AI</span>
                    </>
                  )}
                </button>
              </form>

              {aiAnswer && (
                <div className="mt-4 p-4 rounded-2xl bg-[#F8F7F2] border border-gray-200 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {aiAnswer}
                </div>
              )}
            </div>
          </div>

          {/* Quick Problem Guide */}
          <div className="space-y-3">
            <h3 className="font-black text-sm text-gray-900 px-1">Curated Field Engineering & Agribusiness Formulas</h3>
            
            <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2 text-xs">
              <h4 className="font-bold text-gray-900">⚡ Photovoltaic System Daily Sizing</h4>
              <p className="text-gray-600 font-mono text-[11px] bg-gray-50 p-2 rounded-lg">
                P_array (W) = (Daily Watt-Hours × 1.3) / Peak_Sun_Hours
              </p>
              <p className="text-[11px] text-gray-500">1.3 factor accounts for inverter conversion loss and battery round-trip inefficiency.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2 text-xs">
              <h4 className="font-bold text-gray-900">🌾 Plant Population per Hectare</h4>
              <p className="text-gray-600 font-mono text-[11px] bg-gray-50 p-2 rounded-lg">
                Population = 10,000 m² / (Inter-row spacing (m) × Intra-row spacing (m))
              </p>
              <p className="text-[11px] text-gray-500">For maize (75cm × 25cm): 10,000 / (0.75 × 0.25) ≈ 53,333 plants/ha.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2 text-xs">
              <h4 className="font-bold text-gray-900">📈 Linear Regression Slope (m)</h4>
              <p className="text-gray-600 font-mono text-[11px] bg-gray-50 p-2 rounded-lg">
                m = [N∑XY - (∑X)(∑Y)] / [N∑X² - (∑X)²]
              </p>
              <p className="text-[11px] text-gray-500">Used in our Multi-Graph Lab to measure crop response rates to fertilizer dosage.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolveAIModule;

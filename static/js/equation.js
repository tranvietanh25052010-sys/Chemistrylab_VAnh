// ==========================================
// HÀM PARSE CÔNG THỨC & ĐIỆN TÍCH ION
// ==========================================
function parseFormulaWithCharge(formula) {
  let charge = 0;
  let cleanFormula = formula;

  // 1. Tách điện tích ở cuối công thức (VD: Fe^3+, SO4^2-, Fe3+, H+, e-)
  const chargeMatch = formula.match(/\^?([0-9]*)([\+\-])$/);
  if (chargeMatch) {
    const val = parseInt(chargeMatch[1]) || 1;
    const sign = chargeMatch[2] === '+' ? 1 : -1;
    charge = val * sign;
    cleanFormula = formula.replace(/\^?([0-9]*)([\+\-])$/, '');
  } else if (formula === 'e' || formula === 'e-') {
    return { elements: {}, charge: -1 };
  }function parseFormulaWithCharge(formula) {
  let charge = 0;
  let cleanFormula = formula.trim();

  // 1. Trường hợp electron
  if (cleanFormula === 'e' || cleanFormula === 'e-') {
    return { elements: {}, charge: -1 };
  }

  // 2. Tách điện tích dạng: ^3+, ^2-, ^+, ^-, 3+, 2-, +, -
  const chargeMatch = cleanFormula.match(/[\^]?(\d*)([\+\-])$/);
  if (chargeMatch) {
    const val = parseInt(chargeMatch[1]) || 1;
    const sign = chargeMatch[2] === '+' ? 1 : -1;
    charge = val * sign;
    // Bỏ phần điện tích khỏi công thức nguyên tử
    cleanFormula = cleanFormula.replace(/[\^]?(\d*)([\+\-])$/, '');
  }

  // 3. Parse số nguyên tử bằng Stack
  const elements = {};
  const regex = /([A-Z][a-z]?)(\d*)|(\()|(\))(\d*)/g;
  let stack = [{}];
  let match;

  while ((match = regex.exec(cleanFormula)) !== null) {
    if (match[1]) {
      const elem = match[1];
      const count = parseInt(match[2]) || 1;
      const top = stack[stack.length - 1];
      top[elem] = (top[elem] || 0) + count;
    } else if (match[3]) {
      stack.push({});
    } else if (match[4]) {
      const group = stack.pop();
      const mult = parseInt(match[5]) || 1;
      const top = stack[stack.length - 1];
      for (let e in group) {
        top[e] = (top[e] || 0) + group[e] * mult;
      }
    }
  }

  return { elements: stack[0], charge };
}

  // 2. Parse các nguyên tử bằng Stack
  const elements = {};
  const regex = /([A-Z][a-z]?)(\d*)|(\()|(\))(\d*)/g;
  let stack = [{}];
  let match;

  while ((match = regex.exec(cleanFormula)) !== null) {
    if (match[1]) {
      const elem = match[1];
      const count = parseInt(match[2]) || 1;
      const top = stack[stack.length - 1];
      top[elem] = (top[elem] || 0) + count;
    } else if (match[3]) {
      stack.push({});
    } else if (match[4]) {
      const group = stack.pop();
      const mult = parseInt(match[5]) || 1;
      const top = stack[stack.length - 1];
      for (let e in group) {
        top[e] = (top[e] || 0) + group[e] * mult;
      }
    }
  }

  return { elements: stack[0], charge };
}

// ==========================================
// HÀM TIỀN XỬ LÝ (MUỐI NGẬM NƯỚC & HỆ SỐ ĐẦU)
// ==========================================
function preprocessFormula(formula) {
  let cleaned = formula.replace(/\s+/g, '');

  let multiplier = '1';
  const leadingMatch = cleaned.match(/^(\d+)(.+)$/);
  if (leadingMatch) {
    multiplier = leadingMatch[1];
    cleaned = leadingMatch[2];
  }

  const parts = cleaned.split(/[\.\*]/);
  let mainPart = parts[0];
  let hydratePart = '';

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const match = part.match(/^(\d*)(.*)$/);
    if (match) {
      const coeff = match[1] || '1';
      const compound = match[2];
      hydratePart += `(${compound})${coeff}`;
    }
  }

  const combined = mainPart + hydratePart;
  return multiplier !== '1' ? `(${combined})${multiplier}` : combined;
}

// ==========================================
// LỚP PHÂN SỐ (FRACTION) TÍNH TOÁN CHÍNH XÁC
// ==========================================
class Fraction {
  constructor(num, den = 1) {
    if (den === 0) throw new Error("Division by zero");
    if (den < 0) { num = -num; den = -den; }
    const g = Fraction.gcd(Math.abs(num), Math.abs(den));
    this.num = num / g;
    this.den = den / g;
  }

  static gcd(a, b) {
    return b === 0 ? a : Fraction.gcd(b, a % b);
  }

  add(other) {
    return new Fraction(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other) {
    return new Fraction(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  mul(other) {
    return new Fraction(this.num * other.num, this.den * other.den);
  }

  div(other) {
    return new Fraction(this.num * other.den, this.den * other.num);
  }
}

// ==========================================
// HÀM CÂN BẰNG CHÍNH (HỖ TRỢ ION & MA TRẬN GAUSS)
// ==========================================
function balanceEquation() {
  const eq = document.getElementById('equation').value.trim();
  const status = document.getElementById('status');
  const resultBox = document.getElementById('result-box');
  const balancedResult = document.getElementById('balanced-result');

  resultBox.style.display = 'none';
  status.textContent = '';

  if (!eq.includes('=') && !eq.includes('→')) {
    status.textContent = '⚠️ Please separate sides with "=" or "→"';
    status.style.color = '#ef4444';
    return;
  }

  const sides = eq.split(/=|→/).map(s => s.trim());

  if (sides.length !== 2) {
    status.textContent = '⚠️ Invalid equation format';
    status.style.color = '#ef4444';
    return;
  }

  const left = sides[0].split('+').map(s => s.trim()).filter(Boolean);
  const right = sides[1].split('+').map(s => s.trim()).filter(Boolean);
  const all = [...left, ...right];
  const n = all.length;

  if (n < 2) {
    status.textContent = '⚠️ Need at least two substances';
    status.style.color = '#ef4444';
    return;
  }

  // Parse chất + điện tích
  const elements = new Set();
  const parsedList = all.map(formula => {
    const processed = preprocessFormula(formula);
    const parsed = parseFormulaWithCharge(processed);
    Object.keys(parsed.elements).forEach(e => elements.add(e));
    return parsed;
  });

  const elemList = [...elements];
  const m = elemList.length;

  // Lập ma trận Gauss (Các hàng nguyên tố + 1 HÀNG BẢO TOÀN ĐIỆN TÍCH)
  const matrix = Array.from({ length: m + 1 }, () => Array(n).fill(new Fraction(0)));

  for (let r = 0; r < m; r++) {
    const e = elemList[r];
    for (let c = 0; c < n; c++) {
      const amount = parsedList[c].elements[e] || 0;
      matrix[r][c] = new Fraction(c < left.length ? amount : -amount);
    }
  }

  // Hàng cuối cùng: Hàng Bảo toàn điện tích
  for (let c = 0; c < n; c++) {
    const charge = parsedList[c].charge;
    matrix[m][c] = new Fraction(c < left.length ? charge : -charge);
  }

  // TỔNG SỐ HÀNG MA TRẬN = Nguyên tố + Hàng Điện tích
  const totalRows = m + 1;

  // KHỬ GAUSS (GAUSSIAN ELIMINATION)
  const A = matrix;
  let pivotRow = 0;
  const pivotCols = [];

  for (let col = 0; col < n && pivotRow < totalRows; col++) {
    let pivot = pivotRow;
    for (let r = pivotRow + 1; r < totalRows; r++) {
      if (Math.abs(A[r][col].num) > Math.abs(A[pivot][col].num)) {
        pivot = r;
      }
    }

    if (A[pivot][col].num === 0) continue;

    [A[pivotRow], A[pivot]] = [A[pivot], A[pivotRow]];

    const pivotValue = A[pivotRow][col];
    for (let c = 0; c < n; c++) {
      A[pivotRow][c] = A[pivotRow][c].div(pivotValue);
    }

    for (let r = 0; r < totalRows; r++) {
      if (r === pivotRow) continue;
      const factor = A[r][col];
      if (factor.num === 0) continue;

      for (let c = 0; c < n; c++) {
        A[r][c] = A[r][c].sub(factor.mul(A[pivotRow][c]));
      }
    }

    pivotCols.push(col);
    pivotRow++;
  }

  // TÌM FREE VARIABLE
  const pivotSet = new Set(pivotCols);
  const freeCols = [];
  for (let c = 0; c < n; c++) {
    if (!pivotSet.has(c)) freeCols.push(c);
  }

  if (freeCols.length === 0) {
    status.textContent = '❌ No valid balancing solution';
    status.style.color = '#ef4444';
    return;
  }

  // Gán free variable = 1
  const solution = Array(n).fill(new Fraction(0));
  solution[freeCols[0]] = new Fraction(1);

  for (let i = pivotCols.length - 1; i >= 0; i--) {
    const row = i;
    const col = pivotCols[i];
    let value = new Fraction(0);

    for (let c = 0; c < n; c++) {
      if (c === col) continue;
      value = value.add(A[row][c].mul(solution[c]));
    }

    solution[col] = new Fraction(0).sub(value);
  }

  // QUI ĐỒNG MẪU SỐ
  const lcm = (a, b) => (a * b) / Fraction.gcd(a, b);
  let commonDenom = 1;
  solution.forEach(frac => {
    commonDenom = lcm(commonDenom, frac.den);
  });

  let coeffs = solution.map(frac => frac.num * (commonDenom / frac.den));

  if (coeffs.some(x => x <= 0)) {
    status.textContent = '❌ Cannot find positive coefficients';
    status.style.color = '#ef4444';
    return;
  }

  let g = Math.abs(coeffs[0]);
  for (let i = 1; i < coeffs.length; i++) {
    g = Fraction.gcd(g, Math.abs(coeffs[i]));
  }
  coeffs = coeffs.map(x => x / g);

  // Format hiển thị
  const fmt = (arr, off) => {
    return arr.map((formula, i) => {
      const v = coeffs[off + i];
      return v === 1 ? formula : `${v}${formula}`;
    }).join(' + ');
  };

  balancedResult.textContent = `${fmt(left, 0)} = ${fmt(right, left.length)}`;
  resultBox.style.display = 'block';
  status.textContent = '✅ Balanced successfully!';
  status.style.color = '#16a34a';
}

function resetAll() {
  document.getElementById('equation').value = '';
  document.getElementById('status').textContent = '';
  document.getElementById('result-box').style.display = 'none';
}

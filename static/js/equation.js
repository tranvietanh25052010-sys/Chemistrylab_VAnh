function parseFormula(formula) {
  const elements = {};
  const regex = /([A-Z][a-z]?)(\d*)|(\()|(\))(\d*)/g;
  let stack = [{}];
  let match;

  while ((match = regex.exec(formula)) !== null) {
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
  return stack[0];
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

// ==========================================
// HÀM BỔ TRỢ: XỬ LÝ PHÂN SỐ ĐỂ TRÁNH SAI SỐ
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
// HÀM CÂN BẰNG PHƯƠNG TRÌNH CHÍNH (ĐÃ SỬA)
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

  // Lấy danh sách nguyên tố
  const elements = new Set();
  const counts = all.map(formula => {
    const c = parseFormula(formula);
    Object.keys(c).forEach(e => elements.add(e));
    return c;
  });

  // Kiểm tra nguyên tố xuất hiện 1 vế
  for (const e of elements) {
    let leftCount = 0;
    let rightCount = 0;
    for (let i = 0; i < left.length; i++) leftCount += counts[i][e] || 0;
    for (let i = 0; i < right.length; i++) rightCount += counts[left.length + i][e] || 0;

    if (leftCount === 0 || rightCount === 0) {
      status.textContent = `⚠️ Element ${e} only on one side`;
      status.style.color = '#ef4444';
      return;
    }
  }

  // Tạo ma trận
  const elemList = [...elements];
  const m = elemList.length;

  // CHUYỂN DỮ LIỆU SANG DẠNG PHÂN SỐ (FRACTION)
  const matrix = Array.from({ length: m }, () => Array(n).fill(new Fraction(0)));

  for (let r = 0; r < m; r++) {
    const e = elemList[r];
    for (let c = 0; c < n; c++) {
      const amount = counts[c][e] || 0;
      matrix[r][c] = new Fraction(c < left.length ? amount : -amount);
    }
  }

  // GAUSSIAN ELIMINATION BẰNG PHÂN SỐ
  const A = matrix;
  let pivotRow = 0;
  const pivotCols = [];

  for (let col = 0; col < n && pivotRow < m; col++) {
    let pivot = pivotRow;
    for (let r = pivotRow + 1; r < m; r++) {
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

    for (let r = 0; r < m; r++) {
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

  // Tính các hệ số pivot
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

  // QUI ĐỒNG MẪU SỐ VỀ SỐ NGUYÊN NGUYÊN BẢN (KHÔNG LÀM TRÒN SAI SỐ)
  const lcm = (a, b) => (a * b) / Fraction.gcd(a, b);
  let commonDenom = 1;
  solution.forEach(frac => {
    commonDenom = lcm(commonDenom, frac.den);
  });

  let coeffs = solution.map(frac => frac.num * (commonDenom / frac.den));

  // Kiểm tra hệ số âm
  if (coeffs.some(x => x <= 0)) {
    status.textContent = '❌ Cannot find positive coefficients';
    status.style.color = '#ef4444';
    return;
  }

  // Rút gọn hệ số bằng BCNN
  let g = Math.abs(coeffs[0]);
  for (let i = 1; i < coeffs.length; i++) {
    g = Fraction.gcd(g, Math.abs(coeffs[i]));
  }
  coeffs = coeffs.map(x => x / g);

  // Format kết quả
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

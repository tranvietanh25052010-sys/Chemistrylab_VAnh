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
  const counts = all.map(f => {
    const c = parseFormula(f);
    Object.keys(c).forEach(e => elements.add(e));
    return c;
  });

  // Kiểm tra nguyên tố chỉ xuất hiện một vế
  for (const e of elements) {
    let l = 0, r = 0;
    left.forEach((_, i) => l += counts[i][e] || 0);
    right.forEach((_, i) => r += counts[left.length + i][e] || 0);
    if (l === 0 || r === 0) {
      status.textContent = `⚠️ Element ${e} only on one side`;
      status.style.color = '#ef4444';
      return;
    }
  }

  // Xây hệ phương trình: Σ(coeff[i] * count[i][elem]) = 0
  const elemList = [...elements];
  const m = elemList.length;
  const matrix = Array.from({length: m}, () => Array(n).fill(0));

  for (let r = 0; r < m; r++) {
    const e = elemList[r];
    for (let c = 0; c < n; c++) {
      matrix[r][c] = (counts[c][e] || 0) * (c < left.length ? 1 : -1);
    }
  }

  // Thử hệ số từ nhỏ nhất (phương pháp thử chuẩn)
  let coeffs = null;
  let found = false;

  for (let last = 1; last <= 200 && !found; last++) {
    const sol = Array(n - 1).fill(0);
    const max = Math.pow(last + 1, n - 1);

    for (let mask = 0; mask < max && !found; mask++) {
      // Chuyển mask thành hệ số nguyên dương
      let num = mask;
      for (let i = n - 2; i >= 0; i--) {
        sol[i] = (num % (last + 1)) + 1;
        num = Math.floor(num / (last + 1));
      }
      sol.push(last); // Hệ số cuối cố định = last

      // Kiểm tra thỏa mãn tất cả phương trình
      let ok = true;
      for (let r = 0; r < m && ok; r++) {
        let sum = 0;
        for (let c = 0; c < n; c++) sum += matrix[r][c] * sol[c];
        if (sum !== 0) ok = false;
      }

      if (ok) {
        // Rút gọn về ước số chung lớn nhất
        const g = sol.reduce((a, b) => gcd(a, b));
        coeffs = sol.map(x => x / g);
        found = true;
      }
    }
  }

  if (!coeffs) {
    status.textContent = '❌ Cannot balance this equation';
    status.style.color = '#ef4444';
    return;
  }

  // Định dạng kết quả
  const fmt = (arr, off) => arr.map((_, i) => {
    const v = coeffs[off + i];
    return v === 1 ? all[off + i] : `${v}${all[off + i]}`;
  }).join(' + ');

  balancedResult.textContent = `${fmt(left, 0)} = ${fmt(right, left.length)}`;
  resultBox.style.display = 'block';
  status.textContent = '✅ Balanced successfully!';
  status.style.color = '#16a34a';
}
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

  // =========================
  // LẤY DANH SÁCH NGUYÊN TỐ
  // =========================
  const elements = new Set();

  const counts = all.map(formula => {
    const c = parseFormula(formula);

    Object.keys(c).forEach(e => elements.add(e));

    return c;
  });

  // Kiểm tra nguyên tố chỉ xuất hiện một vế
  for (const e of elements) {
    let leftCount = 0;
    let rightCount = 0;

    for (let i = 0; i < left.length; i++) {
      leftCount += counts[i][e] || 0;
    }

    for (let i = 0; i < right.length; i++) {
      rightCount += counts[left.length + i][e] || 0;
    }

    if (leftCount === 0 || rightCount === 0) {
      status.textContent = `⚠️ Element ${e} only on one side`;
      status.style.color = '#ef4444';
      return;
    }
  }

  // =========================
  // TẠO MA TRẬN
  // =========================

  const elemList = [...elements];
  const m = elemList.length;

  const matrix = Array.from(
    { length: m },
    () => Array(n).fill(0)
  );

  for (let r = 0; r < m; r++) {
    const e = elemList[r];

    for (let c = 0; c < n; c++) {
      const amount = counts[c][e] || 0;

      matrix[r][c] =
        c < left.length ? amount : -amount;
    }
  }

  // =========================
  // GAUSSIAN ELIMINATION
  // =========================

  const A = matrix.map(row => row.map(Number));

  let pivotRow = 0;
  const pivotCols = [];

  for (let col = 0; col < n && pivotRow < m; col++) {

    // Tìm pivot
    let pivot = pivotRow;

    for (let r = pivotRow + 1; r < m; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) {
        pivot = r;
      }
    }

    // Không có pivot
    if (Math.abs(A[pivot][col]) < 1e-10) {
      continue;
    }

    // Đổi hàng
    [A[pivotRow], A[pivot]] =
      [A[pivot], A[pivotRow]];

    // Chuẩn hóa pivot
    const pivotValue = A[pivotRow][col];

    for (let c = 0; c < n; c++) {
      A[pivotRow][c] /= pivotValue;
    }

    // Khử toàn bộ cột
    for (let r = 0; r < m; r++) {
      if (r === pivotRow) continue;

      const factor = A[r][col];

      if (Math.abs(factor) < 1e-10) continue;

      for (let c = 0; c < n; c++) {
        A[r][c] -= factor * A[pivotRow][c];
      }
    }

    pivotCols.push(col);
    pivotRow++;
  }

  // =========================
  // TÌM FREE VARIABLE
  // =========================

  const pivotSet = new Set(pivotCols);

  const freeCols = [];

  for (let c = 0; c < n; c++) {
    if (!pivotSet.has(c)) {
      freeCols.push(c);
    }
  }

  if (freeCols.length === 0) {
    status.textContent = '❌ No valid balancing solution';
    status.style.color = '#ef4444';
    return;
  }

  // Chọn free variable = 1
  const solution = Array(n).fill(0);
  solution[freeCols[0]] = 1;

  // =========================
  // TÍNH CÁC HỆ SỐ PIVOT
  // =========================

  for (let i = pivotCols.length - 1; i >= 0; i--) {

    const row = i;
    const col = pivotCols[i];

    let value = 0;

    for (let c = 0; c < n; c++) {
      if (c === col) continue;

      value += A[row][c] * solution[c];
    }

    solution[col] = -value;
  }

  // =========================
  // ĐỔI SANG SỐ NGUYÊN
  // =========================

  function gcdInt(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));

    while (b !== 0) {
      [a, b] = [b, a % b];
    }

    return a;
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcdInt(a, b);
  }

  // Tìm mẫu số chung
  function denominator(x) {
    const s = x.toString();

    if (!s.includes('.')) return 1;

    return Math.pow(
      10,
      s.split('.')[1].length
    );
  }

  let commonDenominator = 1;

  for (const x of solution) {
    commonDenominator = lcm(
      commonDenominator,
      denominator(x)
    );
  }

  let coeffs = solution.map(x =>
    Math.round(x * commonDenominator)
  );

  // Đổi dấu nếu cần
  const firstNonZero = coeffs.find(x => x !== 0);

  if (firstNonZero < 0) {
    coeffs = coeffs.map(x => -x);
  }

  // Rút gọn GCD
  let g = coeffs[0];

  for (let i = 1; i < coeffs.length; i++) {
    g = gcdInt(g, coeffs[i]);
  }

  if (g === 0) {
    status.textContent = '❌ Cannot balance this equation';
    status.style.color = '#ef4444';
    return;
  }

  coeffs = coeffs.map(x => Math.round(x / g));

  // Kiểm tra hệ số dương
  if (coeffs.some(x => x <= 0)) {
    status.textContent = '❌ Cannot find positive coefficients';
    status.style.color = '#ef4444';
    return;
  }

  // =========================
  // FORMAT KẾT QUẢ
  // =========================

  const fmt = (arr, off) => {
    return arr.map((formula, i) => {
      const v = coeffs[off + i];

      return v === 1
        ? formula
        : `${v}${formula}`;
    }).join(' + ');
  };

  balancedResult.textContent =
    `${fmt(left, 0)} = ${fmt(right, left.length)}`;

  resultBox.style.display = 'block';

  status.textContent =
    '✅ Balanced successfully!';

  status.style.color = '#16a34a';
}
function resetAll() {
  document.getElementById('equation').value = '';
  document.getElementById('status').textContent = '';
  document.getElementById('result-box').style.display = 'none';
}

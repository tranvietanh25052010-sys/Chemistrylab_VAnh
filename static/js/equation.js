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

function resetAll() {
  document.getElementById('equation').value = '';
  document.getElementById('status').textContent = '';
  document.getElementById('result-box').style.display = 'none';
}
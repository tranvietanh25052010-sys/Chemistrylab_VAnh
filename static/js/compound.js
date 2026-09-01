// Bảng khối lượng nguyên tử chuẩn
const ATOMIC_MASS = {
  H:1.008,He:4.0026,Li:6.94,Be:9.0122,B:10.81,C:12.011,N:14.007,O:15.999,F:18.998,Ne:20.180,
  Na:22.990,Mg:24.305,Al:26.982,Si:28.085,P:30.974,S:32.06,Cl:35.45,Ar:39.948,
  K:39.098,Ca:40.078,Sc:44.956,Ti:47.867,V:50.942,Cr:51.996,Mn:54.938,Fe:55.845,
  Co:58.933,Ni:58.693,Cu:63.546,Zn:65.38,Ga:69.723,Ge:72.630,As:74.922,Se:78.971,
  Br:79.904,Kr:83.798,Rb:85.468,Sr:87.62,Y:88.906,Zr:91.224,Nb:92.906,Mo:95.95,
  Tc:98,Ru:101.07,Rh:102.91,Pd:106.42,Ag:107.87,Cd:112.41,In:114.82,Sn:118.71,
  Sb:121.76,Te:127.60,I:126.90,Xe:131.29,Cs:132.91,Ba:137.33,La:138.91,Ce:140.12,
  Pr:140.91,Nd:144.24,Pm:145,Sm:150.36,Eu:151.96,Gd:157.25,Tb:158.93,Dy:162.50,
  Ho:164.93,Er:167.26,Tm:168.93,Yb:173.05,Lu:174.97,Hf:178.49,Ta:180.95,W:183.84,
  Re:186.21,Os:190.23,Ir:192.22,Pt:195.08,Au:196.97,Hg:200.59,Tl:204.38,Pb:207.2,
  Bi:208.98,Po:209,At:210,Rn:222,Fr:223,Ra:226,Ac:227,Th:232.04,Pa:231.04,U:238.03,
  Np:237,Pu:244,Am:243,Cm:247,Bk:247,Cf:251,Es:252,Fm:257,Md:258,No:259,Lr:266,
  Rf:267,Db:268,Sg:269,Bh:270,Hs:269,Mt:278,Ds:281,Rg:282,Cn:285,Nh:286,Fl:289,
  Mc:290,Lv:293,Ts:294,Og:294
};

// Hàm tiền xử lý: Tự động chuyển CuSO4.5H2O hoặc CuSO4*5H2O thành CuSO4(H2O)5
function preprocessFormula(formula) {
  return formula.replace(/[\.\*](\d*)([A-Z][a-z0-9\(\)]*)/g, (match, coeff, compound) => {
    const mult = coeff || '1';
    return `(${compound})${mult}`;
  });
}

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

function calculateMass() {
  const formula = document.getElementById('formula').value.trim();
  const status = document.getElementById('status');
  const resultBox = document.getElementById('result-box');
  const totalMass = document.getElementById('total-mass');
  const elementList = document.getElementById('element-list');

  resultBox.style.display = 'none';
  status.textContent = '';
  elementList.innerHTML = '';

  if (!formula) {
    status.textContent = '⚠️ Please enter a chemical formula';
    status.style.color = '#ef4444';
    return;
  }

  try {
    // Thêm đoạn tiền xử lý chuỗi ở đây
    const processedFormula = preprocessFormula(formula);
    const elemCounts = parseFormula(processedFormula);
    let total = 0;

    for (let e in elemCounts) {
      if (!ATOMIC_MASS[e]) {
        status.textContent = `⚠️ Unknown element: ${e}`;
        status.style.color = '#ef4444';
        return;
      }
      total += ATOMIC_MASS[e] * elemCounts[e];
    }

    totalMass.textContent = `Molar Mass: ${total.toFixed(3)} g/mol`;

    // Hiển thị chi tiết từng nguyên tố
    for (let e in elemCounts) {
      const mass = ATOMIC_MASS[e] * elemCounts[e];
      const percent = ((mass / total) * 100).toFixed(2);
      const item = document.createElement('div');
      item.className = 'element-item';
      item.innerHTML = `<span>${e} × ${elemCounts[e]}</span><span>${mass.toFixed(3)} g/mol (${percent}%)</span>`;
      elementList.appendChild(item);
    }

    resultBox.style.display = 'block';
    status.textContent = 'Calculated successfully!';
    status.style.color = '#16a34a';

  } catch (err) {
    status.textContent = '⚠️ Invalid formula format';
    status.style.color = '#ef4444';
  }
}

function resetAll() {
  document.getElementById('formula').value = '';
  document.getElementById('status').textContent = '';
  document.getElementById('result-box').style.display = 'none';
}

const grid = document.getElementById('grid');
let activeFilter = null;

function makeCell(e){
  const [num,sym,name,mass,cat,period,group,phase] = e;
  const div = document.createElement('div');
  div.className = 'cell ' + CATS[cat].cls;
  div.dataset.cat = cat;
  div.dataset.name = name.toLowerCase();
  div.dataset.sym = sym.toLowerCase();
  div.dataset.num = num;

  // Đặt đúng chuẩn bảng tuần hoàn
  if(period === 'f'){
    div.style.gridRow = 9;
    div.style.gridColumn = 3 + group;
  } else if(period === 'a'){
    div.style.gridRow = 10;
    div.style.gridColumn = 3 + group;
  } else {
    div.style.gridRow = period;
    div.style.gridColumn = group;
  }

  div.innerHTML = `<span class="num">${num}</span><span class="sym">${sym}</span><span class="mass">${mass}</span>`;
  div.addEventListener('click', () => openPanel(e));
  grid.appendChild(div);
}

EL.forEach(makeCell);

// Ghi chú nhỏ gọn, không chiếm chỗ ô thật
function placeholder(text, row){
  const div = document.createElement('div');
  div.className = 'placeholder';
  div.style.gridRow = row;
  div.style.gridColumn = 3;
  div.style.gridColumnSpan = 14;
  div.style.color = '#94a3b8';
  div.style.fontSize = '11px';
  div.textContent = text;
  grid.appendChild(div);
}
placeholder('← Lanthanides (57–71) – Actinides (89–103) →', 6);
placeholder('* Lanthanides: 57 La – 71 Lu', 9);
placeholder('* Actinides: 89 Ac – 103 Lr', 10);

// === PHẦN CÒN LẠI GIỮ NGUYÊN ===
const SWATCH_VAR = {
  'alkali-metal':'alkali', 'alkaline-earth-metal':'alkaline-earth', 'transition-metal':'transition',
  'post-transition-metal':'post-transition', 'metalloid':'metalloid', 'reactive-nonmetal':'nonmetal',
  'halogen':'halogen', 'noble-gas':'noble', 'lanthanide':'lanthanide', 'actinide':'actinide'
};
const legend = document.getElementById('legend');
Object.entries(CATS).forEach(([key,val]) => {
  const btn = document.createElement('button');
  btn.innerHTML = `<span class="swatch" style="background:var(--cat-${SWATCH_VAR[key]})"></span>${val.label}`;
  btn.addEventListener('click', () => {
    if(activeFilter === key){
      activeFilter = null;
      btn.classList.remove('active');
    } else {
      document.querySelectorAll('.legend button').forEach(b=>b.classList.remove('active'));
      activeFilter = key;
      btn.classList.add('active');
    }
    applyFilters();
  });
  legend.appendChild(btn);
});

const search = document.getElementById('search');
search.addEventListener('input', applyFilters);

function applyFilters(){
  const q = search.value.trim().toLowerCase();
  document.querySelectorAll('.cell').forEach(cell => {
    const matchesSearch = !q || cell.dataset.name.includes(q) || cell.dataset.sym.includes(q) || cell.dataset.num === q;
    const matchesCat = !activeFilter || cell.dataset.cat === activeFilter;
    cell.classList.toggle('dim', !(matchesSearch && matchesCat));
  });
}

function openPanel(e){
  const [num,sym,name,mass,cat,period,group,phase] = e;
  document.getElementById('p-sym').textContent = sym;
  document.getElementById('p-name').textContent = name;
  document.getElementById('p-num').textContent = num;
  document.getElementById('p-mass').textContent = mass + ' u';
  const pStr = (period==='f' ? '6 (Lanthanide)' : period==='a' ? '7 (Actinide)' : period);
  const gStr = (period==='f' || period==='a') ? '—' : group;
  document.getElementById('p-pg').textContent = pStr + ' / ' + gStr;
  document.getElementById('p-phase').textContent = phaseEN[phase];
  const tag = document.getElementById('p-cat');
  tag.textContent = CATS[cat].label;
  tag.className = 'cat-tag ' + CATS[cat].cls;
  document.getElementById('panel-overlay').classList.add('open');
}
function closePanel(){
  document.getElementById('panel-overlay').classList.remove('open');
}
document.getElementById('panel-overlay').addEventListener('click', (e)=>{
  if(e.target.id === 'panel-overlay') closePanel();
});
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closePanel(); });
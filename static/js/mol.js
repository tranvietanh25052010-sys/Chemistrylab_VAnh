// Constants
const AVOGADRO = 6.02214076e23;
const MOLAR_VOL_STP = 22.414;  // STP: 0°C, 1 atm
const MOLAR_VOL_RTP = 24.79;   // RTP: 25°C, 1 atm

// Update input field when mode changes
function changeMode() {
  const mode = document.getElementById('mode').value;
  const condGroup = document.getElementById('cond-group');
  const inputField = document.getElementById('input-field');

  condGroup.style.display = 'none';
  inputField.innerHTML = '';

  if(!mode) return;

  const labels = {
    mass: 'Mass (g)',
    moles: 'Amount of Substance (mol)',
    particles: 'Number of Particles',
    volume: 'Gas Volume (L)'
  };

  inputField.innerHTML = `
    <label>${labels[mode]}</label>
    <input id="user-input" type="number" step="any" placeholder="Enter value">
  `;

  if(mode === 'volume') condGroup.style.display = 'block';
}

// Main calculation
function calculate() {
  const mode = document.getElementById('mode').value;
  const molar = parseFloat(document.getElementById('molar').value);
  const status = document.getElementById('status');

  if(!mode || !molar || molar <= 0) {
    status.textContent = "⚠️ Please select a mode and enter a valid positive Molar Mass!";
    status.style.color = "#ef4444";
    return;
  }

  const userVal = parseFloat(document.getElementById('user-input').value);
  if(isNaN(userVal) || userVal < 0) {
    status.textContent = "⚠️ Please enter a valid positive value!";
    status.style.color = "#ef4444";
    return;
  }

  let n; // number of moles

  switch(mode) {
    case 'mass': n = userVal / molar; break;
    case 'moles': n = userVal; break;
    case 'particles': n = userVal / AVOGADRO; break;
    case 'volume':
      const cond = document.getElementById('condition').value;
      const vol = cond === 'stp' ? MOLAR_VOL_STP : MOLAR_VOL_RTP;
      n = userVal / vol;
      break;
  }

  // Fill all results
  document.getElementById('mass').value = (n * molar).toFixed(4);
  document.getElementById('mole').value = n.toFixed(6);
  document.getElementById('particles').value = (n * AVOGADRO).toExponential(4);
  document.getElementById('vol-stp').value = (n * MOLAR_VOL_STP).toFixed(4);
  document.getElementById('vol-rtp').value = (n * MOLAR_VOL_RTP).toFixed(4);

  status.textContent = "✅ Calculation complete!";
  status.style.color = "#16a34a";
}

// Reset all fields
function resetAll() {
  document.getElementById('mode').value = '';
  document.getElementById('molar').value = '';
  document.getElementById('input-field').innerHTML = '';
  document.getElementById('cond-group').style.display = 'none';
  document.getElementById('mass').value = '';
  document.getElementById('mole').value = '';
  document.getElementById('particles').value = '';
  document.getElementById('vol-stp').value = '';
  document.getElementById('vol-rtp').value = '';
  document.getElementById('status').textContent = '';
}
/**
 * Aura Calculator - Core Application Logic
 * Modern, robust, accessible basic calculator with history and audio feedback.
 */

class Calculator {
  constructor(previousOperandEl, currentOperandEl) {
    this.previousOperandEl = previousOperandEl;
    this.currentOperandEl = currentOperandEl;
    this.history = JSON.parse(localStorage.getItem('aura_calc_history') || '[]');
    this.soundEnabled = localStorage.getItem('aura_calc_sound') !== 'false';
    this.audioCtx = null;
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.overwrite = false;
    this.isError = false;
    this.clearOperatorHighlight();
  }

  delete() {
    if (this.isError) {
      this.clear();
      return;
    }
    if (this.overwrite) {
      this.currentOperand = '0';
      this.overwrite = false;
      return;
    }
    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
  }

  appendNumber(number) {
    if (this.isError) this.clear();

    if (this.overwrite) {
      this.currentOperand = number === '.' ? '0.' : number;
      this.overwrite = false;
      return;
    }

    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
      return;
    }

    // Limit maximum length to prevent visual overflow
    if (this.currentOperand.replace(/[^0-9]/g, '').length >= 14) return;

    this.currentOperand += number;
  }

  chooseOperation(operation) {
    if (this.isError) return;

    if (this.currentOperand === '' && this.previousOperand !== '') {
      this.operation = operation;
      this.updateOperatorHighlight();
      return;
    }

    if (this.previousOperand !== '') {
      this.compute(false);
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
    this.updateOperatorHighlight();
  }

  toggleSign() {
    if (this.isError || this.currentOperand === '0') return;
    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
  }

  computePercentage() {
    if (this.isError) return;
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    // If an operation is in progress (e.g., 200 + 10%)
    if (this.previousOperand && (this.operation === '+' || this.operation === '−')) {
      const prev = parseFloat(this.previousOperand);
      this.currentOperand = this.formatNumber(prev * (current / 100));
    } else {
      this.currentOperand = this.formatNumber(current / 100);
    }
    this.overwrite = true;
  }

  compute(isFinal = true) {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current) || !this.operation) return;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '−':
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.currentOperand = 'Cannot divide by zero';
          this.previousOperand = '';
          this.operation = undefined;
          this.isError = true;
          this.clearOperatorHighlight();
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Strip IEEE 754 precision errors (e.g. 0.1 + 0.2 = 0.30000000000000004)
    computation = this.stripPrecision(computation);

    const prevDisplay = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation} ${this.formatDisplayNumber(this.currentOperand)}`;

    if (isFinal) {
      this.addToHistory(prevDisplay, this.formatNumber(computation));
      this.previousOperand = `${prevDisplay} =`;
      this.operation = undefined;
      this.overwrite = true;
      this.clearOperatorHighlight();
    } else {
      this.previousOperand = this.formatNumber(computation);
    }

    this.currentOperand = this.formatNumber(computation);
  }

  stripPrecision(num) {
    return parseFloat(num.toPrecision(12));
  }

  formatNumber(number) {
    if (typeof number === 'string') return number;
    return String(number);
  }

  formatDisplayNumber(numberStr) {
    if (!numberStr) return '';
    if (isNaN(Number(numberStr))) return numberStr;

    const parts = numberStr.toString().split('.');
    const integerPart = parseFloat(parts[0]);
    const decimalPart = parts[1];

    let integerDisplay;
    if (isNaN(integerPart)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerPart.toLocaleString('en', { maximumFractionDigits: 0 });
    }

    if (decimalPart != null) {
      return `${integerDisplay}.${decimalPart}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    if (this.isError) {
      this.currentOperandEl.textContent = this.currentOperand;
      this.currentOperandEl.style.fontSize = '1.25rem';
      this.previousOperandEl.textContent = '';
      return;
    }

    const formattedCurrent = this.formatDisplayNumber(this.currentOperand);
    this.currentOperandEl.textContent = formattedCurrent || '0';

    // Dynamic Font Scaling for large numbers
    const len = formattedCurrent.length;
    if (len > 13) {
      this.currentOperandEl.style.fontSize = '1.45rem';
    } else if (len > 9) {
      this.currentOperandEl.style.fontSize = '1.85rem';
    } else {
      this.currentOperandEl.style.fontSize = '';
    }

    if (this.operation != null) {
      this.previousOperandEl.textContent = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandEl.textContent = this.previousOperand;
    }
  }

  updateOperatorHighlight() {
    this.clearOperatorHighlight();
    if (!this.operation) return;
    const opBtn = Array.from(document.querySelectorAll('.btn-operator')).find(
      btn => btn.dataset.value === this.operation || (btn.dataset.value === '−' && this.operation === '-')
    );
    if (opBtn) opBtn.classList.add('op-selected');
  }

  clearOperatorHighlight() {
    document.querySelectorAll('.btn-operator').forEach(btn => btn.classList.remove('op-selected'));
  }

  addToHistory(equation, result) {
    this.history.unshift({ equation, result, timestamp: Date.now() });
    if (this.history.length > 30) this.history.pop();
    localStorage.setItem('aura_calc_history', JSON.stringify(this.history));
    renderHistory();
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('aura_calc_history');
    renderHistory();
  }

  // Synthesized Web Audio Click
  playClickSound() {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio not supported or blocked, fail silently
    }
  }
}

/* ==========================================================================
   DOM Initialization & Event Bindings
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const previousOperandEl = document.getElementById('previousOperand');
  const currentOperandEl = document.getElementById('currentOperand');
  const calculator = new Calculator(previousOperandEl, currentOperandEl);

  // Keypad click handlers
  const numberButtons = document.querySelectorAll('[data-number]');
  const operationButtons = document.querySelectorAll('[data-action="operation"]');
  const equalsButton = document.querySelector('[data-action="calculate"]');
  const clearAllButton = document.querySelector('[data-action="clear-all"]');
  const deleteButton = document.querySelector('[data-action="delete"]');
  const percentButton = document.querySelector('[data-action="percentage"]');
  const toggleSignButton = document.querySelector('[data-action="toggle-sign"]');

  numberButtons.forEach(button => {
    button.addEventListener('click', () => {
      calculator.playClickSound();
      calculator.appendNumber(button.dataset.number);
      calculator.updateDisplay();
    });
  });

  operationButtons.forEach(button => {
    button.addEventListener('click', () => {
      calculator.playClickSound();
      calculator.chooseOperation(button.dataset.value);
      calculator.updateDisplay();
    });
  });

  if (equalsButton) {
    equalsButton.addEventListener('click', () => {
      calculator.playClickSound();
      calculator.compute();
      calculator.updateDisplay();
    });
  }

  if (clearAllButton) {
    clearAllButton.addEventListener('click', () => {
      calculator.playClickSound();
      calculator.clear();
      calculator.updateDisplay();
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      calculator.playClickSound();
      calculator.delete();
      calculator.updateDisplay();
    });
  }

  if (percentButton) {
    percentButton.addEventListener('click', () => {
      calculator.playClickSound();
      calculator.computePercentage();
      calculator.updateDisplay();
    });
  }

  if (toggleSignButton) {
    toggleSignButton.addEventListener('click', () => {
      calculator.playClickSound();
      calculator.toggleSign();
      calculator.updateDisplay();
    });
  }

  // Keyboard Support
  window.addEventListener('keydown', (e) => {
    // Ignore if user is typing into an input field or dialog
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    let triggerBtn = null;

    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
      triggerBtn = document.querySelector(`[data-number="${e.key}"]`);
      calculator.playClickSound();
      calculator.appendNumber(e.key);
      calculator.updateDisplay();
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
      e.preventDefault();
      let opSymbol = e.key;
      if (e.key === '/') opSymbol = '÷';
      if (e.key === '*') opSymbol = '×';
      if (e.key === '-') opSymbol = '−';

      triggerBtn = document.querySelector(`[data-value="${opSymbol}"]`);
      calculator.playClickSound();
      calculator.chooseOperation(opSymbol);
      calculator.updateDisplay();
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      triggerBtn = equalsButton;
      calculator.playClickSound();
      calculator.compute();
      calculator.updateDisplay();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      triggerBtn = deleteButton;
      calculator.playClickSound();
      calculator.delete();
      calculator.updateDisplay();
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      triggerBtn = clearAllButton;
      calculator.playClickSound();
      calculator.clear();
      calculator.updateDisplay();
    } else if (e.key === '%') {
      triggerBtn = percentButton;
      calculator.playClickSound();
      calculator.computePercentage();
      calculator.updateDisplay();
    }

    if (triggerBtn) {
      triggerBtn.classList.add('keyboard-active');
      setTimeout(() => triggerBtn.classList.remove('keyboard-active'), 120);
    }
  });

  // Copy Result to Clipboard
  const copyBtn = document.getElementById('copyBtn');
  const copyToast = document.getElementById('copyToast');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      calculator.playClickSound();
      const val = calculator.currentOperand;
      if (!val || calculator.isError) return;

      navigator.clipboard.writeText(val).then(() => {
        copyToast.classList.add('show');
        setTimeout(() => copyToast.classList.remove('show'), 1500);
      }).catch(() => {
        // Fallback for clipboard
        const input = document.createElement('input');
        input.value = val;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        copyToast.classList.add('show');
        setTimeout(() => copyToast.classList.remove('show'), 1500);
      });
    });
  }

  // Theme Toggle (Dark / Light)
  const themeBtn = document.getElementById('themeBtn');
  const iconMoon = themeBtn.querySelector('.icon-moon');
  const iconSun = themeBtn.querySelector('.icon-sun');

  const currentTheme = localStorage.getItem('aura_calc_theme') || 'dark';
  applyTheme(currentTheme);

  themeBtn.addEventListener('click', () => {
    calculator.playClickSound();
    const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
    applyTheme(nextTheme);
  });

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      iconMoon.classList.add('hidden');
      iconSun.classList.remove('hidden');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      iconMoon.classList.remove('hidden');
      iconSun.classList.add('hidden');
    }
    localStorage.setItem('aura_calc_theme', theme);
  }

  // Sound Toggle
  const soundBtn = document.getElementById('soundBtn');
  const iconSoundOn = soundBtn.querySelector('.icon-sound-on');
  const iconSoundOff = soundBtn.querySelector('.icon-sound-off');

  function updateSoundUI() {
    if (calculator.soundEnabled) {
      iconSoundOn.classList.remove('hidden');
      iconSoundOff.classList.add('hidden');
    } else {
      iconSoundOn.classList.add('hidden');
      iconSoundOff.classList.remove('hidden');
    }
  }
  updateSoundUI();

  soundBtn.addEventListener('click', () => {
    calculator.soundEnabled = !calculator.soundEnabled;
    localStorage.setItem('aura_calc_sound', calculator.soundEnabled);
    updateSoundUI();
    if (calculator.soundEnabled) calculator.playClickSound();
  });

  // History Drawer Controls
  const historyBtn = document.getElementById('historyBtn');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const historyDrawer = document.getElementById('historyDrawer');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  function openHistory() {
    historyDrawer.classList.add('open');
    historyDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeHistory() {
    historyDrawer.classList.remove('open');
    historyDrawer.setAttribute('aria-hidden', 'true');
  }

  historyBtn.addEventListener('click', () => {
    calculator.playClickSound();
    openHistory();
  });

  closeHistoryBtn.addEventListener('click', () => {
    calculator.playClickSound();
    closeHistory();
  });

  clearHistoryBtn.addEventListener('click', () => {
    calculator.playClickSound();
    calculator.clearHistory();
  });

  window.renderHistory = function() {
    if (!historyList) return;
    if (calculator.history.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
      return;
    }

    historyList.innerHTML = calculator.history.map((item, index) => `
      <div class="history-item" data-index="${index}" title="Click to use this result">
        <div class="history-item-equation">${item.equation}</div>
        <div class="history-item-result">= ${item.result}</div>
      </div>
    `).join('');

    // Clicking a history entry loads its result
    document.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        calculator.playClickSound();
        const index = parseInt(el.dataset.index, 10);
        const selected = calculator.history[index];
        if (selected) {
          calculator.currentOperand = selected.result;
          calculator.previousOperand = '';
          calculator.operation = undefined;
          calculator.overwrite = true;
          calculator.updateDisplay();
          closeHistory();
        }
      });
    });
  };

  // Initial render of history
  window.renderHistory();
  calculator.updateDisplay();
});

'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const app = document.querySelector('.app');
  const paper = $('paper'), writer = $('writer'), ink = $('ink');
  const rail = document.querySelector('.rail'), carriage = $('carriage'), head = $('head');
  const STORAGE = 'paper-room-draft-v1', MAX = 3000;
  let editing = false, nativeMode = false, composing = false;
  let shifted = false, symbols = false, lit = true, soundOn = true;
  let railY = 300, lastText = '', lastLine = 0, audio = null;
  let saveTimer, toastTimer, demoTimer, demoRunning = false, returnTimer;
  let animationFrame, storageAvailable = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cap = value => [...value].slice(0, MAX).join('');
  try { writer.value = cap(localStorage.getItem(STORAGE) || ''); }
  catch { storageAvailable = false; }
  lastText = writer.value;
  writer.setSelectionRange(writer.value.length, writer.value.length);

  function toast(message) {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2400);
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE, writer.value);
        storageAvailable = true;
        $('save-indicator').textContent = editing && writer.value ? '已保存' : '';
      } catch {
        storageAvailable = false;
        $('save-indicator').textContent = '请导出留存';
      }
    }, 500);
  }

  function initAudio() {
    if (!soundOn) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch { audio = null; }
  }

  function clickSound(kind = 'key') {
    if (!soundOn || !audio || audio.state !== 'running') return;
    const now = audio.currentTime;
    if (kind === 'return') {
      const osc = audio.createOscillator(), volume = audio.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(1350, now);
      volume.gain.setValueAtTime(.035, now);
      volume.gain.exponentialRampToValueAtTime(.001, now + .34);
      osc.connect(volume).connect(audio.destination); osc.start(now); osc.stop(now + .35);
    }
    const duration = kind === 'return' ? .18 : .045;
    const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * .14));
    const source = audio.createBufferSource(), filter = audio.createBiquadFilter(), gain = audio.createGain();
    source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = kind === 'space' ? 650 : 1650; filter.Q.value = .7;
    gain.gain.value = kind === 'return' ? .14 : .18;
    source.connect(filter).connect(gain).connect(audio.destination); source.start(now);
    const osc = audio.createOscillator(), tapGain = audio.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(170, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + .035);
    tapGain.gain.setValueAtTime(.035, now); tapGain.gain.exponentialRampToValueAtTime(.001, now + .04);
    osc.connect(tapGain).connect(audio.destination); osc.start(now); osc.stop(now + .05);
  }

  function pulse(returning = false, kind = 'key') {
    if (!reduced) {
      head.animate([{ transform:'translateY(0) rotate(0)' }, { transform:'translateY(-2px) rotate(-.6deg)', offset:.22 }, { transform:'translateY(1px) rotate(.3deg)', offset:.65 }, { transform:'translateY(0)' }], { duration:150, easing:'ease-out' });
      document.querySelector('.hammer')?.animate([{ transform:'rotateX(0deg)' }, { transform:'rotateX(68deg) translateY(-3px)', offset:.25 }, { transform:'rotateX(0deg)' }], { duration:130 });
    }
    if (returning) {
      carriage.classList.add('returning');
      clearTimeout(returnTimer);
      returnTimer = setTimeout(() => carriage.classList.remove('returning'), 380);
    }
    clickSound(returning ? 'return' : kind);
  }

  function render(motion = false, kind = 'key') {
    const value = writer.value, cursor = writer.selectionStart ?? value.length;
    const marker = document.createElement('span'); marker.className = 'caret-marker';
    ink.replaceChildren(document.createTextNode(value.slice(0, cursor)), marker, document.createTextNode(value.slice(cursor)));
    app.classList.toggle('has-text', Boolean(value));
    $('counter').querySelector('span').textContent = String([...value].length);
    $('counter').classList.toggle('limit', [...value].length >= MAX);
    $('paper-hint').textContent = value ? '轻点纸张，继续写字' : '轻点纸张，开始写字';
    const caretY = marker.offsetTop;
    const offset = railY - 53 - caretY;
    ink.style.transform = `translateY(${offset}px)`;
    writer.style.transform = `translateY(${offset}px)`;
    writer.style.height = `${Math.max(31, ink.scrollHeight + 4)}px`;
    writer.scrollTop = 0;
    const left = !editing && !value ? paper.clientWidth * .53 : parseFloat(getComputedStyle(ink).left) + marker.offsetLeft;
    const line = Math.round(caretY / parseFloat(getComputedStyle(ink).lineHeight));
    const returning = motion && (line > lastLine || kind === 'return');
    if (motion) pulse(returning, kind);
    const machineX = Math.max(2, Math.min(paper.clientWidth - 76, left - 18));
    carriage.style.left = `${machineX}px`;
    window.paperLamp?.follow(left, railY - 28);
    app.dataset.caretX = left.toFixed(2);
    app.dataset.caretY = String(railY - 28);
    lastLine = line;
  }

  function layout() {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      railY = Math.max(153, Math.min(paper.clientHeight - 62, paper.clientHeight * (editing ? .66 : .59)));
      rail.style.top = `${railY}px`;
      document.querySelector('.ink-window').style.height = `${railY - 20}px`;
      document.querySelector('.placeholder').style.top = `${railY - 101}px`;
      render();
    });
  }
  new ResizeObserver(layout).observe(paper);

  function begin({ native = false } = {}) {
    editing = true; nativeMode = native;
    app.classList.add('editing'); app.classList.toggle('native-mode', nativeMode);
    $('keyboard').inert = nativeMode;
    writer.setAttribute('inputmode', native ? 'text' : 'none');
    writer.focus({ preventScroll:true }); initAudio(); layout(); render();
  }

  function done() {
    stopDemo(); editing = false; nativeMode = false;
    app.classList.remove('editing', 'native-mode');
    $('keyboard').inert = true;
    writer.blur(); $('save-indicator').textContent = ''; save(); layout();
  }

  function stopDemo() { clearTimeout(demoTimer); demoRunning = false; $('demo').disabled = false; }

  function commit(value, cursor, kind = 'key') {
    if ([...value].length > MAX) { toast('这一页已经写满了，可以导出留存'); return; }
    writer.value = value;
    writer.setSelectionRange(cursor, cursor);
    lastText = value;
    $('save-indicator').textContent = '';
    render(true, kind); save();
  }

  function insert(text) {
    const start = writer.selectionStart ?? writer.value.length, end = writer.selectionEnd ?? start;
    commit(writer.value.slice(0, start) + text + writer.value.slice(end), start + text.length, text === '\n' ? 'return' : text === ' ' ? 'space' : 'key');
  }

  function erase() {
    const start = writer.selectionStart, end = writer.selectionEnd;
    if (!start && start === end) return;
    let from = start;
    if (start === end) {
      if ('Segmenter' in Intl) {
        const parts = [...new Intl.Segmenter(undefined, { granularity:'grapheme' }).segment(writer.value.slice(0, start))];
        from = parts.at(-1)?.index ?? 0;
      } else from = start - (writer.value.codePointAt(start - 2) > 0xFFFF ? 2 : 1);
    }
    commit(writer.value.slice(0, from) + writer.value.slice(end), from, 'delete');
  }

  function flash(key) {
    const keyButton = [...document.querySelectorAll('.key')].find(b => b.dataset.key.toLowerCase() === key.toLowerCase());
    if (!keyButton) return;
    keyButton.classList.add('active');
    clearTimeout(keyButton._timer);
    keyButton._timer = setTimeout(() => keyButton.classList.remove('active'), 130);
  }

  function drawKeyboard() {
    const rows = symbols ? ['1234567890', '-/:;()$&@"', '.,?!\''] : ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    const keyboard = $('keys'); keyboard.replaceChildren();
    function key(parent, value, label, cls = '', icon = '') {
      const b = document.createElement('button'); b.type = 'button'; b.className = `key ${cls}`; b.dataset.key = value;
      b.setAttribute('aria-label', label);
      if (icon) b.innerHTML = `<svg aria-hidden="true"><use href="#i-${icon}"/></svg>`;
      else b.append(document.createTextNode(label));
      if (value.length === 1 && value !== ' ') {
        const pop = document.createElement('span'); pop.className = 'key-pop'; pop.textContent = label; b.append(pop);
      }
      parent.append(b);
      b.addEventListener('pointerdown', event => { event.preventDefault(); });
      b.addEventListener('click', () => {
        stopDemo(); initAudio();
        if (!editing) begin();
        if (value === 'Shift') { shifted = !shifted; drawKeyboard(); return; }
        if (value === 'Symbols') { symbols = !symbols; drawKeyboard(); return; }
        if (value === 'Backspace') erase();
        else if (value === 'Enter') insert('\n');
        else insert(value);
        flash(value);
        if (shifted && /^[A-Z]$/.test(value)) { shifted = false; setTimeout(drawKeyboard, 140); }
      });
    }
    rows.forEach((letters, index) => {
      const row = document.createElement('div'); row.className = 'key-row'; keyboard.append(row);
      if (index === 2) key(row, 'Shift', '切换大小写', `special ${shifted ? 'shift-on' : ''}`, 'shift');
      for (const letter of letters) {
        const character = shifted ? letter.toUpperCase() : letter;
        key(row, character, character);
      }
      if (index === 2) key(row, 'Backspace', '退格', 'special', 'delete');
    });
    const row = document.createElement('div'); row.className = 'key-row'; keyboard.append(row);
    key(row, 'Symbols', symbols ? 'ABC' : '123', 'special');
    key(row, ',', ',', 'special');
    key(row, ' ', 'space', 'space');
    row.querySelector('[data-key=" "]').firstChild.textContent = '';
    key(row, 'Enter', '换行', 'special return', 'return');
  }

  writer.addEventListener('focus', () => {
    if (!editing) { editing = true; app.classList.add('editing'); $('keyboard').inert = false; initAudio(); render(); }
  });
  writer.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); done(); return; }
    if (event.isComposing || composing || event.key === 'Process') return;
    stopDemo(); initAudio(); flash(event.key);
  });
  writer.addEventListener('compositionstart', () => { stopDemo(); composing = true; });
  writer.addEventListener('compositionend', () => {
    composing = false; writer.value = cap(writer.value); lastText = writer.value; render(true); save();
  });
  writer.addEventListener('input', event => {
    if (composing || event.isComposing) { render(); return; }
    if ([...writer.value].length > MAX) {
      writer.value = cap(writer.value);
      toast('这一页已经写满了，可以导出留存');
    }
    const changed = writer.value !== lastText;
    const kind = event.inputType === 'insertLineBreak' ? 'return' : event.data === ' ' ? 'space' : 'key';
    lastText = writer.value;
    $('save-indicator').textContent = '';
    render(changed, kind); save();
  });
  writer.addEventListener('select', () => { if (!composing) render(); });
  writer.addEventListener('pointerup', () => requestAnimationFrame(() => render()));
  document.addEventListener('selectionchange', () => { if(document.activeElement === writer && !composing) render(); });
  writer.addEventListener('keyup', event => { if (event.key.startsWith('Arrow') || ['Home','End'].includes(event.key)) render(); });
  paper.addEventListener('click', event => {
    if (event.target.closest('button')) return;
    stopDemo(); begin({ native:nativeMode });
  });
  $('done').addEventListener('click', done);
  $('native').addEventListener('pointerdown', event => event.preventDefault());
  $('native').addEventListener('click', () => {
    writer.blur(); begin({ native:true });
    if (!matchMedia('(pointer:coarse)').matches) toast('可以直接使用电脑的中文输入法');
  });

  function toggleLight() {
    lit = !lit; app.classList.toggle('light-off', !lit); window.paperLamp?.setLit(lit);
    for (const id of ['lamp', 'light']) { $(id).setAttribute('aria-pressed', String(lit)); $(id).setAttribute('aria-label', lit ? '关闭台灯' : '打开台灯'); }
    initAudio(); clickSound('space');
  }
  $('lamp').addEventListener('click', toggleLight);
  $('light').addEventListener('click', toggleLight);
  for (const id of ['lamp', 'light']) $(id).addEventListener('pointerdown', event => event.preventDefault());
  $('sound').addEventListener('pointerdown', event => event.preventDefault());
  $('sound').addEventListener('click', () => {
    soundOn = !soundOn; $('sound').setAttribute('aria-pressed', String(soundOn));
    $('sound').setAttribute('aria-label', soundOn ? '关闭打字音效' : '打开打字音效');
    initAudio(); if (soundOn) clickSound();
  });
  $('new-page').addEventListener('click', () => {
    stopDemo();
    if (writer.value) { writer.blur(); $('new-dialog').showModal(); }
    else begin();
  });
  $('new-dialog').addEventListener('close', () => {
    if ($('new-dialog').returnValue === 'new') {
      writer.value = ''; lastText = ''; lastLine = 0; render(); save();
      paper.classList.remove('new-sheet'); void paper.offsetWidth; paper.classList.add('new-sheet');
    }
    if (editing) begin({ native:nativeMode });
  });
  $('export').addEventListener('click', () => {
    if (!writer.value.trim()) { toast('写下几句话，再把这一页带走'); return; }
    stopDemo();
    const blob = new Blob([writer.value], { type:'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `纸间-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000); toast('这一页，已经为你留下');
  });
  $('demo').addEventListener('click', () => {
    if (writer.value) { begin(); toast('这张纸已经有你的文字，换张新纸后可看示范'); return; }
    begin(); demoRunning = true; $('demo').disabled = true;
    const message = 'A little room\nfor your thoughts.\n\n慢一点，也没关系。';
    const characters = [...message]; let index = 0;
    function tick() {
      if (!demoRunning) return;
      if (index >= characters.length) { stopDemo(); return; }
      const character = characters[index++]; insert(character); flash(character);
      demoTimer = setTimeout(tick, character === '\n' ? 480 : 105 + Math.random() * 80);
    }
    demoTimer = setTimeout(tick, 400);
  });

  window.addEventListener('pagehide', () => { try { localStorage.setItem(STORAGE, writer.value); } catch {} });
  if (window.visualViewport) {
    function adjustViewport() {
      if (window.innerWidth <= 520) app.style.height = `${window.visualViewport.height}px`;
      else app.style.removeProperty('height');
    }
    window.visualViewport.addEventListener('resize', adjustViewport); adjustViewport();
  }
  drawKeyboard(); layout();
  window.addEventListener('paper-lamp-ready', layout);
  if (!storageAvailable) $('save-indicator').textContent = '请导出留存';
})();

(function () {
  const $ = (selector) => document.querySelector(selector);
  const languageSelect = $('#language-select');
  const editorElement = $('#code-editor');
  let languages = [];
  let starters = {};
  let judge0Configured = false;
  let localJavaAvailable = false;
  let editor = null;
  let currentSource = '';
  let browserRuntimeMessageHandler = null;

  const setStatus = (text, type) => {
    const node = $('#execution-status');
    node.textContent = text;
    node.className = `status ${type || ''}`;
  };

  function getSource() { return editor ? editor.getValue() : editorElement.value; }
  function setSource(value) { currentSource = value; if (editor) editor.setValue(value); else editorElement.value = value; }
  function languageInfo() { return languages.find(item => item.id === languageSelect.value) || languages[0]; }
  function showIoTab(tabName) {
    document.querySelectorAll('.io-tab,.io-panel').forEach(node => node.classList.remove('active'));
    const tab = document.querySelector(`.io-tab[data-tab="${tabName}"]`);
    const panel = document.querySelector(`.io-panel[data-panel="${tabName}"]`);
    if (tab) tab.classList.add('active');
    if (panel) panel.classList.add('active');
  }

  function setMode() {
    const info = languageInfo();
    const mode = info && info.id === 'python' ? 'python' : info && info.id === 'javascript' ? 'javascript' : info && info.id === 'html' ? 'htmlmixed' : null;
    if (editor && mode) editor.setOption('mode', mode);
    if (info) $('#file-name').textContent = `main${info.extension}`;
    if (info) $('#runtime-note').textContent = info.mode === 'browser' ? 'Runs inside a sandboxed browser preview.' : (info.id === 'python' && !judge0Configured ? 'Runs with a browser Python fallback. Configure JUDGE0_URL for server-side execution.' : (info.id === 'java' && !judge0Configured && localJavaAvailable ? 'Runs with the local development JDK. Production requires an isolated Judge0 runner.' : `${info.runtime}. ${judge0Configured ? 'Local Judge0 runner is configured.' : 'Configure JUDGE0_URL on the server to enable execution.'}`));
    $('#preview-wrap').hidden = !(info && info.mode === 'browser');
  }

  function preview() {
    const info = languageInfo();
    if (!info || info.mode !== 'browser') return;
    let source = getSource();
    if (info.id === 'css') source = `<style>${source}</style><main><h1>CSS preview</h1><p>Edit the stylesheet and run again.</p></main>`;
    if (info.id === 'javascript') {
      const inputValues = JSON.stringify(String($('#input-panel').value || '').split(/\r?\n/));
      const safeSource = source.replace(/<\/script/gi, '<\\/script');
      const escapedSource = JSON.stringify(safeSource);
      source = `<script>
        (() => {
          const values = ${inputValues}; let index = 0; const output = [];
          const send = (type, value) => parent.postMessage({ source: 'owcus-browser-runtime', type, value: String(value) }, '*');
          console.log = (...args) => send('output', args.join(' '));
          console.error = (...args) => send('error', args.join(' '));
          window.prompt = () => values[index++] || '';
          window.onerror = (message) => send('error', message);
          try { (0, eval)(${escapedSource}); send('done', output.join('')); } catch (error) { send('error', error.message || error); }
        })();
      <\/script>`;
      $('#output-panel').textContent = 'Running JavaScript in the browser sandbox…';
      $('#errors-panel').textContent = '';
      if (browserRuntimeMessageHandler) window.removeEventListener('message', browserRuntimeMessageHandler);
      let hasOutput = false;
      const handler = event => {
        if (event.source !== $('#preview-frame').contentWindow || event.data?.source !== 'owcus-browser-runtime') return;
        if (event.data.type === 'output') {
          if (!hasOutput) { $('#output-panel').textContent = ''; hasOutput = true; }
          $('#output-panel').textContent += `${event.data.value}\n`;
        }
        if (event.data.type === 'error') $('#errors-panel').textContent += `${event.data.value}\n`;
        if (event.data.type === 'done') {
          if (!hasOutput) $('#output-panel').textContent = 'Program finished with no output.';
          setStatus('JavaScript browser runtime ready', '');
          window.removeEventListener('message', handler);
          browserRuntimeMessageHandler = null;
        }
      };
      window.addEventListener('message', handler, { once: false });
      browserRuntimeMessageHandler = handler;
      $('#preview-frame').srcdoc = source;
      setStatus('Running JavaScript…', 'busy');
      return;
    }
    if (info.id === 'html') source = `${source}<script>document.querySelectorAll('form').forEach(form => form.addEventListener('submit', event => event.preventDefault()));<\/script>`;
    $('#preview-frame').srcdoc = source;
    $('#output-panel').textContent = 'Browser preview updated in the sandboxed frame.';
    $('#errors-panel').textContent = 'No compiler errors.';
    setStatus('Preview ready', '');
  }

  function loadPythonRuntime() {
    if (window.Sk) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js';
      script.onload = () => {
        const stdlib = document.createElement('script');
        stdlib.src = 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js';
        stdlib.onload = resolve;
        stdlib.onerror = reject;
        document.head.appendChild(stdlib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function runPythonInBrowser(source, stdin) {
    await loadPythonRuntime();
    let output = '';
    const values = String(stdin || '').split(/\r?\n/);
    let inputIndex = 0;
    window.Sk.configure({
      output: text => { output += text; },
      inputfun: prompt => { output += prompt || ''; return values[inputIndex++] || ''; },
      read: name => {
        if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles.files[name] === undefined) throw new Error(`File not found: ${name}`);
        return window.Sk.builtinFiles.files[name];
      },
      __future__: window.Sk.python3,
    });
    await window.Sk.misceval.asyncToPromise(() => window.Sk.importMainWithBody('<stdin>', false, source, true));
    return output || '(program finished with no output)';
  }

  async function run() {
    const info = languageInfo();
    if (!info) return;
    showIoTab('output');
    if (info.mode === 'browser') { preview(); return; }
    setStatus('Running…', 'busy');
    $('#output-panel').textContent = 'Submitting to the isolated runner…';
    $('#errors-panel').textContent = '';
    const started = performance.now();
    try {
      if (!judge0Configured && info.id === 'python') {
        const output = await runPythonInBrowser(getSource(), $('#input-panel').value);
        $('#output-panel').textContent = output;
        $('#errors-panel').textContent = 'No errors. Executed in the browser Python runtime.';
        setStatus(`Python browser runtime · ${Math.round(performance.now() - started)} ms`, '');
        return;
      }
      const response = await fetch('/api/compiler/execute/', { method: 'POST', headers: {'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')}, body: JSON.stringify({language: info.id, source: getSource(), stdin: $('#input-panel').value}) });
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Compiler service returned HTTP ${response.status} instead of JSON.`);
      }
      if (response.status === 503 && info.id === 'python') {
        try {
          const output = await runPythonInBrowser(getSource(), $('#input-panel').value);
          $('#output-panel').textContent = output;
          $('#errors-panel').textContent = 'No errors. Executed in the browser Python runtime.';
          setStatus('Python browser runtime · local', '');
          return;
        } catch (browserError) {
          result.error = `${result.error} Browser fallback failed: ${browserError.message}`;
        }
      }
      $('#output-panel').textContent = result.stdout || result.message || result.error || 'No output.';
      $('#errors-panel').textContent = result.compile_output || result.stderr || result.error || 'No errors.';
      setStatus(response.ok ? `${result.status || 'Completed'} · ${Math.round(performance.now() - started)} ms` : 'Runner unavailable', response.ok ? '' : 'error');
    } catch (error) {
      const message = error instanceof TypeError
        ? 'Could not connect to the compiler service. Make sure the OWCUS server is running and try again.'
        : error.message;
      $('#output-panel').textContent = 'The program did not produce output.';
      $('#errors-panel').textContent = `Execution error\n\n${message}`;
      setStatus('Execution error', 'error');
    }
  }

  function getCookie(name) { return document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1] || ''; }
  function download() { const info = languageInfo(); const blob = new Blob([getSource()], {type: 'text/plain'}); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `main${info ? info.extension : '.txt'}`; link.click(); URL.revokeObjectURL(link.href); }
  async function save() { const name = window.prompt('Program name', `My ${languageInfo().label} program`); if (!name) return; const response = await fetch('/api/compiler/saved/', {method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':getCookie('csrftoken')},body:JSON.stringify({name,language:languageSelect.value,source:getSource()})}); const result = await response.json(); if (!response.ok) return setStatus(result.error || 'Save failed', 'error'); setStatus('Saved', ''); loadSaved(); }
  async function loadSaved() { const response = await fetch('/api/compiler/saved/'); if (!response.ok) return; const result = await response.json(); $('#saved-programs').innerHTML = result.programs.length ? result.programs.map(program => `<button class="saved-item" data-id="${program.id}"><strong>${escapeHtml(program.name)}</strong><small>${escapeHtml(program.language)}</small></button>`).join('') : '<p class="muted">No saved programs yet.</p>'; $('#saved-programs').querySelectorAll('.saved-item').forEach(button => button.addEventListener('click', async () => { const program = result.programs.find(item => String(item.id) === button.dataset.id); if (program) { languageSelect.value = program.language; setSource(program.source); setMode(); } })); }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }

  async function init() {
    const response = await fetch('/api/compiler/languages/');
    const data = await response.json();
    languages = data.languages; starters = data.starters; judge0Configured = Boolean(data.judge0_configured); localJavaAvailable = Boolean(data.local_java_available);
    languageSelect.innerHTML = languages.map(item => `<option value="${item.id}">${item.label}</option>`).join('');
    if (window.CodeMirror) { editor = window.CodeMirror.fromTextArea(editorElement, {lineNumbers:true, lineWrapping:true, autoCloseBrackets:true, mode:'python', theme:'default'}); }
    setSource(starters.python); setMode(); loadSaved();
  }
  languageSelect.addEventListener('change', () => { setSource(starters[languageSelect.value] || ''); setMode(); setStatus('Ready', ''); showIoTab('output'); });
  $('#run-code').addEventListener('click', run); $('#reset-code').addEventListener('click', () => { setSource(starters[languageSelect.value] || ''); setStatus('Reset', ''); showIoTab('output'); }); $('#copy-code').addEventListener('click', () => navigator.clipboard.writeText(getSource())); $('#download-code').addEventListener('click', download); $('#save-code').addEventListener('click', save); $('#refresh-saved').addEventListener('click', loadSaved); $('#format-code').addEventListener('click', () => setSource(getSource().split('\n').map(line => line.trimEnd()).join('\n'))); $('#maximize-panel').addEventListener('click', () => $('#compiler-panel').classList.toggle('maximized')); $('#minimize-panel').addEventListener('click', () => $('#compiler-panel').classList.toggle('minimized')); $('#clear-preview').addEventListener('click', () => { $('#preview-frame').srcdoc = ''; }); document.querySelectorAll('.io-tab').forEach(tab => tab.addEventListener('click', () => showIoTab(tab.dataset.tab))); document.addEventListener('keydown', event => { if (event.ctrlKey && event.key === 'Enter') { event.preventDefault(); run(); } });
  init();
}());

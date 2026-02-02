const $ = sel => document.querySelector(sel);
const todayEl = $('#today');
const listEl = $('#list');
const statusEl = $('#status');
const refreshBtn = $('#refreshBtn');
const autoRefreshCheckbox = $('#autoRefresh');
let timer = null;

function prettyDate(d){
  return d.toLocaleString('zh-CN', { weekday: 'long', year:'numeric', month:'2-digit', day:'2-digit' });
}

function showStatus(t){ statusEl.textContent = t; }

async function load(){
  showStatus('加载中…');
  try{
    const res = await fetch('/api/trending');
    if(!res.ok) throw new Error('网络错误');
    const data = await res.json();
    const now = new Date();
    todayEl.textContent = prettyDate(now);
    render(data.items || []);
    showStatus(`更新：${new Date().toLocaleTimeString()}`);
  }catch(err){
    showStatus('加载失败：' + err.message);
  }
}

function render(items){
  listEl.innerHTML = '';
  if(items.length===0){
    listEl.innerHTML = '<div class="status">今日暂无热门 AI 项目或文章</div>';
    return;
  }
  items.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <div class="row">
        <div class="title"><a href="${it.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(it.title)}</a></div>
        <div class="badge">${escapeHtml(it.source)}</div>
      </div>
      <div class="summary">${escapeHtml(summaryOneLine(it.summary))}</div>
    `;
    listEl.appendChild(div);
  });
}

function summaryOneLine(s){
  if(!s) return '';
  const t = s.replace(/\s+/g,' ').trim();
  return t.length>200 ? t.slice(0,197)+'...' : t;
}

function escapeHtml(s){
  if(!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

refreshBtn.addEventListener('click', ()=> load());
autoRefreshCheckbox.addEventListener('change', ()=>{
  if(autoRefreshCheckbox.checked){ startAuto(); } else { stopAuto(); }
});

function startAuto(){
  stopAuto();
  timer = setInterval(()=> load(), 1000*60*2); // 每2分钟
}
function stopAuto(){ if(timer) { clearInterval(timer); timer=null; } }

// 初始加载
load();
startAuto();

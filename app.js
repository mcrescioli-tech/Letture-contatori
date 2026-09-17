const $=s=>document.querySelector(s),canvas=$('#preview'),ctx=canvas.getContext('2d',{willReadFrequently:true});let original=null;
const storeKey='meter-readings-v1';
const METERS=[
 {code:'QL7/1',aliases:['QL7/1'],family:'IME NEMO 144'}, {code:'QL7/3',aliases:['QL7/3'],family:'IME NEMO 144'}, {code:'QK7/3',aliases:['QK7/3'],family:'IME NEMO 144'},
 {code:'QCAP1',aliases:['QCAP1','QCPA1','COMP1','COMP.1','COMP 1'],family:'Electrex VIPD3'}, {code:'QCAP2',aliases:['QCAP2','QCPA2','COMP2','COMP.2','COMP 2'],family:'Electrex VIPD3'},
 {code:'QCAP5',aliases:['QCAP5','QCPA5','COMP5','COMP.5','COMP 5'],family:'IME CONTO D4-Pt'}, {code:'QCAP3',aliases:['QCAP3','QCPA3','COMP3','COMP.3','COMP 3'],family:'IME NEMO D4-Le'},
 {code:'QCAP4',aliases:['QCAP4','QCPA4','COMP4','COMP.4','COMP 4'],family:'IME CONTO D4-Pt'}, {code:'QKL13',aliases:['QKL13','QKL 13'],family:'IME NEMO D4-Le'},
 {code:'QKL8',aliases:['QKL8','QKL 8'],family:'IME NEMO'}];
const byCode=c=>METERS.find(m=>m.code===c),norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
function identifyMeter(text){const n=norm(text);let best=null;for(const m of METERS)for(const a of m.aliases){const na=norm(a);if(na&&n.includes(na)&&(!best||na.length>best.len))best={meter:m,len:na.length}}return best?.meter||null}
async function loadPhoto(input){const f=input.files?.[0];if(!f)return;original=await createImageBitmap(f);const max=2200,scale=Math.min(1,max/original.width);canvas.width=Math.round(original.width*scale);canvas.height=Math.round(original.height*scale);ctx.drawImage(original,0,0,canvas.width,canvas.height);canvas.style.display='block';$('#analyze').disabled=false;$('#progress').textContent='Immagine pronta.'}
$('#cameraPhoto').onchange=e=>loadPhoto(e.target);$('#libraryPhoto').onchange=e=>loadPhoto(e.target);
function region(src,left,top,right,bottom,scale=1){const c=document.createElement('canvas'),sx=Math.round(src.width*left),sy=Math.round(src.height*top),sw=Math.max(1,Math.round(src.width*(right-left))),sh=Math.max(1,Math.round(src.height*(bottom-top)));c.width=Math.round(sw*scale);c.height=Math.round(sh*scale);const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.drawImage(src,sx,sy,sw,sh,0,0,c.width,c.height);return c}
function enhance(src,contrast=2,threshold=null){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);const im=x.getImageData(0,0,c.width,c.height),d=im.data;let sum=0;for(let i=0;i<d.length;i+=4)sum+=d[i]*.299+d[i+1]*.587+d[i+2]*.114;const mean=sum/(d.length/4);for(let i=0;i<d.length;i+=4){let g=d[i]*.299+d[i+1]*.587+d[i+2]*.114;g=(g-mean)*contrast+128;if(threshold!==null)g=g>threshold?255:0;g=Math.max(0,Math.min(255,g));d[i]=d[i+1]=d[i+2]=g}x.putImageData(im,0,0);return c}
function nums(text){return [...String(text).matchAll(/\d[\d\s.,'’]{2,}\d/g)].map(m=>{let s=m[0].replace(/[\s'’]/g,'');if(s.includes(',')&&s.includes('.')){const p=Math.max(s.lastIndexOf(','),s.lastIndexOf('.'));s=s.slice(0,p).replace(/[.,]/g,'')+'.'+s.slice(p+1)}else if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');else if((s.match(/\./g)||[]).length>1)s=s.replace(/\./g,'');s=s.replace(/[^0-9.]/g,'');return s}).filter(s=>/^\d+(?:\.\d+)?$/.test(s))}
function scoreReading(s,line='',source=''){const digits=s.replace('.','');let n=0;if(digits.length>=6&&digits.length<=9)n+=100;else if(digits.length===5)n+=45;else n-=80;if(s.includes('.')){n+=35;const dec=s.split('.')[1]?.length||0;if(dec>=1&&dec<=2)n+=25}const v=Number(s);if(v>=1000&&v<1e9)n+=35;if(/k\s*w\s*h/i.test(line))n+=160;if(/M\s*W\s*h/i.test(line))n+=100;if(source==='lcd')n+=80;if(/(?:^|\s)(?:V|A|Hz|kW|kVA|kVAr)(?:\s|$)/i.test(line)&&!/k\s*w\s*h/i.test(line))n-=100;return n}
function collect(text,source){const out=[];for(const line of String(text).split(/\n/)){for(const n of nums(line))out.push({n,score:scoreReading(n,line,source),line,source})}return out}
function pickReading(groups){const c=groups.flatMap(g=>collect(g.text,g.source));c.sort((a,b)=>b.score-a.score);return {best:c[0]||null,candidates:c.slice(0,8)}}
async function ocr(img,label,opts={}){const r=await Tesseract.recognize(img,'eng',{...opts,logger:m=>{if(m.status==='recognizing text')$('#progress').textContent=`${label}: ${Math.round((m.progress||0)*100)}%`}});return r.data}
async function ocrLCD(src,label){const opts={tessedit_char_whitelist:'0123456789.,kWhMVAET ',tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'};const a=await ocr(enhance(src,2.0),label+' A',opts);const b=await ocr(enhance(src,2.8,150),label+' B',opts);return [a,b]}
$('#analyze').onclick=async()=>{if(!original)return;$('#analyze').disabled=true;$('#progress').textContent='Analisi V3.1…';try{
 const selected=byCode($('#knownMeter').value);
 const full=await ocr(enhance(canvas,1.6),'Identificazione contatore',{tessedit_pageseg_mode:'11'});
 const meter=selected||identifyMeter(full.text);
 // Tre zone orizzontali centrali: il display dei contatori fotografati è tipicamente nella metà centrale della foto.
 // La lettura viene premiata solo se ha forma da totalizzatore (5-9 cifre, preferibilmente con decimale/kWh).
 const lcdWide=region(canvas,.08,.22,.92,.58,1.6);
 const lcdMid=region(canvas,.12,.28,.88,.52,2.0);
 const lcdUpper=region(canvas,.08,.12,.92,.46,1.5);
 const [w1,w2]=await ocrLCD(lcdWide,'Display largo');
 const [m1,m2]=await ocrLCD(lcdMid,'Display centrale');
 const [u1,u2]=await ocrLCD(lcdUpper,'Display alto');
 const picked=pickReading([{text:w1.text,source:'lcd'},{text:w2.text,source:'lcd'},{text:m1.text,source:'lcd'},{text:m2.text,source:'lcd'},{text:u1.text,source:'lcd'},{text:u2.text,source:'lcd'},{text:full.text,source:'full'}]);
 const best=picked.best;
 $('#meterCode').value=meter?.code||'';$('#reading').value=best?.n||'';
 $('#meterHint').textContent=meter?`Riconosciuto: ${meter.code} · ${meter.family}${selected?' (selezionato)':''}`:'Contatore non identificato: selezionalo dall’elenco o inserisci il codice.';
 $('#raw').textContent=`--- FOTO COMPLETA ---\n${full.text}\n--- LCD LARGO A ---\n${w1.text}\n--- LCD LARGO B ---\n${w2.text}\n--- LCD CENTRALE A ---\n${m1.text}\n--- LCD CENTRALE B ---\n${m2.text}\n--- LCD ALTO A ---\n${u1.text}\n--- LCD ALTO B ---\n${u2.text}\n--- CANDIDATI ---\n${picked.candidates.map(x=>`${x.n} | score ${x.score} | ${x.source} | ${x.line}`).join('\n')||'nessuno'}`;
 $('#progress').textContent=best?'Analisi completata. Verifica la lettura prima di salvarla.':'Nessuna lettura affidabile.';
}catch(e){$('#progress').textContent='Errore OCR: '+e.message}finally{$('#analyze').disabled=false}};
function load(){return JSON.parse(localStorage.getItem(storeKey)||'[]')}function persist(x){localStorage.setItem(storeKey,JSON.stringify(x));render()}
$('#save').onclick=()=>{const code=$('#meterCode').value.trim().toUpperCase(),r=$('#reading').value.trim().replace(',','.');if(!code||!/^\d+(?:\.\d+)?$/.test(r)){alert('Controlla codice contatore e lettura kWh.');return}const a=load();a.unshift({id:crypto.randomUUID(),date:new Date().toISOString(),code,reading:r,notes:$('#notes').value.trim()});persist(a);$('#progress').textContent='Lettura salvata sul dispositivo.'};
$('#clear').onclick=()=>{$('#meterCode').value=$('#reading').value=$('#notes').value=$('#raw').textContent=$('#meterHint').textContent='';$('#knownMeter').value='';$('#progress').textContent=''};
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function render(){const a=load();$('#history').innerHTML=a.map(x=>`<tr><td>${new Date(x.date).toLocaleString('it-IT')}</td><td>${esc(x.code)}</td><td>${esc(x.reading)}</td><td>${esc(x.notes)}</td><td><button class="secondary" data-del="${x.id}">×</button></td></tr>`).join('')||'<tr><td colspan="5">Nessuna lettura</td></tr>';document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>persist(load().filter(x=>x.id!==b.dataset.del)))}
$('#csv').onclick=()=>{const a=load();if(!a.length)return alert('Nessun dato da esportare.');const rows=[['Data','Codice contatore','Lettura kWh','Note'],...a.map(x=>[new Date(x.date).toLocaleString('it-IT'),x.code,x.reading,x.notes])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n');const u=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})),ael=document.createElement('a');ael.href=u;ael.download='letture_contatori.csv';ael.click();URL.revokeObjectURL(u)};
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');render();
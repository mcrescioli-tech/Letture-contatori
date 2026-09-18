(()=>{
  const q=s=>document.querySelector(s),api=window.MeterProfiles;if(!api)return;
  const id=q('#meterId'),digits=q('#digitCount'),decimals=q('#decimalPlaces'),unit=q('#readingUnit'),reading=q('#reading'),analyze=q('#analyze'),confidence=q('#confidence'),progress=q('#progress');
  const badge=document.createElement('div');badge.id='meterProfile';badge.className='notice neutral';(q('#localModelStatus')||id).insertAdjacentElement('afterend',badge);
  function applyProfile(){const p=api.profile(id.value);badge.textContent=p.family==='unknown'?'Profilo display: generico. Seleziona manualmente la sola riga energia.':'Profilo display: '+p.label+' · '+p.digits+' cifre · '+p.decimals+' decimali · '+p.unit+'.';if(p.digits)digits.value=String(p.digits);if(p.decimals!==null)decimals.value=String(p.decimals);if(p.unit)unit.value=p.unit;return p}
  function check(){if(!id.value||!reading.value.trim())return;const r=api.validate(reading.value,id.value,unit.value);const target=q('#plausibility');if(!r.ok){target.textContent='Controllo profilo: '+r.reason+'. Verifica il display prima di salvare.';target.className='notice warning';confidence.textContent='Il candidato OCR non rispetta il formato noto di '+id.value+'.';confidence.className='notice warning'}else if(r.value!==reading.value.trim().replace(',','.')){reading.value=r.value;reading.dispatchEvent(new Event('input',{bubbles:true}));progress.textContent='Separatore decimale ricostruito dal profilo '+id.value+': '+r.value+' '+r.profile.unit+'.'}
  }
  id.addEventListener('change',applyProfile);reading.addEventListener('change',check);unit.addEventListener('change',check);
  if(analyze){const original=analyze.onclick;analyze.onclick=async function(e){applyProfile();await original?.call(this,e);check()}}
  const save=q('#saveReading');if(save){const original=save.onclick;save.onclick=function(e){const r=api.validate(reading.value,id.value,unit.value);if(id.value&&r.profile.family!=='unknown'&&!r.ok){alert('Lettura non salvata: '+r.reason+'. Controlla cifre, decimali e unità.');return}return original?.call(this,e)}}
  document.title='Letture contatori V8.3 TEST';const h=document.querySelector('h1 small');if(h)h.textContent='V8.3 TEST';const foot=q('.foot');if(foot)foot.textContent='V8.3 TEST · profili display derivati dal dataset · nessun merge in main.';applyProfile();
})();

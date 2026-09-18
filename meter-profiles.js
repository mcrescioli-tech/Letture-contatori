(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MeterProfiles=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const FAMILIES={
    nemo144:{label:'IME Nemo 144 · LCD 7 segmenti',strategy:'seven-segment',roi:{x:.12,y:.43,w:.76,h:.35}},
    nemoText:{label:'IME Nemo · LCD alfanumerico',strategy:'localized-text',roi:{x:.22,y:.28,w:.56,h:.42}},
    nemo96:{label:'IME Nemo 96 HD · riga energia',strategy:'energy-row',roi:{x:.12,y:.69,w:.70,h:.20}},
    nemoD4:{label:'IME Nemo D4-Le · riga energia',strategy:'energy-row',roi:{x:.12,y:.70,w:.70,h:.20}},
    vipd3:{label:'El Control VIPD3 · riga MWh inferiore',strategy:'bottom-mwh',roi:{x:.18,y:.54,w:.66,h:.25}},
    contoD4:{label:'IME Conto D4-Pt · riga unica',strategy:'single-row',roi:{x:.16,y:.28,w:.60,h:.35}},
    unknown:{label:'Profilo generico',strategy:'manual',roi:null}
  };
  const P={
    'QK7/1':['nemo144',8,2,'kWh'],'QK7/2':['nemo144',8,2,'kWh'],'QK7/3':['nemo144',8,2,'kWh'],
    'QL7/1':['nemo144',8,2,'kWh'],'QL7/2':['nemo144',8,2,'kWh'],'QL7/3':['nemo144',8,2,'kWh'],
    QKL1:['nemoText',7,1,'kWh'],QKL5:['nemoText',8,2,'kWh'],QKL8:['nemoText',7,1,'kWh'],
    QKL13:['nemo96',7,1,'kWh'],QKR1:['nemo96',8,0,'kWh'],QKR2:['nemo96',8,0,'kWh'],
    QCPA1:['vipd3',6,2,'MWh'],QCPA2:['vipd3',6,2,'MWh'],QCPA3:['nemoD4',5,1,'kWh'],
    QCPA4:['contoD4',8,1,'kWh'],QCPA5:['contoD4',8,1,'kWh']
  };
  function profile(id){const row=P[id];if(!row)return{id,family:'unknown',...FAMILIES.unknown,digits:null,decimals:null,unit:null};const [family,digits,decimals,unit]=row;return{id,family,...FAMILIES[family],digits,decimals,unit}}
  function normalize(raw,p){let s=String(raw??'').trim().replace(/\s/g,'').replace(',','.').replace(/[Oo]/g,'0');if(!/^\d+(?:\.\d+)?$/.test(s))return{ok:false,value:null,reason:'Formato non numerico'};let [a,b='']=s.split('.');if(!s.includes('.')&&p.decimals>0&&a.length===p.digits){b=a.slice(-p.decimals);a=a.slice(0,-p.decimals)}if(b.length!==p.decimals)return{ok:false,value:null,reason:'Attesi '+p.decimals+' decimali'};const total=a.length+b.length;if(p.digits&&total!==p.digits)return{ok:false,value:null,reason:'Attese '+p.digits+' cifre, trovate '+total};return{ok:true,value:p.decimals?a+'.'+b:a,reason:'Formato compatibile'}}
  function validate(raw,id,unit){const p=profile(id);if(p.family==='unknown')return{ok:true,value:String(raw??''),reason:'Nessun profilo specifico',profile:p};const n=normalize(raw,p);if(!n.ok)return{...n,profile:p};if(unit&&unit!==p.unit)return{ok:false,value:n.value,reason:'Unità attesa '+p.unit+', rilevata '+unit,profile:p};return{...n,profile:p}}
  return{FAMILIES,PROFILES:P,profile,normalize,validate};
});

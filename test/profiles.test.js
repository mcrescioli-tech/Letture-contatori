const assert=require('node:assert/strict');const p=require('../meter-profiles.js');
assert.deepEqual(p.validate('77634480','QK7/1','kWh').value,'776344.80');
assert.equal(p.validate('5213.99','QCPA1','MWh').ok,true);
assert.equal(p.validate('5213.99','QCPA1','kWh').ok,false);
assert.equal(p.validate('02997093','QKR1','kWh').ok,true);
assert.equal(p.validate('3956626.2','QCPA5','kWh').ok,true);
assert.equal(p.validate('0200539.5','QCPA4','kWh').ok,true);
console.log('profile tests: ok');

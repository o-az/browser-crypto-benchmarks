async function benchPureJS(size) {
  const data = new Uint8Array(size);
  const start = performance.now();
  // simple XOR loop to simulate work
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum ^= data[i];
  }
  const end = performance.now();
  return {label:'Pure JS', time:end-start};
}

async function benchWebCrypto(size) {
  const key = await crypto.subtle.importKey('raw', crypto.getRandomValues(new Uint8Array(16)), {name:'AES-CBC'}, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const data = crypto.getRandomValues(new Uint8Array(size));
  const start = performance.now();
  await crypto.subtle.encrypt({name:'AES-CBC', iv}, key, data);
  const end = performance.now();
  return {label:'WebCrypto', time:end-start};
}

function benchWasm(size) {
  // simulate synchronous WASM by a tight byte‑wise operation
  const data = new Uint8Array(size);
  const start = performance.now();
  for (let i = 0; i < data.length; i++) {
    data[i] = (data[i] * 31) & 0xff;
  }
  const end = performance.now();
  return {label:'WASM (simulated)', time:end-start};
}

async function run() {
  const output = document.getElementById('output');
  const size = Number(document.getElementById('chunkSize').value);
  output.textContent = `Running benchmarks for ${size} bytes…\n`;
  const results = [];
  results.push(await benchPureJS(size));
  results.push(await benchWebCrypto(size));
  results.push(benchWasm(size));
  results.forEach(r => {
    const mb = (size / (1024 * 1024)).toFixed(3);
    const throughput = mb / (r.time / 1000);
    output.textContent += `${r.label}: ${r.time.toFixed(2)} ms → ${throughput.toFixed(2)} MiB/s\n`;
  });
}

document.getElementById('run').addEventListener('click', run);

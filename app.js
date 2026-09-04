// Dữ liệu nạp động từ data_ready.xlsx qua xlsx-loader.js
var DATA, META; // nạp động từ data_ready.xlsx qua xlsx-loader.js


// Giá trị thô của 4 tiêu chí WSM (chưa chuẩn hóa)
function sizeRaw(d){ return d.carat / (d.price/1e6); }                             // Size: carat trên mỗi triệu VNĐ
function finRaw(d){  return d.resale; }                                            // Finance: tỷ lệ giữ giá, độc lập giá bán
function cutScore(d){ return CUT_SCORE[d.cutCode] ?? 0.7; }
function certScore(d){ return CERT_SCORE[d.certCode] ?? 0.7; }
function envScore(origin){ return origin==='lgd' ? 0.85 : 0.15; }                  // Environment: LGD tránh khai mỏ

function normalize(values){
  const mn = Math.min(...values), mx = Math.max(...values);
  return mx > mn ? (value => (value-mn)/(mx-mn)) : (() => 0.5);
}

const fmtVND = n => new Intl.NumberFormat('vi-VN').format(Math.round(n));
const fmtTrieu = n => (n/1e6 >= 1000) ? (n/1e9).toFixed(2)+' tỷ' : (n/1e6).toFixed(1)+' tr';

// Tỷ lệ giữ giá trung bình (%) theo nguồn gốc — suy từ cột resale_rate trong data
function resalePct(origin){
  if (typeof DATA === 'undefined' || !DATA) return 0;
  const list = DATA.filter(d => d.origin === origin && d.resale != null);
  return list.length ? Math.round(list.reduce((s,d) => s + d.resale, 0) / list.length * 100) : 0;
}

const el = id => document.getElementById(id);
const $budget=el('budget'), $budgetInput=el('budgetInput'), $minCarat=el('minCarat'), $minCaratInput=el('minCaratInput'), $wSize=el('wSize'), $wFin=el('wFin'), $wQual=el('wQual'), $wEnv=el('wEnv'),
      $minColor=el('minColor'), $minClarity=el('minClarity'), $ecoPreferred=el('ecoPreferred');

let purpose = PURPOSE.WEDDING;

el('purposeSeg').addEventListener('click', e=>{
  const btn = e.target.closest('button'); if(!btn) return;
  [...el('purposeSeg').children].forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  purpose = btn.dataset.p;
  const [s,f,q,en] = PRESETS[purpose];
  $wSize.value=s; $wFin.value=f; $wQual.value=q; $wEnv.value=en;
  render();
});

function syncPairedInput(slider, numberInput){
  return () => {
    const value = Number(slider.value);
    if (Number.isFinite(value)) {
      numberInput.value = value;
      render();
    }
  };
}

function applyNumberInput(numberInput, slider){
  const value = Number(numberInput.value);
  if (!Number.isFinite(value)) return;
  const boundedValue = Math.min(Math.max(value, +slider.min), +slider.max);
  slider.value = boundedValue;
  numberInput.value = boundedValue;
  render();
}

function previewNumberInput(numberInput, slider){
  const value = Number(numberInput.value);
  if (!Number.isFinite(value) || value < +slider.min || value > +slider.max) return;
  slider.value = value;
  render();
}

[$wSize,$wFin,$wQual,$wEnv,$minColor,$minClarity,$ecoPreferred].forEach(i=>i.addEventListener('input', render));
$budget.addEventListener('input', syncPairedInput($budget, $budgetInput));
$budgetInput.addEventListener('input', () => previewNumberInput($budgetInput, $budget));
$budgetInput.addEventListener('change', () => applyNumberInput($budgetInput, $budget));
$minCarat.addEventListener('input', syncPairedInput($minCarat, $minCaratInput));
$minCaratInput.addEventListener('input', () => previewNumberInput($minCaratInput, $minCarat));
$minCaratInput.addEventListener('change', () => applyNumberInput($minCaratInput, $minCarat));

function compute(){
  const budget = +$budget.value;
  const minCarat = +$minCarat.value;
  const ecoPreferred = $ecoPreferred.checked;
  const finalWeights = applyEcoBlend(
    [+$wSize.value, +$wFin.value, +$wQual.value, +$wEnv.value],
    ecoPreferred
  );
  w1 = finalWeights[0]; w2 = finalWeights[1]; w3 = finalWeights[2]; w4 = finalWeights[3];

  // ===== BƯỚC 1 · HARD FILTER (lọc cứng) =====
  // Loại bỏ viên vượt ngân sách, nhỏ hơn carat tối thiểu, hoặc không đạt chuẩn màu / độ trong.
  const minColorCode   = COLOR_CODE[$minColor.value]   ?? 0;
  const minClarityCode = CLARITY_CODE[$minClarity.value] ?? 0;
  const filtered = DATA.filter(d=>{
    if (d.price > budget || d.carat < minCarat) return false;
    if ((d.colorCode ?? 0) < minColorCode || (d.clarityCode ?? 0) < minClarityCode) return false;
    // R10 · sanity check: loại viên dữ liệu bất thường
    if (d.price === 0 || d.carat > RULES.R10_SANITY.maxCarat || d.price > RULES.R10_SANITY.maxPrice) return false;
    return true;
  });

  // ===== BƯỚC 2 · WEIGHTED SCORING MODEL (WSM) =====
  // Chuẩn hóa từng tiêu chí về [0,1] trên tập nền (tập ứng viên sau lọc;
  // dùng toàn bộ dữ liệu nếu không còn ứng viên).
  const base = filtered.length ? filtered : DATA;
  const sizeNorm = normalize(base.map(sizeRaw));
  const finNorm  = normalize(base.map(finRaw));
  const cutNorm  = normalize(base.map(cutScore));
  const certNorm = normalize(base.map(certScore));
  const envNorm  = normalize(base.map(d => envScore(d.origin)));

  const scored = filtered.map(d=>{
    const sSize = sizeNorm(sizeRaw(d));
    const sFin  = finNorm(finRaw(d));
    const sQual = (cutNorm(cutScore(d)) + certNorm(certScore(d))) / 2;
    const sEnv  = envNorm(envScore(d.origin));
    // Score = w1·Size + w2·Finance + w3·Quality + w4·Environment
    const score = w1*sSize + w2*sFin + w3*sQual + w4*sEnv;
    return {...d, sSize, sFin, sQual, sEnv, score};
  }).sort((a,b)=>b.score-a.score);

  // ===== BƯỚC 3 · RULE-BASED OVERRIDE (quy tắc chuyên gia) =====
  // Ngân sách < 30 triệu mà yêu cầu ≥ 1 carat: dữ liệu không có viên tự nhiên nào
  // thỏa mãn nên hệ thống tự kích hoạt ghi đè, buộc gợi ý LGD.
  const top5Raw = scored.slice(0, 8); // lấy nhiều hơn 5 để các rule còn dư địa sắp xếp lại

  // ===== BƯỚC 3 · RULE-BASED OVERRIDE =====
  const flags = [];
  let finalTop = top5Raw;

  // R1 · LGD bắt buộc khi ngân sách không đủ mua Natural ≥ minCarat
  const noNaturalAtThreshold = !DATA.some(d =>
    d.origin==='natural' && d.carat>=minCarat && d.price<=budget &&
    (d.certCode ?? 0) > 0
  );
  const r1Active = noNaturalAtThreshold;
  if (r1Active) {
    flags.push({ id:'R1', level:'override',
      msg:`Ngân sách ${fmtVND(budget)} đ với carat ≥ ${minCarat.toFixed(2)} ct không có kim cương Tự nhiên nào thỏa mãn — hệ thống ghi đè gợi ý sang LGD.` });
  }

  // R2 · cảnh báo ngân sách không thực tế
  const r2Active = budget < RULES.R2_UNREALISTIC_BUDGET.threshold && minCarat >= RULES.R2_UNREALISTIC_BUDGET.minCarat;
  if (r2Active) {
    flags.push({ id:'R2', level:'warn',
      msg:`Ngân sách dưới ${fmtVND(RULES.R2_UNREALISTIC_BUDGET.threshold)} đ với carat ≥ ${RULES.R2_UNREALISTIC_BUDGET.minCarat} ct là không thực tế kể cả với LGD. Kết quả hiển thị chỉ mang tính tham khảo.` });
  }

  // Áp R1: nếu kích hoạt, đẩy toàn bộ LGD lên trước Natural trong Top kết quả
  if (r1Active) {
    finalTop = [...finalTop].sort((a,b)=> (a.origin==='lgd'?0:1) - (b.origin==='lgd'?0:1));
  }

  // R4 · gắn nhãn "chưa xác minh" cho cert Không rõ (không loại khỏi Top)
  finalTop = finalTop.map(d => ({ ...d,
    flagUnverifiedCert: (d.certCode ?? 0) === 0,
    flagMissingCut: !d.cut,
  }));

  // R3 · nhãn "giá cao hơn mặt bằng chung"
  finalTop = finalTop.map(d => {
    const ppc = d.price / d.carat;
    const limit = d.origin === 'natural' ? RULES.R3_HIGH_PRICE_PER_CT.natural : RULES.R3_HIGH_PRICE_PER_CT.lgd;
    return { ...d, flagOverpriced: ppc > limit };
  });

  // R5 · ngân sách ≥ 100 triệu → lọc chỉ giữ GIA trong Top (nếu còn ứng viên GIA)
  const giaAvailable = finalTop.some(d => d.origin==='natural' && (d.certCode ?? 0) === 3);
  const r5Active = budget >= RULES.R5_PREMIUM_GIA.budget && giaAvailable;
  if (r5Active) {
    finalTop = finalTop.filter(d => (d.certCode ?? 0) === 3);
    flags.push({ id:'R5', level:'info',
      msg:'Phân khúc trên 100 triệu — hệ thống ưu tiên chứng nhận GIA theo chuẩn ngành.' });
  }

  // R6 · cảnh báo chất lượng thấp trên viên Top 1
  const top1 = finalTop[0];
  if (top1) {
    const lowColor = (top1.colorCode ?? 99) <= COLOR_CODE.K;
    const lowClarity = (top1.clarityCode ?? 99) <= CLARITY_CODE.SI2;
    if (lowColor || lowClarity) {
      flags.push({ id:'R6', level:'warn',
        msg:'Viên xếp hạng 1 có màu ≤ K hoặc độ trong ≤ SI2 — phù hợp nếu ưu tiên size lớn trên đồng tiền, nhưng kém sáng và dễ thấy tạp hơn.' });
    }
  }

  // R7 · mục đích "Tích lũy": ép Natural GIA lên Top 1 nếu có thể
  if (purpose === 'invest') {
    const bestNatGia = scored.find(d => d.origin==='natural' && (d.certCode ?? 0)===3);
    if (bestNatGia && finalTop[0] && finalTop[0].origin !== 'natural') {
      const exists = finalTop.findIndex(d => d.key === bestNatGia.key);
      if (exists !== -1 && exists !== 0) {
        [finalTop[0], finalTop[exists]] = [finalTop[exists], finalTop[0]];
      } else if (exists === -1) {
        finalTop.unshift({...bestNatGia});
        finalTop.pop();
      }
      flags.push({ id:'R7', level:'override',
        msg:`Mục đích Tích lũy / Đầu tư: hệ thống ưu tiên Kim cương Tự nhiên GIA vì khả năng giữ giá ${resalePct('natural')}% so với ~${resalePct('lgd')}% của LGD.` });
    }
  }

  // R8 · mục đích "Cưới": tránh Top 1 màu ≤ J nếu có lựa chọn sáng hơn
  if (purpose === 'wedding' && finalTop.length > 1) {
    const t1 = finalTop[0];
    if ((t1.colorCode ?? 99) <= COLOR_CODE.J) {
      const better = finalTop.slice(1).find(d => (d.colorCode ?? 0) > COLOR_CODE.J);
      if (better) {
        const idx = finalTop.indexOf(better);
        [finalTop[0], finalTop[idx]] = [finalTop[idx], finalTop[0]];
        flags.push({ id:'R8', level:'info',
          msg:'Mục đích Cưới / Diện: hệ thống ưu tiên viên có màu sáng hơn (≥ I) cho Top 1.' });
      }
    }
  }

  // R9 chỉ giải thích kết quả tương đương phi-môi trường. Thứ hạng đã do eco-blend quyết định.
  let ecoOverride = false;
  let ecoTop = finalTop;
  if (ecoPreferred && finalTop.length > 0) {
    const topCandidate = ecoTop[0];
    const naturalCandidates = ecoTop.slice(1).filter(candidate => candidate.origin === 'natural');

    if (topCandidate.origin === 'lgd' && naturalCandidates.length > 0) {
      const nearestNaturalGap = Math.min(...naturalCandidates.map(candidate =>
        Math.max(
          Math.abs(topCandidate.sSize - candidate.sSize),
          Math.abs(topCandidate.sFin - candidate.sFin),
          Math.abs(topCandidate.sQual - candidate.sQual)
        )
      ));

      if (nearestNaturalGap <= RULES.R9_MAX_CRITERION_GAP) {
        ecoOverride = true;
        flags.push({ id:'R9', level:'override',
          msg:'Đã ưu tiên kim cương nhân tạo vì tương đương chất lượng, thân thiện môi trường hơn.' });
      }
    }
  }

  finalTop = ecoTop.slice(0, 5);

  // Gắn key duy nhất cho từng viên (dùng khi swap)
  const withKeys = finalTop.map(d => ({
    ...d,
    key: `${d.store}|${d.shape}|${d.carat}|${d.price}|${d.link}`,
  }));

  return {
    budget, minCarat, filtered, scored, w1, w2, w3, w4,
    top5: withKeys,
    override: r1Active,
    ecoPreferred, ecoOverride,
    flags,
  };
}

function render(){
  const {budget, minCarat, filtered, top5, override, ecoPreferred, ecoOverride, flags} = compute();

  el('budgetVal').textContent = fmtVND(budget)+' đ';
  $budgetInput.value = budget;
  el('caratVal').textContent = (+$minCarat.value).toFixed(2)+' ct';
  $minCaratInput.value = +$minCarat.value;
  el('wSizeVal').textContent = '★'.repeat(+$wSize.value)+'☆'.repeat(5-+$wSize.value);
  el('wFinVal').textContent = '★'.repeat(+$wFin.value)+'☆'.repeat(5-+$wFin.value);
  el('wQualVal').textContent = '★'.repeat(+$wQual.value)+'☆'.repeat(5-+$wQual.value);
  el('wEnvVal').textContent = '★'.repeat(+$wEnv.value)+'☆'.repeat(5-+$wEnv.value);

  // Bước 3: hiển thị tất cả cờ quy tắc chuyên gia đã kích hoạt
  const flagEl = el('ruleFlag');
  const levelClass = { override:'rule-flag', warn:'rule-flag-warn', info:'rule-flag-info' };
  flagEl.innerHTML = flags.map(f =>
    `<span class="${levelClass[f.level] || 'rule-flag'}">[${f.id}] ${f.msg}</span>`
  ).join('');

  const ecoBanner = el('ecoBanner');
  ecoBanner.hidden = !(ecoPreferred && ecoOverride);

  const nat = filtered.filter(d=>d.origin==='natural');
  const lgd = filtered.filter(d=>d.origin==='lgd');

  // trade-off cards
  function cardBody(list, label){
    if(!list.length) return '<div class="empty-note">Không có lựa chọn phù hợp trong ngân sách / bộ lọc hiện tại.</div>';
    const best = list.reduce((a,b)=> b.carat>a.carat?b:a);
    const avgResale = list.reduce((s,d)=>s+d.resale,0)/list.length;
    return `
      <div class="stat-big">${best.carat.toFixed(2)} ct</div>
      <div class="stat-sub">Carat lớn nhất khả dụng trong ngân sách</div>
      <div class="kv"><span>Giá viên carat lớn nhất</span><span>${fmtVND(best.price)} đ</span></div>
      <div class="kv"><span>Giá trị thu hồi ước tính</span><span>${fmtVND(best.price*best.resale)} đ</span></div>
      <div class="kv"><span>Tỷ lệ giữ giá trung bình</span><span>${(avgResale*100).toFixed(0)}%</span></div>
      <div class="kv"><span>Số lựa chọn khớp</span><span>${list.length}</span></div>
    `;
  }
  el('natBody').innerHTML = cardBody(nat);
  el('lgdBody').innerHTML = cardBody(lgd);

  // verdict
  const verdictEl = el('verdict'), verdictText = el('verdictText');
  if(!filtered.length){
    verdictEl.textContent = 'Chưa có kết quả';
    verdictEl.className = 'banner-verdict';
    verdictText.textContent = 'Không có viên kim cương nào khớp với ngân sách và tiêu chí hiện tại. Hãy tăng ngân sách hoặc nới lỏng carat / màu / độ trong.';
  } else {
    const natCount = top5.filter(d=>d.origin==='natural').length;
    const lgdCount = top5.length - natCount;
    const leanLgd = lgdCount > natCount || override;
    if(leanLgd){
      verdictEl.textContent = 'Kim cương Nhân tạo (LGD)';
      verdictEl.className = 'banner-verdict lgd';
      verdictText.textContent = `Với mức ưu tiên và ngân sách hiện tại, LGD mang lại carat lớn hơn đáng kể trên cùng chi phí. Đánh đổi: khả năng giữ giá thấp hơn (~${resalePct('lgd')}% so với ${resalePct('natural')}%).`;
    } else {
      verdictEl.textContent = 'Kim cương Tự nhiên';
      verdictEl.className = 'banner-verdict natural';
      verdictText.textContent = 'Với mức ưu tiên và ngân sách hiện tại, kim cương Tự nhiên (chứng nhận GIA) là lựa chọn tối ưu nhờ khả năng giữ giá trị tài sản cao và tính thanh khoản tốt hơn.';
    }
  }

  // table
  const tbody = el('resultsBody');
  el('matchCount').textContent = filtered.length + ' viên khớp bộ lọc trong tổng số ' + DATA.length + ' · hiển thị 5 điểm cao nhất';
  if(!top5.length){
    tbody.innerHTML = '<tr><td colspan="12" class="no-results">Không tìm thấy kim cương phù hợp — hãy điều chỉnh bộ lọc bên trái.</td></tr>';
  } else {
    tbody.innerHTML = top5.map((d,i)=>`
      <tr>
        <td class="rank">${i+1}</td>
        <td>
          <span class="badge ${d.origin}">${d.origin==='natural'?'Tự nhiên':'LGD'}</span>
          ${d.flagUnverifiedCert ? '<span class="badge warn-mini" title="Chứng nhận không rõ nguồn gốc — cần kiểm tra thêm">chưa xác minh</span>' : ''}
          ${d.flagMissingCut ? '<span class="badge warn-mini" title="Chưa có đánh giá giác cắt trong dữ liệu">chưa có cut</span>' : ''}
          ${d.flagOverpriced ? '<span class="badge warn-mini" title="Giá trên mỗi carat cao hơn mặt bằng chung">giá cao</span>' : ''}
        </td>
        <td>${d.shape||'—'}</td>
        <td>${d.carat.toFixed(2)}</td>
        <td>${d.color||'—'}</td>
        <td>${d.clarity||'—'}</td>
        <td>${d.cut||'—'}</td>
        <td>${d.cert||'—'}</td>
        <td class="price-cell">${fmtVND(d.price)}</td>
        <td><span class="score-bar"><i style="width:${(d.score*100).toFixed(0)}%;background:${d.origin==='natural'?'var(--gold)':'var(--teal)'}"></i></span>${(d.score*100).toFixed(0)}</td>
        <td>${d.store}</td>
        <td><a class="link-btn" href="${d.link}" target="_blank" rel="noopener">Xem →</a></td>
      </tr>
    `).join('');
  }

  drawLoupe(filtered, top5, budget, minCarat);
}

function drawLoupe(filtered, top5, budget, minCarat){
  const svg = el('loupe');
  const W=1160,H=380, padL=54,padR=20,padT=16,padB=34;
  const plotW = W-padL-padR, plotH = H-padT-padB;

  // Trục suy từ khoảng giá trị thực tế của dữ liệu (không hardcode)
  const prices = DATA.map(d=>d.price).filter(p=>p>0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1;
  const maxCarat = Math.max(1, Math.ceil(Math.max(...DATA.map(d=>d.carat || 0))));
  const minPriceLog = Math.log10(minPrice || 1);
  const maxPriceLog = maxPrice > minPrice ? Math.log10(maxPrice) : minPriceLog + 1;

  const x = c => padL + (c/maxCarat)*plotW;
  const y = p => padT + plotH - ((Math.log10(Math.max(p,minPrice))-minPriceLog)/(maxPriceLog-minPriceLog))*plotH;

  const filteredIds = new Set(filtered.map(d=>d.link+d.carat+d.price+d.store));
  const top5Ids = new Set(top5.map(d=>d.link+d.carat+d.price+d.store));

  let gridLines = '';
  // Gridline trục carat: sinh theo bước đẹp trong khoảng carat của dữ liệu
  const caratStep = maxCarat <= 2 ? 0.25 : maxCarat <= 5 ? 0.5 : 1;
  for (let c = 0; c <= maxCarat + 1e-9; c += caratStep) {
    const cc = Math.round(c*100)/100;
    gridLines += `<line x1="${x(cc)}" y1="${padT}" x2="${x(cc)}" y2="${padT+plotH}" stroke="#1D2129" stroke-width="1"/>`;
    gridLines += `<text x="${x(cc)}" y="${H-12}" fill="#5B626D" font-size="10" font-family="IBM Plex Mono" text-anchor="middle">${cc}ct</text>`;
  }
  // Gridline trục giá: các mốc "đẹp" (1-2-3-5 × 10ⁿ) nằm trong khoảng giá dữ liệu
  const priceTicks = [];
  for (let exp = Math.floor(minPriceLog); exp <= Math.ceil(maxPriceLog); exp++) {
    [1,2,3,5].forEach(m => { const t = m * Math.pow(10, exp); if (t >= minPrice && t <= maxPrice) priceTicks.push(t); });
  }
  priceTicks.forEach(p=>{
    const yy = y(p);
    gridLines += `<line x1="${padL}" y1="${yy}" x2="${W-padR}" y2="${yy}" stroke="#1D2129" stroke-width="1"/>`;
    gridLines += `<text x="${padL-8}" y="${yy+3}" fill="#5B626D" font-size="10" font-family="IBM Plex Mono" text-anchor="end">${fmtTrieu(p)}</text>`;
  });

  const budgetY = y(Math.min(budget, maxPrice));
  const budgetLine = `<line x1="${padL}" y1="${budgetY}" x2="${W-padR}" y2="${budgetY}" stroke="#E8664A" stroke-width="1.3" stroke-dasharray="4 4"/>`;
  const caratX = x(Math.min(minCarat,maxCarat));
  const caratLine = minCarat>0 ? `<line x1="${caratX}" y1="${padT}" x2="${caratX}" y2="${padT+plotH}" stroke="#E8664A" stroke-width="1" stroke-dasharray="2 3" opacity="0.5"/>` : '';

  let points = '';
  DATA.forEach(d=>{
    const key = d.link+d.carat+d.price+d.store;
    const inFilter = filteredIds.has(key);
    const inTop5 = top5Ids.has(key);
    const cx = x(Math.min(d.carat,maxCarat)), cy = y(d.price);
    const color = d.origin==='natural' ? '#C9A24B' : '#4FD1C5';
    const opacity = inFilter ? 0.85 : 0.12;
    const r = inTop5 ? 6 : 3;
    const stroke = inTop5 ? 'stroke="#E9ECEF" stroke-width="1.5"' : '';
    points += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="${opacity}" ${inTop5?stroke:''}/>`;
  });

  svg.innerHTML = gridLines + budgetLine + caratLine + points;
}

// Sinh option cho dropdown Màu / Độ trong từ các grade thực có trong dữ liệu
function populateGradeSelect(sel, grades, prefix, everySuffix, defaults){
  if (!grades || !grades.length) return;
  const prev = sel.value;
  const lowest = grades[grades.length - 1].grade;
  sel.innerHTML = grades.map((g, i) => {
    const label = (i === grades.length - 1) ? `${prefix}${lowest}${everySuffix}` : `${prefix}${g.grade}`;
    return `<option value="${g.grade}">${label}</option>`;
  }).join('');
  const chosen = [prev, ...defaults].find(v => grades.some(g => g.grade === v));
  sel.value = chosen || lowest;
}

function populateGradeSelects(){
  populateGradeSelect($minColor, META.colorGrades, 'D–', ' (mọi màu)', ['F']);
  populateGradeSelect($minClarity, META.clarityGrades, 'FL–', ' (mọi loại)', ['VS2']);
}

// Danh sách nguồn dữ liệu ở footer suy từ cột store trong data
function updateFooterSources(){
  const footerEl = el('dataSource');
  if (footerEl && META.storeList && META.storeList.length) {
    footerEl.textContent = 'Nguồn dữ liệu: ' + META.storeList.join(' · ');
  }
}

// Áp dụng khoảng giá trị + option + footer suy từ DATA/META lên các control
function applyDataToControls(){
  // ==== Khoảng slider ngân sách: suy từ min/max giá trong dữ liệu ====
  const bMin = Math.floor(META.minPrice / 1e6) * 1e6;
  const bMax = Math.ceil(META.maxPrice);
  $budget.min = bMin; $budget.max = bMax;
  $budgetInput.min = bMin; $budgetInput.max = bMax;
  $budget.value = Math.min(Math.max(+$budget.value, bMin), bMax);
  $budgetInput.value = $budget.value;
  el('budgetVal').textContent = fmtVND(+$budget.value) + ' đ';

  // ==== Khoảng slider carat: suy từ min/max carat trong dữ liệu ====
  const cMin = Math.floor((META.minCarat || 0) * 100) / 100;
  const cMax = Math.ceil((META.maxCarat || 1) * 100) / 100;
  $minCarat.min = cMin; $minCarat.max = cMax;
  $minCaratInput.min = cMin; $minCaratInput.max = cMax;
  $minCarat.step = '0.01';
  $minCarat.value = Math.min(Math.max(+$minCarat.value, cMin), cMax);
  $minCaratInput.value = $minCarat.value;
  el('caratVal').textContent = (+$minCarat.value).toFixed(2) + ' ct';

  populateGradeSelects();
  updateFooterSources();
}

if (typeof DATA === 'undefined') {
  loadDiamondData('data_ready.xlsx').then(()=>{
    applyDataToControls();
    updateMasthead();
    render();
  });
} else {
  applyDataToControls();
  updateMasthead();
  render();
}

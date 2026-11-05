/* Reserva direta (24/10/2026, fase 1): calendário com as noites livres e o preço direto (10% abaixo do Airbnb), e o
   pedido pelo WhatsApp. Lê reserva/disponibilidade.json, montado pelo computador (programa/reserva-direta-site.js).
   Nada é cobrado aqui: a reserva só vale depois da confirmação pelo WhatsApp, e o Pix vai direto ao proprietário.
   Uso na página: <div class="rd" data-rd="1303,1304" data-root="../../"></div>
   02/11/2026: Clube Notte (15% no total, menos nas noites de réveillon e carnaval; o hóspede marca e a confirmação confere
   na lista), pessoa extra no New Time (R$ 50) e no ILOA (R$ 40), 1 bebê grátis no New Time e no ILOA, regras de data do
   réveillon e do carnaval (mesma conta do programa/reserva-direta-site.js). */
(function () {
  var WA = 'https://wa.me/5582996196123?text=';
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var SEM = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function deIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function mais(s, n) { var d = deIso(s); d.setDate(d.getDate() + n); return iso(d); }
  function curta(s) { var p = s.split('-'); return p[2] + '/' + p[1]; }
  function reais(v) { return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function montar(caixa, dados) {
    // 27/10/2026: unidade sem nenhuma noite com preço (1302 antes da escada de preço, calendário que falhou) não ganha aba
    var ids = caixa.getAttribute('data-rd').split(',').filter(function (id) { return dados.imoveis[id] && Object.keys(dados.imoveis[id].noites || {}).length; });
    if (!ids.length) { caixa.hidden = true; return; }
    caixa.hidden = false;
    var st = { id: ids[0], ent: null, sai: null, pessoas: 2, bebe: 0, clube: false, mes: null };
    var DT = dados.datas || null;

    caixa.innerHTML = '';
    var topo = el('div', 'rd-topo');
    topo.appendChild(el('span', 'eyebrow', 'Reserva direta'));
    topo.appendChild(el('h3', 'rd-titulo', 'Reserve direto e pague ' + dados.desconto + '% menos'));
    topo.appendChild(el('p', 'rd-lede', 'Mesmo imóvel e mesmo cuidado, sem a taxa das plataformas. Escolha as datas, e a gente confirma pelo WhatsApp.' +
      (dados.descontoClube ? ' Quem é do Clube Notte paga ' + dados.descontoClube + '% menos em reservas de 2 noites ou mais.' : '')));
    caixa.appendChild(topo);

    var unidades = el('div', 'rd-unidades');
    if (ids.length > 1) {
      unidades.setAttribute('role', 'group'); unidades.setAttribute('aria-label', 'Unidade');
      // 05/11/2026: calendário único da página geral (prédios misturados) mostra o prédio embaixo do nome
      var variosPredios = ids.some(function (id) { return dados.imoveis[id].predio !== dados.imoveis[ids[0]].predio; });
      ids.forEach(function (id) {
        var b = el('button', 'rd-un', dados.imoveis[id].nome); b.type = 'button'; b.setAttribute('data-id', id);
        if (variosPredios && dados.imoveis[id].predio) b.appendChild(el('small', 'rd-un-predio', dados.imoveis[id].predio));
        b.addEventListener('click', function () { st.id = id; st.ent = st.sai = null; st.mes = null; desenhar(); });
        unidades.appendChild(b);
      });
      caixa.appendChild(unidades);
    }

    var cal = el('div', 'rd-cal');
    var cab = el('div', 'rd-cab');
    var ant = el('button', 'rd-nav', '‹'); ant.type = 'button'; ant.setAttribute('aria-label', 'Mês anterior');
    var prox = el('button', 'rd-nav', '›'); prox.type = 'button'; prox.setAttribute('aria-label', 'Próximo mês');
    var nomeMes = el('b', 'rd-mes'); nomeMes.setAttribute('aria-live', 'polite');
    cab.appendChild(ant); cab.appendChild(nomeMes); cab.appendChild(prox);
    cal.appendChild(cab);
    var grade = el('div', 'rd-grade');
    cal.appendChild(grade);
    var dica = el('p', 'rd-dica');
    cal.appendChild(dica);
    caixa.appendChild(cal);

    var form = el('div', 'rd-form');
    var lp = el('label', 'rd-campo'); lp.appendChild(el('span', null, 'Hóspedes'));
    var selP = el('select'); lp.appendChild(selP); form.appendChild(lp);
    var lb = el('label', 'rd-campo'); lb.appendChild(el('span', null, 'Bebê (até 2 anos)'));
    var selB = el('select'); selB.innerHTML = '<option value="0">Sem bebê</option><option value="1">1 bebê, grátis</option>';
    lb.appendChild(selB); form.appendChild(lb);
    var ln = el('label', 'rd-campo'); ln.appendChild(el('span', null, 'Seu nome'));
    var inN = el('input'); inN.type = 'text'; inN.maxLength = 60; inN.autocomplete = 'name'; ln.appendChild(inN); form.appendChild(ln);
    caixa.appendChild(form);
    var lc = el('label', 'rd-clube');
    var inC = el('input'); inC.type = 'checkbox'; lc.appendChild(inC);
    var tc = el('span'); tc.appendChild(el('b', null, 'Sou do Clube Notte')); tc.appendChild(document.createTextNode(' · ' + (dados.descontoClube || 15) + '% menos no total, em reservas de 2 noites ou mais (fora do réveillon e do carnaval). A gente confere na confirmação.'));
    lc.appendChild(tc);
    if (dados.descontoClube) caixa.appendChild(lc);
    var regras = el('p', 'rd-regra'); regras.hidden = true; caixa.appendChild(regras);

    var resumo = el('div', 'rd-resumo'); resumo.setAttribute('aria-live', 'polite');
    caixa.appendChild(resumo);
    var btn = el('a', 'btn sun block rd-pedir'); btn.target = '_blank'; btn.rel = 'noopener';
    caixa.appendChild(btn);
    var nota = el('p', 'rd-nota', 'A reserva só vale depois da nossa confirmação pelo WhatsApp. O pagamento é por Pix, direto na conta do proprietário do imóvel, e você recebe o contrato de locação por temporada. Preços atualizados em ' + curta(dados.hoje) + '; podem mudar até a confirmação.');
    caixa.appendChild(nota);

    ant.addEventListener('click', function () { st.mes = mesDe(st.mes, -1); desenhar(); });
    prox.addEventListener('click', function () { st.mes = mesDe(st.mes, 1); desenhar(); });
    selP.addEventListener('change', function () { st.pessoas = +selP.value; desenharResumo(); });
    selB.addEventListener('change', function () { st.bebe = +selB.value; desenharResumo(); });
    inC.addEventListener('change', function () { st.clube = inC.checked; desenhar(); });
    inN.addEventListener('input', desenharResumo);

    function im() { return dados.imoveis[st.id]; }
    function livres() { return Object.keys(im().noites); }
    function mesDe(m, n) { var d = deIso(m + '-01'); d.setMonth(d.getMonth() + n); return iso(d).slice(0, 7); }
    function livre(n) { return im().noites[n] != null; }
    // 05/11/2026, ordem dele: Clube só em reserva de 2 noites ou mais (às vezes abrimos exceção de 1 noite: aí vale o desconto normal)
    function noitesEscolhidas() { var k = 0; if (st.ent && st.sai) for (var x = st.ent; x < st.sai; x = mais(x, 1)) k++; return k; }
    function clubeVale() { return st.clube && !(st.ent && st.sai && noitesEscolhidas() < 2); }
    function preco(n) { var c = clubeVale() && im().clube; return c && c[n] != null ? c[n] : im().noites[n]; }
    // réveillon e carnaval (mesma regra do programa): devolve o motivo do bloqueio ou null
    // 05/11/2026: com as regras do Airbnb do imóvel (noites mínimas de quem chega no dia e dias sem chegada), valem só elas
    function rg() { return im().regras || null; }
    function minEntrada(s) { var r = rg(); return Math.max(im().minimoNoites, (r && r.min[s]) || 0); }
    function regraDatas(ent, sai) {
      var r = rg();
      if (r) {
        var k = 0; for (var x = ent; x < sai; x = mais(x, 1)) k++;
        if (r.semChegada.indexOf(ent) > -1) return 'Não há chegada em ' + curta(ent) + '.';
        if (k < (r.min[ent] || 0)) return 'Chegando em ' + curta(ent) + ', o mínimo é de ' + r.min[ent] + ' noites.';
        return null;
      }
      if (!DT) return null;
      var R = DT.reveillon, C = DT.carnaval, n = 0, temR = false, temC = false;
      for (var d = ent; d < sai; d = mais(d, 1)) { n++; if (d === R.noite) temR = true; if (d >= C.de && d <= C.ate) temC = true; }
      if (temR && ent > R.chegarAte) return 'Para o réveillon, a chegada é até ' + curta(R.chegarAte) + '.';
      if (temC && n < C.minimo) return 'No carnaval, a estadia mínima é de ' + C.minimo + ' noites.';
      return null;
    }
    // chegada em 01/01 só quando a noite de 31/12 já foi vendida
    function entradaOk(s) {
      if (!livre(s)) return false;
      if (rg()) return rg().semChegada.indexOf(s) < 0;
      return !(DT && s === DT.reveillon.primeiroDia && livre(DT.reveillon.noite));
    }
    // dia pode ser a SAÍDA se todas as noites desde a entrada estão livres e a estadia respeita mínimo, máximo e as datas especiais
    function saidaOk(s) {
      if (!st.ent || s <= st.ent) return false;
      var n = 0;
      for (var d = st.ent; d < s; d = mais(d, 1)) { if (!livre(d)) return false; n++; }
      return n >= im().minimoNoites && n <= im().maximoNoites && !regraDatas(st.ent, s);
    }
    function total() {
      var t = 0, base = 0, n = 0;
      for (var d = st.ent; d < st.sai; d = mais(d, 1)) { t += preco(d); base += im().noites[d]; n++; }
      var ex = im().extra, extra = 0;
      if (ex && st.pessoas > ex.acimaDe) extra = (st.pessoas - ex.acimaDe) * ex.porNoite * n;
      return { noites: n, diarias: t, clube: base - t, extra: extra, total: t + extra };
    }

    function desenhar() {
      var L = livres();
      if (!st.mes) st.mes = (L[0] || dados.hoje).slice(0, 7);
      var primeiro = (L[0] || dados.hoje).slice(0, 7), ultimo = (L[L.length - 1] || dados.hoje).slice(0, 7);
      Array.prototype.forEach.call(unidades.children, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-id') === st.id ? 'true' : 'false'); });
      ant.disabled = st.mes <= primeiro; prox.disabled = st.mes >= ultimo;
      var p = st.mes.split('-');
      var nm = MESES[+p[1] - 1];
      nomeMes.textContent = nm.charAt(0).toUpperCase() + nm.slice(1) + ' de ' + p[0];

      selP.innerHTML = '';
      for (var i = 1; i <= im().capacidade; i++) { var o = el('option', null, i + (i === 1 ? ' pessoa' : ' pessoas')); o.value = i; selP.appendChild(o); }
      if (st.pessoas > im().capacidade) st.pessoas = im().capacidade;
      selP.value = st.pessoas;
      lb.hidden = !im().bebe; if (!im().bebe) st.bebe = 0; selB.value = st.bebe;

      grade.innerHTML = '';
      SEM.forEach(function (s) { grade.appendChild(el('span', 'rd-sem', s)); });
      var d0 = deIso(st.mes + '-01');
      for (var k = 0; k < d0.getDay(); k++) grade.appendChild(el('span', 'rd-vazio'));
      for (var d = new Date(d0); d.getMonth() === d0.getMonth(); d.setDate(d.getDate() + 1)) {
        var s = iso(d), pr = livre(s) ? preco(s) : null;
        var b = el('button', 'rd-dia'); b.type = 'button'; b.setAttribute('data-d', s);
        b.appendChild(el('b', null, String(d.getDate())));
        if (pr != null) b.appendChild(el('small', null, Math.round(pr)));
        var podeEntrar = entradaOk(s), podeSair = st.ent && !st.sai && saidaOk(s);
        if (st.ent && !st.sai) b.disabled = !(podeSair || podeEntrar);
        else b.disabled = !podeEntrar;
        if (pr == null) b.classList.add('ocupado');
        if (s === st.ent) b.classList.add('ent');
        if (s === st.sai) b.classList.add('sai');
        if (st.ent && st.sai && s > st.ent && s < st.sai) b.classList.add('meio');
        if (podeSair) b.classList.add('pode-sair');
        b.setAttribute('aria-label', d.getDate() + ' de ' + MESES[d.getMonth()] + (pr != null ? ', ' + reais(pr) + ' a noite' : ', indisponível'));
        b.addEventListener('click', clicar);
        grade.appendChild(b);
      }
      dica.textContent = !st.ent ? 'Toque no dia da chegada.' : !st.sai ? 'Agora toque no dia da saída (mínimo de ' + minEntrada(st.ent) + ' noites).' : 'Toque em outro dia para recomeçar.';
      // aviso das datas especiais quando a chegada escolhida cai perto delas (só sem as regras do Airbnb)
      var aviso = '';
      if (DT && !rg() && st.ent && !st.sai) {
        var R = DT.reveillon, C = DT.carnaval;
        if (st.ent <= R.noite && st.ent > R.chegarAte && mais(st.ent, 30) > R.noite) aviso = 'Réveillon: para passar a virada, a chegada é até ' + curta(R.chegarAte) + '.';
        else if (st.ent <= C.ate && mais(st.ent, 30) > C.de) aviso = 'Carnaval (' + curta(C.de) + ' a ' + curta(mais(C.ate, 1)) + '): estadia mínima de ' + C.minimo + ' noites.';
      }
      dica.textContent += aviso ? ' ' + aviso : '';
      desenharResumo();
    }

    function clicar(ev) {
      var s = ev.currentTarget.getAttribute('data-d');
      if (st.ent && !st.sai && saidaOk(s)) st.sai = s;
      else { st.ent = entradaOk(s) ? s : null; st.sai = null; }
      desenhar();
    }

    function desenharResumo() {
      resumo.innerHTML = '';
      regras.textContent = im().aviso || ''; regras.hidden = !im().aviso;
      if (!st.ent || !st.sai) {
        resumo.appendChild(el('p', 'rd-vaz', 'Escolha a chegada e a saída para ver o valor.'));
        btn.setAttribute('aria-disabled', 'true'); btn.classList.add('off'); btn.removeAttribute('href');
        btn.textContent = 'Pedir reserva pelo WhatsApp';
        return;
      }
      var t = total(), i = im();
      var l1 = el('p', 'rd-linha'); l1.appendChild(el('span', null, i.nome + ' · ' + curta(st.ent) + ' a ' + curta(st.sai) + ' · ' + t.noites + ' noites'));
      resumo.appendChild(l1);
      function linha(txt, val) { var p = el('p', 'rd-linha'); p.appendChild(el('span', null, txt)); if (val != null) p.appendChild(el('span', null, val)); resumo.appendChild(p); }
      if (t.extra || t.clube) {
        linha('Diárias com ' + dados.desconto + '% de desconto', reais(t.diarias + t.clube));
        if (t.clube) linha('Clube Notte (mais ' + (dados.descontoClube - dados.desconto) + '%)', '− ' + reais(t.clube));
        if (t.extra) { var ex = im().extra; linha('Pessoa extra: ' + (st.pessoas - ex.acimaDe) + ' × R$ ' + ex.porNoite + ' × ' + t.noites + ' noites', '+ ' + reais(t.extra)); }
      }
      if (st.clube && !t.clube) linha(t.noites < 2 ? 'O desconto do Clube vale em reservas de 2 noites ou mais; nesta vale o desconto normal de ' + dados.desconto + '%.'
        : 'Nas noites de réveillon e carnaval vale o desconto normal de ' + dados.desconto + '%.');
      if (st.bebe) linha('1 bebê, sem custo');
      var lt = el('p', 'rd-total'); lt.appendChild(el('span', null, 'Total direto')); lt.appendChild(el('b', null, reais(t.total))); resumo.appendChild(lt);
      var nome = (inN.value || '').trim();
      var marcas = (st.clube ? 'C' : '') + (st.bebe ? 'B' : '');
      var msg = 'Olá! Quero reservar direto pelo site da Notte.\n' +
        '• ' + i.nome + ' (' + i.predio + ')\n' +
        '• Chegada ' + curta(st.ent) + ' (a partir das ' + i.entrada.replace(':00', 'h') + '), saída ' + curta(st.sai) + ' (até as ' + i.saida.replace(':00', 'h') + ')\n' +
        '• ' + t.noites + ' noites, ' + st.pessoas + (st.pessoas === 1 ? ' pessoa' : ' pessoas') + (st.bebe ? ' + 1 bebê' : '') + '\n' +
        (st.clube ? (clubeVale() ? '• Sou do Clube Notte (' + dados.descontoClube + '%)\n' : '• Sou do Clube Notte (1 noite: desconto normal)\n') : '') +
        '• Valor do site: ' + reais(t.total) + '\n' +
        (nome ? '• Nome: ' + nome + '\n' : '') +
        '[' + st.id + '|' + st.ent + '|' + st.sai + '|' + st.pessoas + '|' + Math.round(t.total) + (marcas ? '|' + marcas : '') + ']';
      btn.href = WA + encodeURIComponent(msg);
      btn.removeAttribute('aria-disabled'); btn.classList.remove('off');
      btn.textContent = 'Pedir reserva pelo WhatsApp';
    }
    btn.addEventListener('click', function (ev) {
      if (!btn.getAttribute('href')) { ev.preventDefault(); return; }
      if (window.va) window.va('event', { name: 'reserva-direta-pedido', data: { imovel: st.id } });
    });

    desenhar();
  }

  var caixas = document.querySelectorAll('.rd[data-rd]');
  if (!caixas.length || !window.fetch) return;
  var raiz = caixas[0].getAttribute('data-root') || './';
  // 28/10/2026: uso pessoal marcado no painel fecha a noite aqui na hora (api/cal.js lê do Google); se falhar, segue sem
  var usos = fetch('/api/cal/?bloqueios=1').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  fetch(raiz + 'reserva/disponibilidade.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      return usos.then(function (u) {
        (u && u.bloqueios || []).forEach(function (b) {
          var im = d.imoveis && (d.imoveis[b.imovel] || d.imoveis[String(b.imovel).toUpperCase()]);
          if (!im || !im.noites) return;
          for (var n in im.noites) if (n >= b.entrada && n < b.saida) delete im.noites[n];
        });
        return d;
      });
    })
    .then(function (d) { Array.prototype.forEach.call(caixas, function (c) { montar(c, d); }); })
    .catch(function () { Array.prototype.forEach.call(caixas, function (c) { c.hidden = true; }); });
})();

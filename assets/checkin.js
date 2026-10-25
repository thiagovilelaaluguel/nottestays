/* Notte Stays · pré-check-in (15/10/2026)
 * Os dados pessoais (nomes, documentos, placa, hora, observação) são cifrados AQUI, no celular do hóspede,
 * com a chave pública da Notte (RSA-OAEP 3072 + AES-GCM 256). Só o computador do painel tem a chave privada.
 * O destino (planilha Google privada) recebe só o texto cifrado + imóvel, data de chegada, número da reserva
 * e plataforma, que vão "colados" à cifra (dado adicional do AES-GCM): trocar um deles invalida a resposta.
 * Endereço: /checkin/?i=807  (opcionais: &r=<número da reserva> &d=AAAA-MM-DD &p=Booking|Airbnb &lang=en)
 */
(function () {
  'use strict';

  // Endereço do recebedor (Apps Script "exec"). Preenchido na ativação. Vazio = página avisa e não envia.
  var DESTINO = 'https://script.google.com/macros/s/AKfycbwyM7rSBp7wrwce7NJymwL8S4BFSQBP7mJUC7qrIJ0sqGyXMmckYXpfdU0skimfp-P2/exec';
  var CHAVE_PUBLICA = 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAqrAdXeAvMwxTTYPi0Mb2Mk45ZkHlb40Q8VvQ7p3AsUnu2z9rqSxrA0sPK+w9GOt9sv6kc2sDIFxh35SJVdiNElNgdndzOxfmtarTrwBdzMKFlasuVL5gQKWyzLQmJwkTVaGXeYSnDgJzWMXN53KQO70WmQvKPn/Xgg4uZdqCfdniVxYrWt8HqqQfME/G3LtnxMVNMWSKIB6x8oFbR0y0hKF9GANhC0H2Z71vnIGU5X6H3S3WM2SgdpT3+1KxdEh4s3Yv1OqL9SJbGhH/sH9kTKL524wlHY/Vype9/zsiDbVuSpSoGOThCHyeFk8amDQ0LGVKnxaSmYNDDbluGN3TB2Vz2hN5HSNn08dO+f3wzE8ZeIfAFKkmTHGnn6k+dxdVlu7TtmI+L/L+vZICMJdL3xou63aH3qyB3ZBCppSwTmSzbcJP6clSf0XzXxxlMvZ0a8b/IU19smvxX7xcGcxwmesBO9yEucjwUZQZl14fTJv/ggNQlXDQhCBEDq8HNtT/AgMBAAE=';

  var IMOVEIS = {
    '1302': { nome: 'New Time · Apto 1302', lugar: 'Pajuçara, Maceió', guia: 'guia/new-time/', capa: 'capa-newtime.jpg', max: 4 },
    '1303': { nome: 'New Time · Apto 1303', lugar: 'Pajuçara, Maceió', guia: 'guia/new-time/', capa: 'capa-newtime.jpg', max: 4 },
    '1304': { nome: 'New Time · Apto 1304', lugar: 'Pajuçara, Maceió', guia: 'guia/new-time/', capa: 'capa-newtime.jpg', max: 4 },
    '607': { nome: 'Loft Residence · Studio 607', lugar: 'Cruz das Almas, Maceió', guia: 'guia/loft-residence/', capa: 'capa-loft.jpg', max: 3 },
    '807': { nome: 'Loft Residence · Studio 807', lugar: 'Cruz das Almas, Maceió', guia: 'guia/loft-residence/', capa: 'capa-loft.jpg', max: 3 },
    'iloa': { nome: 'ILOA Residence · Apto 202 E', lugar: 'Barra de São Miguel', guia: 'guia/iloa/', capa: 'capa-iloa.jpg', max: 6 }
  };

  var T = {
    pt: {
      eyebrow: 'Pré-check-in', titulo: 'Dados para a sua chegada',
      lede: 'Leva 2 minutos. Enviamos os dados à portaria antes da sua chegada, e você entra sem fila.',
      ledeImovel: 'Leva 2 minutos. Enviamos os dados à portaria do {i} antes da sua chegada.',
      b1: 'Sua reserva', imovel: 'Imóvel', escolha: 'Escolha…', chegada: 'Data de chegada', codigo: 'Número da reserva',
      opcional: '(se tiver à mão)', opcional2: '(opcional)', plataforma: 'Onde você reservou', direto: 'Direto com a Notte',
      b2: 'Hóspedes', b2ajuda: 'A portaria pede o nome completo e o CPF de todos, inclusive de quem não fez a reserva.',
      quantos: 'Quantas pessoas, ao todo?', hospede: 'Hóspede {n}', titular: 'Hóspede 1 · titular', nome: 'Nome completo', doc: 'Documento',
      passaporte: 'Passaporte (estrangeiro)', crianca: 'Criança sem CPF', numPass: 'Número do passaporte', pais: 'País',
      b3: 'Chegada', hora: 'Hora prevista de chegada', tarde: 'Depois das 23h', naosei: 'Ainda não sei',
      carro: 'Vem de carro?', nao: 'Não', sim: 'Sim', placa: 'Placa', modelo: 'Modelo e cor', obs: 'Algo que devemos saber?',
      privT: 'Privacidade',
      priv: 'Usamos estes dados só para liberar a sua entrada no condomínio (exigência da portaria) e para a segurança da estadia. Eles saem do seu celular cifrados e só a administração da Notte consegue ler. Não vendemos nem compartilhamos com mais ninguém além da portaria do prédio. Guardamos pelo tempo que a lei exige e depois apagamos. Para corrigir ou pedir a exclusão, fale com a gente pelo WhatsApp (82) 99619-6123. Base legal: execução do contrato de hospedagem (LGPD, art. 7º, V).',
      aceite: 'Li e concordo com o uso dos dados para o check-in.', enviar: 'Enviar dados', enviando: 'Enviando…',
      okT: 'Dados recebidos. Obrigado!', okP: 'Vamos repassar à portaria antes da sua chegada. O código ou as instruções de entrada chegam pela conversa da reserva.',
      guia: 'Ver o guia do hóspede', site: 'Site da Notte', okCorrigir: 'Errou algum dado? É só enviar de novo: vale o último envio.',
      eImovel: 'Escolha o imóvel.', eData: 'Informe a data de chegada.', eNome: 'Escreva o nome completo (nome e sobrenome).',
      eCpf: 'CPF inválido. Confira os números.', ePass: 'Informe o número do documento.', ePais: 'Informe o país.',
      eHora: 'Escolha a hora prevista.', ePlaca: 'Placa inválida (ex.: ABC1D23 ou ABC1234).', eAceite: 'Marque a concordância com o uso dos dados.',
      eRepetido: 'Este CPF já foi informado para outro hóspede.', eCampos: 'Confira os campos marcados em vermelho.',
      eRede: 'Não conseguimos enviar agora. Confira a internet e tente de novo. Se continuar, mande os dados pela conversa da reserva.',
      eSemDestino: 'O envio ainda não está ativo. Por favor, mande os dados pela conversa da reserva.',
      eNavegador: 'Este navegador não consegue cifrar os dados. Abra o link no Chrome ou no Safari atualizados.'
    },
    en: {
      eyebrow: 'Pre check-in', titulo: 'Your arrival details',
      lede: 'Takes 2 minutes. We send the details to the front desk before you arrive, so you get in without waiting.',
      ledeImovel: 'Takes 2 minutes. We send the details to the {i} front desk before you arrive.',
      b1: 'Your booking', imovel: 'Property', escolha: 'Choose…', chegada: 'Arrival date', codigo: 'Booking number',
      opcional: '(if you have it)', opcional2: '(optional)', plataforma: 'Where you booked', direto: 'Directly with Notte',
      b2: 'Guests', b2ajuda: 'The building requires the full name and ID of every guest, including those who did not book.',
      quantos: 'How many people in total?', hospede: 'Guest {n}', titular: 'Guest 1 · main guest', nome: 'Full name', doc: 'Document',
      passaporte: 'Passport (foreign guest)', crianca: 'Child without CPF', numPass: 'Passport number', pais: 'Country',
      b3: 'Arrival', hora: 'Expected arrival time', tarde: 'After 11 p.m.', naosei: 'Not sure yet',
      carro: 'Coming by car?', nao: 'No', sim: 'Yes', placa: 'License plate', modelo: 'Model and color', obs: 'Anything we should know?',
      privT: 'Privacy',
      priv: 'We use these details only to register your entry with the building (a front desk requirement) and for the safety of your stay. They leave your phone encrypted and only Notte management can read them. We never sell or share them with anyone other than the building front desk. We keep them only as long as the law requires and then delete them. To correct or delete your data, message us on WhatsApp +55 82 99619-6123. Legal basis: performance of the lodging contract (Brazilian LGPD, art. 7, V).',
      aceite: 'I have read and agree to the use of this data for check-in.', enviar: 'Send details', enviando: 'Sending…',
      okT: 'Details received. Thank you!', okP: 'We will forward them to the front desk before you arrive. Entry instructions come through the booking chat.',
      guia: 'Open the guest guide', site: 'Notte website', okCorrigir: 'Made a mistake? Just send again: the latest submission counts.',
      eImovel: 'Choose the property.', eData: 'Enter the arrival date.', eNome: 'Enter the full name (first and last name).',
      eCpf: 'Invalid CPF. Please check the digits.', ePass: 'Enter the document number.', ePais: 'Enter the country.',
      eHora: 'Choose the expected arrival time.', ePlaca: 'Invalid plate (e.g. ABC1D23 or ABC1234).', eAceite: 'Please agree to the use of the data.',
      eRepetido: 'This CPF was already entered for another guest.', eCampos: 'Please check the fields marked in red.',
      eRede: 'We could not send it right now. Check your connection and try again. If it keeps failing, send the details in the booking chat.',
      eSemDestino: 'Sending is not active yet. Please send the details in the booking chat.',
      eNavegador: 'This browser cannot encrypt the data. Please open the link in an up-to-date Chrome or Safari.'
    }
  };

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var script = document.currentScript;
  var ROOT = script ? new URL('../', script.src).href : '/';
  var q = new URLSearchParams(location.search);
  var lang = (q.get('lang') || (navigator.language || 'pt')).slice(0, 2).toLowerCase() === 'pt' ? 'pt' : 'en';
  if (q.get('lang') === 'pt') lang = 'pt';
  var destino = DESTINO;
  // só para teste local: o endereço do recebedor pode vir no link quando a página está em 127.0.0.1/localhost
  if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname) && q.get('destino')) destino = q.get('destino');

  function t(k, vars) {
    var s = (T[lang] && T[lang][k]) || T.pt[k] || k;
    if (vars) Object.keys(vars).forEach(function (v) { s = s.replace('{' + v + '}', vars[v]); });
    return s;
  }

  function aplicarIdioma() {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    $$('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    $$('.ck-lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    $('#ck-enviar span').textContent = t('enviar');
    atualizarImovel();
    desenharHospedes();
  }

  // ---------- validações ----------
  function soDigitos(s) { return String(s || '').replace(/\D/g, ''); }
  function cpfValido(c) {
    c = soDigitos(c);
    if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    for (var j = 9; j < 11; j++) {
      var soma = 0;
      for (var i = 0; i < j; i++) soma += Number(c[i]) * (j + 1 - i);
      var d = (soma * 10) % 11 % 10;
      if (d !== Number(c[j])) return false;
    }
    return true;
  }
  function formatarCpf(c) { c = soDigitos(c).slice(0, 11); return c.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2'); }
  function placaValida(p) { return /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(String(p || '').toUpperCase().replace(/[\s-]/g, '')); }
  function nomeValido(n) { n = String(n || '').trim(); return n.length >= 5 && /\S+\s+\S+/.test(n) && !/\d/.test(n); }

  // ---------- imóvel ----------
  var imovelSel = $('#ck-imovel');
  function atualizarImovel() {
    var im = IMOVEIS[imovelSel.value];
    $('#ck-onde').textContent = im ? t('ledeImovel', { i: im.nome }) : t('lede');
    var capa = $('#ck-capa');
    var arq = im ? im.capa : 'capa-inicio.jpg';
    if (capa.getAttribute('data-arq') !== arq) { capa.src = ROOT + 'img/' + arq; capa.setAttribute('data-arq', arq); }
    $('#ck-guia').href = ROOT + (im ? im.guia : 'imoveis/');
    var max = im ? im.max : 6;
    if (num > max) { num = max; desenharHospedes(); }
    $('#ck-mais').disabled = num >= max;
  }

  // ---------- hóspedes ----------
  var num = 1;
  var guardados = [];   // preserva o que já foi digitado ao trocar a quantidade
  function lerHospedes() {
    return $$('.ck-hosp').map(function (h) {
      return { nome: $('.ck-nome', h).value, tipo: $('.ck-tipo', h).value, doc: $('.ck-doc', h).value, pais: $('.ck-pais', h).value };
    });
  }
  function desenharHospedes() {
    var atuais = lerHospedes();
    atuais.forEach(function (h, i) { guardados[i] = h; });
    var caixa = $('#ck-hospedes');
    caixa.innerHTML = '';
    var tpl = $('#ck-tpl-hospede');
    for (var i = 0; i < num; i++) {
      var frag = tpl.content.cloneNode(true);
      var h = frag.querySelector('.ck-hosp');
      $('.ck-hosp-n', h).textContent = i === 0 ? t('titular') : t('hospede', { n: i + 1 });
      $$('[data-t]', h).forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
      var g = guardados[i];
      if (g) { $('.ck-nome', h).value = g.nome; $('.ck-tipo', h).value = g.tipo; $('.ck-doc', h).value = g.doc; $('.ck-pais', h).value = g.pais; }
      ligarHospede(h);
      caixa.appendChild(h);
    }
    $('#ck-num').textContent = String(num);
    $('#ck-menos').disabled = num <= 1;
    var im = IMOVEIS[imovelSel.value];
    $('#ck-mais').disabled = num >= (im ? im.max : 6);
  }
  function ligarHospede(h) {
    var tipo = $('.ck-tipo', h), doc = $('.ck-doc', h);
    function ajustar() {
      var v = tipo.value;
      $('.ck-doc-campo', h).hidden = v === 'Crianca';
      $('.ck-pais-campo', h).hidden = v !== 'Passaporte';
      $('.ck-doc-rot', h).textContent = v === 'Passaporte' ? t('numPass') : 'CPF';
      doc.inputMode = v === 'CPF' ? 'numeric' : 'text';
      doc.placeholder = v === 'CPF' ? '000.000.000-00' : '';
      if (v === 'CPF') doc.value = formatarCpf(doc.value);
    }
    tipo.addEventListener('change', ajustar);
    doc.addEventListener('input', function () { if (tipo.value === 'CPF') doc.value = formatarCpf(doc.value); });
    ajustar();
  }
  $('#ck-menos').addEventListener('click', function () { if (num > 1) { num--; desenharHospedes(); } });
  $('#ck-mais').addEventListener('click', function () { var im = IMOVEIS[imovelSel.value]; if (num < (im ? im.max : 6)) { num++; desenharHospedes(); } });

  $$('input[name="vemCarro"]').forEach(function (r) {
    r.addEventListener('change', function () { $('#ck-carro').hidden = $('input[name="vemCarro"]:checked').value !== 'sim'; });
  });
  $('#ck-placa').addEventListener('input', function (e) { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''); });
  imovelSel.addEventListener('change', atualizarImovel);
  $$('.ck-lang button').forEach(function (b) { b.addEventListener('click', function () { lang = b.getAttribute('data-lang'); aplicarIdioma(); }); });

  // ---------- link já preenchido ----------
  (function preencher() {
    var i = String(q.get('i') || '').toLowerCase();
    if (IMOVEIS[i]) { imovelSel.value = i; }
    var d = q.get('d');
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) $('#ck-checkin').value = d;
    var r = String(q.get('r') || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 20);
    if (r) $('#ck-codigo').value = r.toUpperCase();
    var p = String(q.get('p') || '').toLowerCase();
    if (p === 'booking') $('#ck-plataforma').value = 'Booking';
    else if (p === 'airbnb') $('#ck-plataforma').value = 'Airbnb';
    else if (p === 'direto') $('#ck-plataforma').value = 'Direto';   // 24/10/2026: link da mensagem da reserva direta
    else if (/^HM[A-Z0-9]{8}$/i.test(r)) $('#ck-plataforma').value = 'Airbnb';
    else if (/^\d{9,11}$/.test(r)) $('#ck-plataforma').value = 'Booking';
  })();

  // ---------- erros ----------
  function marcar(el, msg) {
    var campo = el.closest('.ck-campo') || el.parentNode;
    campo.classList.add('ck-ruim');
    var m = campo.querySelector('.ck-msg');
    if (!m) { m = document.createElement('span'); m.className = 'ck-msg'; campo.appendChild(m); }
    m.textContent = msg;
  }
  function limparErros() {
    $$('.ck-ruim').forEach(function (c) { c.classList.remove('ck-ruim'); });
    $$('.ck-msg').forEach(function (m) { m.remove(); });
    $('#ck-erro').hidden = true;
  }
  function erroGeral(msg) { var e = $('#ck-erro'); e.textContent = msg; e.hidden = false; e.scrollIntoView({ block: 'center', behavior: 'smooth' }); }

  function coletar() {
    limparErros();
    var ok = true, primeiro = null;
    function falha(el, msg) { ok = false; marcar(el, msg); if (!primeiro) primeiro = el; }
    var f = $('#ck-form');
    if (!imovelSel.value) falha(imovelSel, t('eImovel'));
    var checkin = $('#ck-checkin').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkin)) falha($('#ck-checkin'), t('eData'));
    var hospedes = [], cpfs = {};
    $$('.ck-hosp').forEach(function (h) {
      var nome = $('.ck-nome', h).value.replace(/\s+/g, ' ').trim();
      var tipo = $('.ck-tipo', h).value, doc = $('.ck-doc', h).value.trim(), pais = $('.ck-pais', h).value.trim();
      if (!nomeValido(nome)) falha($('.ck-nome', h), t('eNome'));
      var item = { nome: nome, tipo: tipo };
      if (tipo === 'CPF') {
        if (!cpfValido(doc)) falha($('.ck-doc', h), t('eCpf'));
        else if (cpfs[soDigitos(doc)]) falha($('.ck-doc', h), t('eRepetido'));
        cpfs[soDigitos(doc)] = 1;
        item.doc = formatarCpf(doc);
      } else if (tipo === 'Passaporte') {
        if (doc.replace(/\W/g, '').length < 5) falha($('.ck-doc', h), t('ePass'));
        if (pais.length < 2) falha($('.ck-pais', h), t('ePais'));
        item.doc = doc.toUpperCase().slice(0, 20); item.pais = pais.slice(0, 40);
      }
      hospedes.push(item);
    });
    var hora = $('#ck-hora').value;
    if (!hora) falha($('#ck-hora'), t('eHora'));
    var carro = null;
    if ($('input[name="vemCarro"]:checked').value === 'sim') {
      var placa = $('#ck-placa').value.toUpperCase().replace(/[\s-]/g, '');
      if (!placaValida(placa)) falha($('#ck-placa'), t('ePlaca'));
      carro = { placa: placa, modelo: f.modelo.value.trim().slice(0, 40) };
    }
    if (!$('#ck-aceite').checked) falha($('#ck-aceite'), t('eAceite'));
    if (!ok) { erroGeral(t('eCampos')); if (primeiro && primeiro.focus) primeiro.focus({ preventScroll: true }); return null; }
    return {
      meta: {
        i: imovelSel.value, d: checkin,
        r: $('#ck-codigo').value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20),
        p: $('#ck-plataforma').value, n: hospedes.length
      },
      dados: { hospedes: hospedes, carro: carro, hora: hora, obs: f.obs.value.trim().slice(0, 300), idioma: lang, enviadoEm: new Date().toISOString() },
      pote: f.site.value
    };
  }

  // ---------- cifra ----------
  function b64(buf) { var b = new Uint8Array(buf), s = ''; for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); }
  function deB64(s) { var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function aad(m) { return new TextEncoder().encode(['v1', m.i, m.d, m.r, m.p, m.n].join('|')); }
  function cifrar(meta, dados) {
    var sub = window.crypto && window.crypto.subtle;
    if (!sub) return Promise.reject(new Error('sem-cifra'));
    var iv = window.crypto.getRandomValues(new Uint8Array(12));
    return Promise.all([
      sub.importKey('spki', deB64(CHAVE_PUBLICA), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']),
      sub.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    ]).then(function (ks) {
      return Promise.all([
        sub.exportKey('raw', ks[1]).then(function (raw) { return sub.encrypt({ name: 'RSA-OAEP' }, ks[0], raw); }),
        sub.encrypt({ name: 'AES-GCM', iv: iv, additionalData: aad(meta) }, ks[1], new TextEncoder().encode(JSON.stringify(dados)))
      ]);
    }).then(function (r) { return { k: b64(r[0]), iv: b64(iv), c: b64(r[1]) }; });
  }

  // ---------- envio ----------
  var enviando = false;
  $('#ck-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (enviando) return;
    var col = coletar();
    if (!col) return;
    if (!destino) { erroGeral(t('eSemDestino')); return; }
    var btn = $('#ck-enviar');
    enviando = true; btn.disabled = true; $('#ck-enviar span').textContent = t('enviando');
    cifrar(col.meta, col.dados).then(function (cif) {
      var env = { v: 1, i: col.meta.i, d: col.meta.d, r: col.meta.r, p: col.meta.p, n: col.meta.n, k: cif.k, iv: cif.iv, c: cif.c, site: col.pote };
      // text/plain evita a pergunta prévia (CORS) que o Apps Script não responde
      return fetch(destino, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(env), redirect: 'follow' });
    }).then(function (resp) {
      if (!resp.ok) throw new Error('http ' + resp.status);
      return resp.json();
    }).then(function (j) {
      if (!j || !j.ok) throw new Error('recusado');
      $('#ck-form').hidden = true;
      var ok = $('#ck-ok'); ok.hidden = false; ok.focus();
      ok.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }).catch(function (e) {
      erroGeral(e && e.message === 'sem-cifra' ? t('eNavegador') : t('eRede'));
    }).then(function () {
      enviando = false; btn.disabled = false; $('#ck-enviar span').textContent = t('enviar');
    });
  });

  aplicarIdioma();
})();

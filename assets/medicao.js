/* Notte Stays · medição de visitas com aceite de cookies (LGPD) · 11/11/2026
 * - O contador da Vercel continua como está (não usa cookie).
 * - O Google Analytics 4 só carrega DEPOIS que a pessoa clica em "Aceitar".
 * - Se GA_ID voltar a 'G-PENDENTE', este arquivo não faz nada (nem faixa, nem Analytics).
 * - Não carregar no pré-check-in nem nos guias do hóspede.
 */
/* 23/11/2026 · CONTADOR DA NOTTE (ordem dele: "faça" — medir conversão sem depender de login de ninguém).
 * Vale para TODO visitante, sem cookie e sem dado pessoal: manda ao recebedor Google da Notte só o evento (visita,
 * toque num botão, pedido de reserva), a página, de onde a pessoa veio (Instagram, anúncio, Google...) e o tipo de
 * aparelho. A "sessão" é um código sorteado que fica só nesta aba (sessionStorage) e some quando ela fecha.
 * Não conta: computador de teste (localhost), pré-check-in, guias do hóspede e navegador de robô. */
(function () {
  var DEST = 'https://script.google.com/macros/s/AKfycbwyM7rSBp7wrwce7NJymwL8S4BFSQBP7mJUC7qrIJ0sqGyXMmckYXpfdU0skimfp-P2/exec';
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) || /^\/(checkin|guia)\//.test(location.pathname)) {
    window.notteConta = function () {}; return;
  }
  if (navigator.webdriver) { window.notteConta = function () {}; return; }
  var SS = null; try { SS = window.sessionStorage; } catch (e) {}
  function ler(k) { try { return SS ? SS.getItem(k) : null; } catch (e) { return null; } }
  function gravar(k, v) { try { if (SS) SS.setItem(k, v); } catch (e) {} }
  var limpa = function (s, n) { return String(s || '').toLowerCase().replace(/[^a-z0-9._\-]/g, '').slice(0, n); };
  var sess = ler('nt-s'); if (!sess) { sess = Math.random().toString(36).slice(2, 10); gravar('nt-s', sess); }
  var org = null; try { org = JSON.parse(ler('nt-o') || 'null'); } catch (e) {}
  if (!org) {                                   // de onde veio: só no primeiro acesso da sessão
    var q = {}; location.search.replace(/^\?/, '').split('&').forEach(function (p) { var kv = p.split('='); if (kv[0]) { try { q[kv[0]] = decodeURIComponent(kv[1] || ''); } catch (e) {} } });
    var ref = ''; try { ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) {}
    if (ref && ref === location.hostname.replace(/^www\./, '')) ref = '';
    var src = q.utm_source || (q.fbclid && !ref ? 'meta' : '') || (q.gclid ? 'google-anuncio' : '') || ref || 'direto';
    org = { o: limpa(src, 60), m: limpa(q.utm_medium, 40), c: limpa(q.utm_campaign, 60) };
    gravar('nt-o', JSON.stringify(org));
  }
  var w = window.innerWidth || 1024, ua = navigator.userAgent || '';
  var aparelho = /iPad|Tablet/i.test(ua) ? 'tablet' : (/Mobi|Android|iPhone/i.test(ua) || w < 760 ? 'cel' : 'pc');
  function enviar(t, x) {
    var corpo = JSON.stringify({ ev: 1, t: t, pg: location.pathname.slice(0, 80), o: org.o, m: org.m, c: org.c, a: aparelho, s: sess, x: String(x || '').slice(0, 80) });
    try { if (navigator.sendBeacon && navigator.sendBeacon(DEST, new Blob([corpo], { type: 'text/plain' }))) return; } catch (e) {}
    try { fetch(DEST, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: corpo }); } catch (e) {}
  }
  window.notteConta = enviar;                   // reserva.js chama notteConta('pedido', ...) ao pedir reserva
  enviar('visita');
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.hasAttribute('data-rd-pedido')) return;   // o pedido de reserva é contado pelo reserva.js
    var h = a.getAttribute('href') || '';
    if (/wa\.me\/|api\.whatsapp\.com/.test(h)) {
      var t = ''; try { t = decodeURIComponent(h.split('text=')[1] || '').toLowerCase(); } catch (x) {}
      enviar('clique', 'whatsapp-' + (/propriet|administra|meu im[oó]vel|tenho um im/.test(t) ? 'proprietario' : /invest/.test(t) ? 'investidor' : 'hospede'));
    }
    else if (/airbnb\.com/.test(h)) enviar('clique', 'airbnb');
    else if (/booking\.com/.test(h)) enviar('clique', 'booking');
    else if (/instagram\.com/.test(h)) enviar('clique', 'instagram');
    else if (/#reservar/.test(h)) enviar('clique', 'reservar');
  }, true);
})();

(function () {
  var GA_ID = 'G-CN8QX4LHR5';              // propriedade "Notte Stays - nottestays.com.br", conta dos aluguéis (12/11/2026)
  var CHAVE = 'notte-cookies-v1';           // 'sim' ou 'nao'
  /* no computador (localhost) usa sempre um código falso, para teste não entrar nos números de verdade */
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) GA_ID = 'G-TESTE00000';
  window.notteCookies = { refazer: function () { try { localStorage.removeItem(CHAVE); } catch (e) {} location.reload(); } };
  if (!/^G-[A-Z0-9]{4,}$/.test(GA_ID) || GA_ID === 'G-PENDENTE') return;
  if (/^\/(checkin|guia)\//.test(location.pathname)) return;

  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, v); } catch (e) {} }

  var ligado = false;
  function ligarAnalytics() {
    if (ligado) return; ligado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  /* ---------- eventos: o que a gente quer saber ---------- */
  function evento(nome, extra) {
    if (!ligado || !window.gtag) return;
    var p = { pagina: location.pathname };
    for (var k in extra) p[k] = extra[k];
    window.gtag('event', nome, p);
  }
  function tipoWhats(href) {
    var t = decodeURIComponent((href.split('text=')[1] || '')).toLowerCase();
    if (/propriet|administra|meu im[oó]vel|tenho um im/.test(t)) return 'proprietario';
    if (/invest/.test(t)) return 'investidor';
    return 'hospede';
  }
  function onde(a) {
    if (a.closest('.wa-float')) return 'botao-flutuante';
    if (a.closest('.barra-cel')) return 'barra-celular';
    if (a.closest('.site-foot')) return 'rodape';
    if (a.closest('.drawer')) return 'menu-celular';
    if (a.closest('header')) return 'topo';
    if (a.closest('.nc-panel')) return 'chat';
    if (a.closest('.jml-faixa')) return 'faixa-investir';
    return 'pagina';
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/wa\.me\/|api\.whatsapp\.com/.test(h)) evento('clique_whatsapp', { tipo: tipoWhats(h), lugar: onde(a) });
    else if (/airbnb\.com/.test(h)) evento('clique_airbnb', { lugar: onde(a) });
    else if (/booking\.com/.test(h)) evento('clique_booking', { lugar: onde(a) });
    else if (/instagram\.com/.test(h)) evento('clique_instagram', { lugar: onde(a) });
    else if (/\/investir\/?(#.*)?$/.test(h)) evento('clique_investir', { lugar: onde(a) });
    else if (/#reservar/.test(h)) evento('clique_reservar', { lugar: onde(a) });
  }, true);

  /* ---------- faixa de cookies ---------- */
  var escolha = ler();
  if (escolha === 'sim') { ligarAnalytics(); return; }
  if (escolha === 'nao') return;

  function faixa() {
    var css = document.createElement('style');
    css.textContent =
      '.nt-ck{position:fixed;z-index:90;left:16px;bottom:16px;max-width:420px;background:#0B1A2A;color:#FBF8F2;' +
      'padding:18px 20px;border-radius:4px;box-shadow:0 18px 40px -12px rgba(11,26,42,.55);font:400 14.5px/1.5 "Work Sans",sans-serif}' +
      '.nt-ck p{margin:0 0 14px}.nt-ck a{color:#E3C98F;text-decoration:underline}' +
      '.nt-ck .nt-ck-b{display:flex;gap:10px;flex-wrap:wrap}' +
      '.nt-ck button{cursor:pointer;min-height:44px;padding:10px 18px;border-radius:2px;font:600 12px/1.2 "Work Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase}' +
      '.nt-ck .sim{background:#C9A55C;color:#0B1A2A;border:0}.nt-ck .nao{background:transparent;color:#FBF8F2;border:1px solid rgba(251,248,242,.5)}' +
      '@media (max-width:640px){.nt-ck{left:0;right:0;bottom:0;max-width:none;border-radius:0;padding:16px 16px calc(16px + env(safe-area-inset-bottom))}' +
      '.nt-ck .nt-ck-b button{flex:1}}';
    document.head.appendChild(css);
    var d = document.createElement('div');
    d.className = 'nt-ck'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Aviso de cookies');
    d.innerHTML = '<p>Usamos cookies do Google Analytics para entender como o site é usado e melhorá-lo. ' +
      'Só ligamos com o seu aceite. <a href="/privacidade/">Saiba mais</a>.</p>' +
      '<div class="nt-ck-b"><button type="button" class="sim">Aceitar</button><button type="button" class="nao">Recusar</button></div>';
    document.body.appendChild(d);
    d.querySelector('.sim').addEventListener('click', function () { gravar('sim'); d.remove(); ligarAnalytics(); });
    d.querySelector('.nao').addEventListener('click', function () { gravar('nao'); d.remove(); });
  }
  if (document.body) faixa(); else document.addEventListener('DOMContentLoaded', faixa);
})();

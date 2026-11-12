/* Notte Stays · medição de visitas com aceite de cookies (LGPD) · 11/11/2026
 * - O contador da Vercel continua como está (não usa cookie).
 * - O Google Analytics 4 só carrega DEPOIS que a pessoa clica em "Aceitar".
 * - Se GA_ID voltar a 'G-PENDENTE', este arquivo não faz nada (nem faixa, nem Analytics).
 * - Não carregar no pré-check-in nem nos guias do hóspede.
 */
(function () {
  var GA_ID = 'G-CN8QX4LHR5';               // propriedade "Notte Stays - nottestays.com.br", conta dos aluguéis (12/11/2026)
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

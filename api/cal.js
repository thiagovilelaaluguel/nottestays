/*
 * api/cal.js — calendário da reserva direta AO VIVO (28/10/2026, ordem dele: uso pessoal "sem precisar do computador").
 * O Airbnb e a Booking importam reserva/cal/<imovel>-<marca>.ics (o vercel.json manda esse endereço para cá).
 * Junta o .ics montado pelo computador (reserva/cal-base/, reservas diretas) com o uso pessoal marcado na tela do
 * painel, lido do recebedor Google (?bloqueios=1: só imóvel e datas). Assim a plataforma fecha a noite sozinha na
 * próxima importação, com o computador desligado.
 * Google fora do ar: responde 503 (a plataforma mantém o que já tinha), nunca um calendário sem o uso.
 *   GET /api/cal?arq=1302-<marca>.ics   -> text/calendar
 *   GET /api/cal?bloqueios=1            -> JSON {ok, bloqueios:[{imovel, entrada, saida}]} (o calendário do site usa)
 */
const RECEBEDOR = 'https://script.google.com/macros/s/AKfycbwyM7rSBp7wrwce7NJymwL8S4BFSQBP7mJUC7qrIJ0sqGyXMmckYXpfdU0skimfp-P2/exec';

async function bloqueios() {
  const r = await fetch(RECEBEDOR + '?bloqueios=1', { redirect: 'follow', signal: AbortSignal.timeout(9000) });
  const j = await r.json();
  if (!j || !j.ok || !Array.isArray(j.bloqueios)) throw new Error('recebedor');
  return j.bloqueios.filter(b => b && /^\d{4}-\d{2}-\d{2}$/.test(b.entrada) && /^\d{4}-\d{2}-\d{2}$/.test(b.saida) && b.entrada < b.saida);
}

module.exports = async (req, res) => {
  const q = req.query || {};
  if (q.bloqueios === '1') {
    try {
      const b = await bloqueios();
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ ok: true, bloqueios: b });
    } catch (e) { return res.status(503).json({ ok: false }); }
  }
  const arq = String(q.arq || '');
  if (!/^[a-z0-9]{2,6}-[0-9a-f]{18}\.ics$/.test(arq)) return res.status(404).send('não encontrado');
  const base = await fetch(`https://${req.headers.host}/reserva/cal-base/${arq}`, { signal: AbortSignal.timeout(9000) }).catch(() => null);
  if (!base || !base.ok) return res.status(base && base.status === 404 ? 404 : 503).send('indisponível');
  let ics = await base.text(), B;
  try { B = await bloqueios(); } catch (e) { return res.status(503).send('indisponível'); }
  const imovel = arq.split('-')[0].toUpperCase();
  const carimbo = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const ev = B.filter(b => String(b.imovel).toUpperCase() === imovel).map(b => ['BEGIN:VEVENT',
    `UID:uso-${imovel.toLowerCase()}-${b.entrada.replace(/-/g, '')}@nottestays.com.br`, `DTSTAMP:${carimbo}`,
    `DTSTART;VALUE=DATE:${b.entrada.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${b.saida.replace(/-/g, '')}`,
    'SUMMARY:Bloqueado (Notte)', 'END:VEVENT'].join('\r\n'));
  // 29/10/2026, ordem dele ("Pode ajustar"): a Booking deixa o calendário "a validar" há dias. Suspeitas: linha só com
  // LF (o formato pede CRLF) e calendário sem nenhum evento. Calendário vazio leva uma noite de 2026-01-01, no passado:
  // não fecha nada.
  if (!ev.length && !/BEGIN:VEVENT/.test(ics)) ev.push(['BEGIN:VEVENT', `UID:vazio-${imovel.toLowerCase()}@nottestays.com.br`,
    `DTSTAMP:${carimbo}`, 'DTSTART;VALUE=DATE:20260101', 'DTEND;VALUE=DATE:20260102', 'SUMMARY:Fechado (Notte)', 'END:VEVENT'].join('\r\n'));
  if (ev.length) ics = ics.replace(/END:VCALENDAR\s*$/, ev.join('\r\n') + '\r\nEND:VCALENDAR\r\n');
  ics = ics.replace(/\r?\n/g, '\r\n');
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).send(ics);
};

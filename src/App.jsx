import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Separator } from './components/ui/separator';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

import {
  MapPin,
  Clock,
  Calendar,
  Phone,
  CheckCircle,
  ArrowRight,
  User,
  X,
  Mail,
} from 'lucide-react';

// ─── TROQUE pelo caminho da sua imagem do Jesus ───────────────────────────────
import heroImage from './assets/hero.jpg';
// ─────────────────────────────────────────────────────────────────────────────

// ============================================================
// ⚙️  CONFIGURAÇÃO DO EVENTO — edite aqui
// ============================================================
const CONFIG = {
  nomeEvento:  '2º Seminário Espírita do NEEL',
  data:        '31 de Outubro de 2026',
  horario:     '08h às 17h',
  local:       'Auditório SESC Cidade Alta',
  endereco:    'Rua Coronel Bezerra, 33 — Cidade Alta, Natal‑RN',
  whatsapp1:   '(84) 9 9133‑5975',
  whatsapp2:   '(84) 9 8804‑9371',
  instagram:   '@neelsga',
  webhookUrl:  'https://SEU-WEBHOOK-AQUI/inscricoes-neel',  // ← substitua
  precoBase:   40.00, // mude para 0 se for gratuito (oculta seção de pagamento)
};
// ============================================================

// ── Utilitários ──────────────────────────────────────────────
const validarCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf[10]);
};

const formatTel = (v) =>
  v.replace(/\D/g, '')
   .replace(/^(\d{2})(\d)/, '($1) $2')
   .replace(/(\d{5})(\d)/, '$1-$2')
   .replace(/(-\d{4})\d+?$/, '$1');

const telDigits = (v) => (v || '').replace(/\D/g, '');

// ── Estilos globais inline (evita dependência de App.css) ────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

  :root {
    --neel-navy:  #0d1b3e;
    --neel-gold:  #c8a45a;
    --neel-cream: #f7f2ea;
    --neel-light: #e8dfc8;
  }

  body { background: var(--neel-cream); }

  .neel-hero {
    position: relative;
    min-height: 100svh;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
  }
  .neel-hero__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;   /* ← mantém Jesus visível no mobile */
  }
  .neel-hero__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(13,27,62,0.15) 0%,
      rgba(13,27,62,0.55) 55%,
      rgba(13,27,62,0.92) 100%
    );
  }
  .neel-hero__content {
    position: relative;
    z-index: 10;
    width: 100%;
    padding: 2rem 1.5rem 3.5rem;
    color: #fff;
  }
  .font-display { font-family: 'Cormorant Garamond', serif; }
  .font-body    { font-family: 'Lato', sans-serif; }

  .gold-bar {
    display: inline-block;
    width: 48px;
    height: 3px;
    background: var(--neel-gold);
    border-radius: 2px;
    margin-bottom: 0.75rem;
  }
  .gold-text { color: var(--neel-gold); }
  .navy-bg   { background-color: var(--neel-navy); }
  .cream-bg  { background-color: var(--neel-cream); }

  .speaker-card {
    border-top: 3px solid var(--neel-gold);
  }

  .pill-badge {
    display: inline-block;
    background: rgba(200,164,90,0.18);
    color: var(--neel-gold);
    border: 1px solid rgba(200,164,90,0.4);
    border-radius: 9999px;
    padding: 0.2rem 0.85rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .form-card {
    border-top: 4px solid var(--neel-gold);
    background: #fff;
  }

  .pay-option {
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1rem;
    cursor: pointer;
    transition: border-color .2s, background .2s;
  }
  .pay-option.selected {
    border-color: var(--neel-gold);
    background: #fdf8ef;
  }

  .submit-btn {
    background: var(--neel-navy);
    color: #fff;
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    letter-spacing: 0.06em;
    border: none;
    transition: background .2s, transform .1s;
  }
  .submit-btn:hover:not(:disabled) {
    background: #162a5c;
    transform: translateY(-1px);
  }
  .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  @media (max-width: 640px) {
    .neel-hero__content { padding-bottom: 2.5rem; }
  }
`;

// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const isPaid = CONFIG.precoBase > 0;

  // Taxas de cartão
  const calcTotal = (method, parcelas) => {
    if (!isPaid) return { total: 0, parcela: 0 };
    if (method !== 'credit') return { total: CONFIG.precoBase, parcela: CONFIG.precoBase };
    const taxa = parcelas === 1 ? 0.0399 : 0.0449;
    const total = CONFIG.precoBase * (1 + taxa) + 0.49;
    return { total, parcela: total / parcelas };
  };

  // Form state
  const [form, setForm] = useState({
    nome: '', cpf: '', email: '',
    phone: '', phoneConfirm: '',
    paymentMethod: 'pix', installments: 1,
  });
  const [cpfErr,   setCpfErr]   = useState('');
  const [cpfOk,    setCpfOk]    = useState(false);
  const [telErr,   setTelErr]   = useState('');
  const [telOk,    setTelOk]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [payUrl,   setPayUrl]   = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { total, parcela } = calcTotal(form.paymentMethod, form.installments);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      const masked = value.replace(/\D/g,'')
        .replace(/(\d{3})(\d)/,'$1.$2')
        .replace(/(\d{3})(\d)/,'$1.$2')
        .replace(/(\d{3})(\d{1,2})$/,'$1-$2');
      setForm(p => ({ ...p, cpf: masked }));
      const raw = masked.replace(/\D/g,'');
      if (!raw)             { setCpfErr(''); setCpfOk(false); }
      else if (raw.length < 11) { setCpfErr('CPF incompleto'); setCpfOk(false); }
      else if (validarCPF(raw)) { setCpfErr(''); setCpfOk(true); }
      else                      { setCpfErr('CPF inválido'); setCpfOk(false); }
      return;
    }

    if (name === 'phone') {
      const fmt = formatTel(value);
      setForm(p => ({ ...p, phone: fmt }));
      const d = telDigits(fmt), dc = telDigits(form.phoneConfirm);
      if (!d)          { setTelErr(''); setTelOk(false); }
      else if (d.length < 11) { setTelErr('WhatsApp deve ter 11 dígitos com DDD'); setTelOk(false); }
      else if (dc && dc !== d) { setTelErr('Os números não coincidem'); setTelOk(false); }
      else if (dc && dc === d) { setTelErr(''); setTelOk(true); }
      else                     { setTelErr(''); setTelOk(false); }
      return;
    }

    if (name === 'phoneConfirm') {
      const fmt = formatTel(value);
      setForm(p => ({ ...p, phoneConfirm: fmt }));
      const d = telDigits(fmt), dp = telDigits(form.phone);
      if (!d)          { setTelErr(''); setTelOk(false); }
      else if (d !== dp) { setTelErr('Os números não coincidem'); setTelOk(false); }
      else if (d.length === 11) { setTelErr(''); setTelOk(true); }
      return;
    }

    setForm(p => ({ ...p, [name]: value }));
  };

  const setPayMethod = (method) =>
    setForm(p => ({ ...p, paymentMethod: method, installments: 1 }));

  const validate = () => {
    if (!form.nome.trim()) { alert('Informe seu nome completo.'); return false; }
    const raw = form.cpf.replace(/\D/g,'');
    if (!validarCPF(raw)) { alert('CPF inválido.'); return false; }
    if (!form.email.includes('@')) { alert('E-mail inválido.'); return false; }
    if (telDigits(form.phone).length < 11) { alert('WhatsApp inválido.'); return false; }
    if (telDigits(form.phone) !== telDigits(form.phoneConfirm)) {
      alert('Os números de WhatsApp não coincidem.'); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome:          form.nome,
          cpf:           form.cpf,
          email:         form.email,
          phone:         form.phone,
          paymentMethod: form.paymentMethod,
          installments:  form.installments,
          amount:        total,
          event:         'NEEL-2SeminarioEspirita',
          timestamp:     new Date().toISOString(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success === false) { alert(data.message || 'Erro ao processar.'); return; }
        if (data.paymentUrl) {
          setPayUrl(data.paymentUrl);
          setSuccess(true);
          window.location.href = data.paymentUrl;
        } else if (!isPaid) {
          setSuccess(true);
        } else {
          alert('Erro: link de pagamento não encontrado.');
        }
      } else {
        const err = await res.json();
        alert(err.message || 'Erro no servidor. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  // ── Tela de sucesso ──────────────────────────────────────────
  if (success) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="min-h-screen cream-bg flex items-center justify-center p-4 font-body">
          <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center"
                   style={{ background: '#f0f7f0' }}>
                <CheckCircle className="h-8 w-8" style={{ color: '#3a7d44' }} />
              </div>
              <CardTitle className="font-display text-2xl" style={{ color: '#0d1b3e' }}>
                {isPaid ? 'Inscrição Registrada!' : 'Inscrição Confirmada!'}
              </CardTitle>
              <CardDescription>
                {isPaid
                  ? 'Finalize o pagamento para confirmar sua participação.'
                  : 'Sua inscrição foi recebida com sucesso.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {payUrl && (
                <>
                  <a href={payUrl}
                     className="block w-full py-4 px-6 rounded-lg text-white font-bold text-lg no-underline"
                     style={{ background: '#0d1b3e' }}>
                    💳 IR PARA O PAGAMENTO
                  </a>
                  <p className="text-xs text-gray-500 break-all select-all cursor-text
                                 p-2 bg-gray-100 rounded">{payUrl}</p>
                </>
              )}
              <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                Voltar ao início
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // ── Render principal ─────────────────────────────────────────
  return (
    <>
      <style>{globalStyles}</style>

      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <section className="neel-hero">
        <img src={heroImage} alt="Vinde a mim" className="neel-hero__img" />
        <div className="neel-hero__overlay" />

        <div className="neel-hero__content font-body">
          <div className="max-w-2xl mx-auto px-2">

            {/* Badgezinho superior */}
            <div className="pill-badge mb-4">2º Seminário Espírita do NEEL</div>

            {/* Título */}
            <h1 className="font-display text-5xl md:text-7xl font-semibold leading-tight mb-3"
                style={{ color: '#f7f2ea' }}>
              Vinde a mim
            </h1>
            <p className="italic mb-6" style={{ color: 'rgba(247,242,234,0.78)', fontSize: '1.05rem' }}>
              "Todos os que estais cansados e oprimidos, e eu vos aliviarei."
            </p>

            {/* Infos rápidas */}
            <div className="flex flex-wrap gap-4 text-sm mb-8"
                 style={{ color: 'rgba(247,242,234,0.9)' }}>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 gold-text" />
                {CONFIG.data}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 gold-text" />
                {CONFIG.horario}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 gold-text" />
                {CONFIG.local}
              </span>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="px-8 py-3 text-base font-bold"
              style={{ background: 'var(--neel-gold)', color: '#0d1b3e', border: 'none' }}
              onClick={() => {
                setShowForm(true);
                setTimeout(() => document.getElementById('inscricao')
                  ?.scrollIntoView({ behavior: 'smooth' }), 80);
              }}
            >
              Garantir minha vaga
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ PALESTRANTES ═══════════════════════════════════════ */}
      <section className="py-16 px-4" style={{ background: '#fff' }}>
        <div className="max-w-3xl mx-auto font-body">
          <div className="gold-bar" />
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-10"
              style={{ color: 'var(--neel-navy)' }}>
            Palestrantes
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { nome: 'Jorge Elarrat', uf: 'RO' },
              { nome: 'Rafael Siqueira', uf: 'FJ' },
            ].map(({ nome, uf }) => (
              <Card key={nome} className="speaker-card shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-xl" style={{ color: 'var(--neel-navy)' }}>
                    {nome}
                  </CardTitle>
                  <CardDescription>
                    <span className="pill-badge">{uf}</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INFORMAÇÕES ════════════════════════════════════════ */}
      <section className="py-14 px-4 cream-bg font-body">
        <div className="max-w-3xl mx-auto">
          <div className="gold-bar" />
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-8"
              style={{ color: 'var(--neel-navy)' }}>
            Informações
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: <Calendar className="h-5 w-5" />, label: 'Data', val: CONFIG.data },
              { icon: <Clock    className="h-5 w-5" />, label: 'Horário', val: CONFIG.horario },
              { icon: <MapPin   className="h-5 w-5" />, label: 'Local',
                val: <>{CONFIG.local}<br/><span className="text-xs opacity-70">{CONFIG.endereco}</span></> },
            ].map(({ icon, label, val }) => (
              <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="mb-2 gold-text">{icon}</div>
                <p className="font-bold text-xs uppercase tracking-wide mb-1"
                   style={{ color: 'var(--neel-navy)' }}>{label}</p>
                <p style={{ color: '#374151' }}>{val}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-white shadow-sm text-sm"
               style={{ borderLeft: '4px solid var(--neel-gold)' }}>
            <strong style={{ color: 'var(--neel-navy)' }}>Apoio:</strong>
            {' '}CRENORTE &amp; FERN — Federação Espírita do RN
          </div>
        </div>
      </section>

      {/* ══ INSCRIÇÃO ══════════════════════════════════════════ */}
      <section id="inscricao" className="py-16 px-4" style={{ background: '#fff' }}>
        <div className="max-w-2xl mx-auto font-body">
          <div className="gold-bar" />
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-2"
              style={{ color: 'var(--neel-navy)' }}>
            Inscrição
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Preencha os dados abaixo para garantir sua participação.
          </p>

          {!showForm ? (
            <Button
              size="lg"
              className="submit-btn w-full sm:w-auto px-10 py-3 text-base"
              onClick={() => setShowForm(true)}
            >
              Realizar inscrição
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Card className="form-card shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-display text-xl" style={{ color: 'var(--neel-navy)' }}>
                  <User className="inline mr-2 h-5 w-5" />
                  Dados do participante
                </CardTitle>
                <button onClick={() => setShowForm(false)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400">
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Nome */}
                  <div>
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input id="nome" name="nome" value={form.nome}
                           onChange={handleChange} required
                           placeholder="Seu nome completo" />
                  </div>

                  {/* CPF */}
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input id="cpf" name="cpf" value={form.cpf}
                           onChange={handleChange} required
                           placeholder="000.000.000-00" maxLength={14}
                           className={form.cpf
                             ? cpfErr  ? 'border-red-400 bg-red-50'
                             : cpfOk   ? 'border-green-500 bg-green-50' : ''
                             : ''} />
                    {cpfErr && <p className="text-red-500 text-xs mt-1">⚠️ {cpfErr}</p>}
                    {cpfOk && !cpfErr && <p className="text-green-600 text-xs mt-1">✅ CPF válido</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input id="email" name="email" type="email" value={form.email}
                           onChange={handleChange} required placeholder="seu@email.com" />
                  </div>

                  {/* WhatsApp com confirmação */}
                  <div className="p-4 rounded-lg border-2 space-y-3"
                       style={{ borderColor: '#bfdbfe', background: '#eff6ff' }}>
                    <p className="text-sm font-semibold" style={{ color: '#1e40af' }}>
                      📲 Digite seu WhatsApp com atenção — o comprovante será enviado por aqui
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">WhatsApp *</Label>
                        <Input id="phone" name="phone" value={form.phone}
                               onChange={handleChange} required
                               placeholder="(84) 99999-9999" maxLength={15}
                               className={form.phone
                                 ? telErr ? 'border-red-400 bg-red-50'
                                 : telOk  ? 'border-green-500 bg-green-50' : ''
                                 : ''} />
                      </div>
                      <div>
                        <Label htmlFor="phoneConfirm">Confirme o WhatsApp *</Label>
                        <Input id="phoneConfirm" name="phoneConfirm" value={form.phoneConfirm}
                               onChange={handleChange} required
                               placeholder="(84) 99999-9999" maxLength={15}
                               className={form.phoneConfirm
                                 ? telErr ? 'border-red-400 bg-red-50'
                                 : telOk  ? 'border-green-500 bg-green-50' : ''
                                 : ''} />
                      </div>
                    </div>
                    {telErr && <p className="text-red-600 text-sm">⚠️ {telErr}</p>}
                    {telOk  && (
                      <p className="text-green-700 text-sm">
                        ✅ WhatsApp confirmado: <strong>{form.phone}</strong>
                      </p>
                    )}
                  </div>

                  {/* Pagamento — só exibe se houver preço */}
                  {isPaid && (
                    <div>
                      <Label className="block mb-2">Forma de pagamento *</Label>
                      <div className="space-y-2">

                        <div className={`pay-option ${form.paymentMethod === 'pix' ? 'selected' : ''}`}
                             onClick={() => setPayMethod('pix')}>
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                              form.paymentMethod === 'pix'
                                ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'}`} />
                            <div>
                              <span className="font-bold">PIX</span>
                              <span className="ml-2 text-sm text-gray-500">
                                R$ {CONFIG.precoBase.toFixed(2).replace('.',',')} — sem taxas
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={`pay-option ${form.paymentMethod === 'credit' ? 'selected' : ''}`}
                             onClick={() => setPayMethod('credit')}>
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                              form.paymentMethod === 'credit'
                                ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'}`} />
                            <div>
                              <span className="font-bold text-sm">💳 Cartão de crédito</span>
                              <span className="block text-xs text-gray-500">em até 2x (com juros)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {form.paymentMethod === 'credit' && (
                        <div className="mt-3">
                          <Label className="text-sm">Parcelas</Label>
                          <select
                            value={form.installments}
                            onChange={e => setForm(p => ({ ...p, installments: parseInt(e.target.value) }))}
                            className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm mt-1"
                          >
                            <option value={1}>
                              1x de R$ {calcTotal('credit',1).total.toFixed(2).replace('.',',')} (à vista)
                            </option>
                            <option value={2}>
                              2x de R$ {calcTotal('credit',2).parcela.toFixed(2).replace('.',',')} (com juros)
                            </option>
                          </select>
                        </div>
                      )}

                      <div className="mt-4 rounded-xl p-4 text-center"
                           style={{ background: '#fdf8ef', border: '1px solid #e9d8a6' }}>
                        <p className="text-xs uppercase tracking-wide font-bold mb-1"
                           style={{ color: 'var(--neel-navy)' }}>Total</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--neel-navy)' }}>
                          R$ {total.toFixed(2).replace('.',',')}
                        </p>
                        {form.paymentMethod === 'credit' && form.installments > 1 && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {form.installments}x de R$ {parcela.toFixed(2).replace('.',',')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Botão */}
                  <Button type="submit"
                          className="submit-btn w-full py-5 text-base tracking-wide"
                          disabled={loading || !telOk || !cpfOk}>
                    {loading ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processando...</>
                    ) : (
                      isPaid ? 'CONTINUAR PARA PAGAMENTO' : 'CONFIRMAR INSCRIÇÃO'
                    )}
                  </Button>

                  {(!telOk || !cpfOk) && (form.phone || form.cpf) && (
                    <p className="text-xs text-center text-red-400">
                      ⚠️ Confirme o WhatsApp e verifique o CPF para habilitar o botão
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* ══ CONTATO ════════════════════════════════════════════ */}
      <section className="py-14 px-4 cream-bg font-body">
        <div className="max-w-3xl mx-auto">
          <div className="gold-bar" />
          <h2 className="font-display text-3xl font-semibold mb-6"
              style={{ color: 'var(--neel-navy)' }}>
            Informações &amp; Contato
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <Phone className="h-5 w-5 gold-text mb-2" />
              <p className="font-bold mb-1" style={{ color: 'var(--neel-navy)' }}>WhatsApp</p>
              <p>{CONFIG.whatsapp1}</p>
              <p>{CONFIG.whatsapp2}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <Mail className="h-5 w-5 gold-text mb-2" />
              <p className="font-bold mb-1" style={{ color: 'var(--neel-navy)' }}>Instagram</p>
              <p>{CONFIG.instagram}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <MapPin className="h-5 w-5 gold-text mb-2" />
              <p className="font-bold mb-1" style={{ color: 'var(--neel-navy)' }}>Local</p>
              <p>{CONFIG.local}</p>
              <p className="text-xs text-gray-500 mt-0.5">{CONFIG.endereco}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════ */}
      <footer className="navy-bg text-white py-8 text-center font-body text-sm px-4">
        <p className="gold-text font-display text-lg mb-1">2º Seminário Espírita do NEEL</p>
        <p className="opacity-60 text-xs">{CONFIG.data} · {CONFIG.local} · Natal‑RN</p>
        <p className="opacity-40 text-xs mt-3">Apoio: CRENORTE &amp; FERN</p>
      </footer>
    </>
  );
}

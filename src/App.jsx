import React, { useState, useEffect } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

import {
  MapPin,
  Clock,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Phone,
  Mail,
  Shield,
  Heart,
  CheckCircle,
  ArrowRight,
  User,
  X,
  Star,
  Sparkles,
  Zap,
  Instagram,
} from 'lucide-react';

// ── Fontes Google carregadas programaticamente (funciona no Vercel) ────────────
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap';

function App() {

  // Injeta o link de fontes no <head> uma única vez
  useEffect(() => {
    if (!document.getElementById('neel-fonts')) {
      const link = document.createElement('link');
      link.id   = 'neel-fonts';
      link.rel  = 'stylesheet';
      link.href = FONTS_URL;
      document.head.appendChild(link);
    }

    // Injeta CSS global de tipografia e variáveis
    if (!document.getElementById('neel-styles')) {
      const style = document.createElement('style');
      style.id = 'neel-styles';
      style.textContent = `
        :root {
          --navy:  #0d1b3e;
          --gold:  #c8973a;
          --gold2: #e8b44a;
          --cream: #faf7f2;
        }
        body { font-family: 'Jost', sans-serif; background: var(--cream); }

        .neel-display {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: -0.01em;
        }
        .neel-label {
          font-family: 'Jost', sans-serif;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.7rem;
        }
        .neel-body { font-family: 'Jost', sans-serif; }

        /* Divisor dourado */
        .gold-divider {
          width: 56px; height: 3px;
          background: linear-gradient(90deg, var(--gold), var(--gold2));
          border-radius: 2px;
          margin: 0 auto;
        }

        /* Animação de entrada */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .7s ease both; }
        .fade-up-2 { animation: fadeUp .7s .15s ease both; }
        .fade-up-3 { animation: fadeUp .7s .3s ease both; }

        /* Card refinado */
        .neel-card {
          border: none !important;
          box-shadow: 0 4px 24px rgba(13,27,62,.08);
          border-radius: 1.25rem !important;
          overflow: hidden;
        }

        /* Botão primário */
        .btn-gold {
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          color: #fff;
          font-family: 'Jost', sans-serif;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: none;
          transition: filter .2s, transform .15s;
        }
        .btn-gold:hover { filter: brightness(1.08); transform: translateY(-2px); }

        /* Botão outline hero */
        .btn-outline-hero {
          border: 2px solid rgba(255,255,255,.65) !important;
          color: #fff !important;
          background: transparent !important;
          font-family: 'Jost', sans-serif;
          font-weight: 500;
          backdrop-filter: blur(4px);
          transition: background .2s, border-color .2s;
        }
        .btn-outline-hero:hover {
          background: rgba(255,255,255,.15) !important;
          border-color: #fff !important;
        }

        /* Input refinado */
        .neel-input {
          border: 1.5px solid #e2e8f0 !important;
          border-radius: .75rem !important;
          height: 3rem !important;
          font-family: 'Jost', sans-serif !important;
          transition: border-color .2s !important;
        }
        .neel-input:focus { border-color: var(--gold) !important; box-shadow: 0 0 0 3px rgba(200,151,58,.15) !important; }
        .neel-input.valid   { border-color: #22c55e !important; background: #f0fdf4 !important; }
        .neel-input.invalid { border-color: #ef4444 !important; background: #fef2f2 !important; }

        /* Opção de pagamento */
        .pay-opt {
          border: 1.5px solid #e2e8f0;
          border-radius: .875rem;
          padding: 1.1rem 1.25rem;
          cursor: pointer;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .pay-opt:hover  { border-color: #c8973a; box-shadow: 0 2px 12px rgba(200,151,58,.12); }
        .pay-opt.active { border-color: var(--gold); background: #fffbf0; box-shadow: 0 2px 16px rgba(200,151,58,.2); }

        /* Select de parcelas */
        .neel-select {
          height: 3rem; padding: 0 1rem;
          border: 1.5px solid #e2e8f0; border-radius: .75rem;
          background: #fff; font-family: 'Jost', sans-serif; font-weight: 500;
          transition: border-color .2s;
          width: 100%;
        }
        .neel-select:focus { outline: none; border-color: var(--gold); }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ============================================
  // TAXAS DE ANTECIPAÇÃO
  // ============================================
  const TAXA_ANTECIPACAO_VISTA = 0.025;
  const TAXA_ANTECIPACAO_PARCELADO = 0.03;

  const calcularTaxaAntecipacao = (valorBase, numParcelas) => {
    if (numParcelas === 1) {
      return valorBase * TAXA_ANTECIPACAO_VISTA;
    } else {
      const somaMeses = (numParcelas * (numParcelas + 1)) / 2;
      const valorParcela = valorBase / numParcelas;
      return valorParcela * TAXA_ANTECIPACAO_PARCELADO * somaMeses;
    }
  };

  // Estados para o formulário
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nomeParticipante: '',
    cpf: '',
    email: '',
    phone: '',
    phoneConfirm: '',
    paymentMethod: 'pix',
    installments: 1,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const [cpfError, setCpfError] = useState('');
  const [cpfValid, setCpfValid] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0; let resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1,i)) * (11-i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9,10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1,i)) * (12-i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.substring(10,11));
  };

  const formatarTelefone = (value) => value
    .replace(/\D/g,'')
    .replace(/^(\d{2})(\d)/,'($1) $2')
    .replace(/(\d{5})(\d)/,'$1-$2')
    .replace(/(-\d{4})\d+?$/,'$1');

  const telDigits = (v) => (v || '').replace(/\D/g,'');

  const scrollToSection = (sectionId) =>
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });

  const showInscricaoForm = () => {
    setShowForm(true);
    setTimeout(() => document.getElementById('formulario-inscricao')
      ?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const PRECO_BASE = 100.0;

  const calculatePrice = (parcelas = null) => {
    const numParcelas = parcelas ?? (parseInt(formData.installments) || 1);
    let valorTotal = PRECO_BASE;
    if (formData.paymentMethod === 'credit') {
      const taxaPercentual = numParcelas === 1 ? 0.0399 : 0.0449;
      const taxaFixa = 0.49;
      const taxaCartao = PRECO_BASE * taxaPercentual;
      const taxaAntecipacao = calcularTaxaAntecipacao(PRECO_BASE, numParcelas);
      valorTotal = PRECO_BASE + taxaCartao + taxaFixa + taxaAntecipacao;
    }
    return { valorTotal, valorParcela: valorTotal / numParcelas };
  };

  const { valorTotal, valorParcela } = calculatePrice();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      const cpfValue = value.replace(/\D/g,'')
        .replace(/(\d{3})(\d)/,'$1.$2')
        .replace(/(\d{3})(\d)/,'$1.$2')
        .replace(/(\d{3})(\d{1,2})$/,'$1-$2');
      setFormData(p => ({ ...p, [name]: cpfValue }));
      const raw = cpfValue.replace(/[^\d]/g,'');
      if (!raw)             { setCpfError(''); setCpfValid(false); }
      else if (raw.length < 11) { setCpfError('CPF deve ter 11 dígitos'); setCpfValid(false); }
      else if (validarCPF(raw)) { setCpfError(''); setCpfValid(true); }
      else                      { setCpfError('CPF inválido. Verifique os números digitados.'); setCpfValid(false); }
    } else if (name === 'phone') {
      const formatted = formatarTelefone(value);
      setFormData(p => ({ ...p, phone: formatted }));
      const digits = telDigits(formatted);
      if (!digits) { setPhoneError(''); setPhoneValid(false); return; }
      if (digits.length < 11) { setPhoneError('Telefone deve ter 11 dígitos com DDD'); setPhoneValid(false); return; }
      const confirmDigits = telDigits(formData.phoneConfirm);
      if (confirmDigits && confirmDigits !== digits) { setPhoneError('Os telefones não coincidem'); setPhoneValid(false); }
      else if (confirmDigits && confirmDigits === digits) { setPhoneError(''); setPhoneValid(true); }
      else { setPhoneError(''); setPhoneValid(false); }
    } else if (name === 'phoneConfirm') {
      const formatted = formatarTelefone(value);
      setFormData(p => ({ ...p, phoneConfirm: formatted }));
      const digits = telDigits(formatted);
      const originalDigits = telDigits(formData.phone);
      if (!digits) { setPhoneError(''); setPhoneValid(false); return; }
      if (digits !== originalDigits) { setPhoneError('Os telefones não coincidem'); setPhoneValid(false); }
      else if (digits.length === 11) { setPhoneError(''); setPhoneValid(true); }
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.nomeParticipante.trim()) { alert('Por favor, preencha seu nome completo.'); return false; }
    const raw = formData.cpf.replace(/[^\d]/g,'');
    if (!raw || raw.length !== 11) { alert('Por favor, preencha um CPF válido.'); return false; }
    if (!validarCPF(raw)) { alert('CPF inválido. Verifique os números digitados.'); return false; }
    if (telDigits(formData.phone).length < 11) { alert('Por favor, preencha um WhatsApp válido com DDD.'); return false; }
    if (telDigits(formData.phone) !== telDigits(formData.phoneConfirm)) { alert('Os telefones não coincidem.'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsProcessing(true);
    try {
      const response = await fetch('https://SEU-WEBHOOK-AQUI/inscricoes-neel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeParticipante: formData.nomeParticipante,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
          paymentMethod: formData.paymentMethod,
          installments: formData.installments,
          ticketQuantity: 1,
          amount: valorTotal,
          timestamp: new Date().toISOString(),
          event: 'NEEL-2SeminarioEspirita',
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success === false) { alert(responseData.message || 'Erro ao processar dados.'); return; }
        if (responseData.paymentUrl) {
          setPaymentUrl(responseData.paymentUrl);
          setInscriptionSuccess(true);
          window.location.href = responseData.paymentUrl;
        } else {
          alert('Erro: Link de pagamento não encontrado. Entre em contato conosco.');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro ao enviar dados para o servidor');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar inscrição. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Tela de sucesso ──────────────────────────────────────────────────────────
  if (inscriptionSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 neel-body"
           style={{ background: 'var(--cream)' }}>
        <Card className="neel-card w-full max-w-md">
          <CardHeader className="text-center py-10 rounded-t-xl"
                      style={{ background: 'linear-gradient(135deg, var(--navy), #1a3a7a)' }}>
            <div className="mx-auto mb-4 p-3 rounded-full w-fit" style={{ background: 'rgba(255,255,255,.15)' }}>
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="neel-display text-white text-2xl">Inscrição Registrada!</CardTitle>
            <CardDescription className="text-blue-200 mt-1">Finalize o pagamento para confirmar sua participação</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4 pt-8 px-8 pb-8">
            <p className="text-sm text-gray-500">
              Dados registrados com sucesso. Clique abaixo para ir ao pagamento.
            </p>
            {paymentUrl && (
              <a href={paymentUrl}
                 className="btn-gold block w-full py-4 px-6 rounded-xl text-center text-lg font-bold no-underline"
                 style={{ textDecoration: 'none' }}>
                💳 Ir para o Pagamento
              </a>
            )}
            {paymentUrl && (
              <p className="text-xs text-gray-400 break-all select-all p-2 bg-gray-50 rounded-lg cursor-text">
                {paymentUrl}
              </p>
            )}
            <Button variant="outline" className="w-full rounded-xl" onClick={() => window.location.reload()}>
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Render principal ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen neel-body" style={{ background: 'var(--cream)' }}>

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '100svh' }}>

        {/* ▸ CORREÇÃO DESKTOP: backgroundPosition 'center 15%' mostra o rosto/torso
              do Jesus tanto em tela larga quanto no mobile. Não use bg-center puro
              com imagens retrato — ele centraliza verticalmente e corta o rosto.   */}
        <div className="absolute inset-0"
             style={{
               backgroundImage: "url('./assets/hero.jpg')",
               backgroundSize: 'cover',
               backgroundPosition: 'center 15%',   // ← a correção está aqui
               backgroundRepeat: 'no-repeat',
             }} />

        {/* Overlay em degradê — mais escuro embaixo para o texto flutuar bem */}
        <div className="absolute inset-0"
             style={{
               background: 'linear-gradient(to bottom, rgba(8,18,40,.3) 0%, rgba(8,18,40,.52) 50%, rgba(8,18,40,.82) 100%)',
             }} />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-24"
             style={{ minHeight: '100svh' }}>
          <div className="max-w-2xl text-center">

            {/* Badge superior */}
            <div className="flex items-center justify-center gap-2 mb-5 fade-up">
              <Sparkles className="h-4 w-4" style={{ color: 'var(--gold2)' }} />
              <span className="neel-label" style={{ color: 'var(--gold2)', fontSize: '.72rem' }}>
                2º Seminário Espírita do NEEL
              </span>
              <Sparkles className="h-4 w-4" style={{ color: 'var(--gold2)' }} />
            </div>

            {/* Título principal */}
            <h1 className="neel-display fade-up-2"
                style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', color: '#fff',
                         lineHeight: 1.05, fontWeight: 600, marginBottom: '1.25rem' }}>
              Vinde a Mim
            </h1>

            {/* Citação */}
            <p className="fade-up-2"
               style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
                        fontSize: 'clamp(1rem, 3vw, 1.3rem)', color: 'rgba(255,255,255,.82)',
                        marginBottom: '2.5rem', lineHeight: 1.6 }}>
              "Todos os que estais cansados e oprimidos, e eu vos aliviarei."
            </p>

            {/* CTAs */}
            <div className="fade-up-3 flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <button className="btn-gold w-full sm:w-auto flex items-center justify-center gap-2
                                  px-8 py-4 rounded-full text-base"
                      onClick={showInscricaoForm}>
                Garantir Minha Vaga
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="btn-outline-hero w-full sm:w-auto px-8 py-4 rounded-full text-base"
                      onClick={() => scrollToSection('sobre')}>
                Saiba Mais
              </button>
            </div>

            {/* Infos rápidas */}
            <div className="fade-up-3 grid grid-cols-3 gap-4 text-white text-center">
              {[
                { icon: <Calendar className="h-5 w-5" />, top: '31 de Outubro', sub: '2026' },
                { icon: <Clock     className="h-5 w-5" />, top: '08h às 17h',   sub: 'Dia inteiro' },
                { icon: <MapPin    className="h-5 w-5" />, top: 'Cidade Alta',  sub: 'Natal, RN' },
              ].map(({ icon, top, sub }) => (
                <div key={top} className="flex flex-col items-center gap-1">
                  <span style={{ color: 'var(--gold2)' }}>{icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{top}</span>
                  <span style={{ opacity: .65, fontSize: '.75rem' }}>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ RESUMO DO EVENTO ═════════════════════════════════════════════════════ */}
      <section id="sobre" className="py-20 px-4" style={{ background: '#fff' }}>
        <div className="container mx-auto max-w-3xl">

          <div className="text-center mb-12">
            <h2 className="neel-display" style={{ fontSize: 'clamp(2rem,5vw,3rem)', color: 'var(--navy)', marginBottom: '.75rem' }}>
              Resumo do Evento
            </h2>
            <div className="gold-divider" />
          </div>

          <Card className="neel-card mb-10">
            <CardContent className="p-8 md:p-10">
              <div className="space-y-7">
                {[
                  { icon: <Sparkles className="h-5 w-5" />, label: 'Tema',        text: 'Vinde a Mim — 2º Seminário Espírita do NEEL' },
                  { icon: <MapPin   className="h-5 w-5" />, label: 'Local',       text: 'Auditório SESC Cidade Alta, Natal-RN' },
                  { icon: <Users    className="h-5 w-5" />, label: 'Palestrantes',text: 'Jorge Elarrat (RO) e Rafael Siqueira (RJ)' },
                  { icon: <Heart    className="h-5 w-5" />, label: 'Realização',  text: 'NEEL — Centro Espírita Esperança de Luz' },
                  { icon: <Shield   className="h-5 w-5" />, label: 'Apoio',       text: 'CRENORTE e FERN' },
                ].map(({ icon, label, text }) => (
                  <div key={label} className="flex items-start gap-4">
                    <span className="mt-1 flex-shrink-0" style={{ color: 'var(--gold)' }}>{icon}</span>
                    <div>
                      <p className="neel-label mb-0.5" style={{ color: '#9ca3af' }}>{label}</p>
                      <p className="neel-display" style={{ fontSize: '1.2rem', color: 'var(--navy)', lineHeight: 1.35 }}>
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #f0ebe0', marginTop: '2rem', paddingTop: '2rem' }}>
                <p className="neel-label mb-4" style={{ color: '#9ca3af' }}>
                  <Phone className="inline h-4 w-4 mr-1" style={{ color: 'var(--gold)' }} />
                  Dúvidas? Fale Conosco:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { href: 'https://wa.me/5584991335975', icon: <Phone className="h-4 w-4" style={{ color: '#22c55e' }} />, text: '(84) 9 9133-5975' },
                    { href: 'https://wa.me/5584988049371', icon: <Phone className="h-4 w-4" style={{ color: '#22c55e' }} />, text: '(84) 9 8804-9371' },
                    { href: 'https://instagram.com/neelsga', icon: <Instagram className="h-4 w-4" style={{ color: '#e1306c' }} />, text: '@neelsga', full: true },
                  ].map(({ href, icon, text, full }) => (
                    <a key={text} href={href}
                       className={`flex items-center gap-2 p-3 rounded-xl no-underline transition-shadow hover:shadow-md ${full ? 'sm:col-span-2' : ''}`}
                       style={{ background: '#faf7f2', border: '1.5px solid #f0ebe0', color: 'var(--navy)', fontWeight: 600, fontSize: '.9rem' }}>
                      {icon} {text}
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ══ INSCRIÇÃO ════════════════════════════════════════════════════════════ */}
      <section id="custos" className="py-20 px-4" style={{ background: 'var(--cream)' }}>
        <div className="container mx-auto max-w-3xl">

          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4"
                  style={{ background: 'var(--gold)', color: '#fff', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              1º Lote Disponível
            </span>
            <h2 className="neel-display" style={{ fontSize: 'clamp(2rem,5vw,3rem)', color: 'var(--navy)', marginBottom: '.75rem' }}>
              Inscrição
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Garanta sua vaga no valor promocional de lançamento</p>
            <div className="gold-divider mt-4" />
          </div>

          {/* Card de valor */}
          <Card className="neel-card mb-8">
            <div className="py-10 text-center rounded-t-xl"
                 style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a7a 100%)' }}>
              <p className="neel-label mb-2" style={{ color: 'rgba(255,255,255,.55)' }}>Valor do Investimento</p>
              <p className="neel-display" style={{ fontSize: 'clamp(3rem,10vw,4.5rem)', color: '#fff', fontWeight: 700, lineHeight: 1 }}>
                R$ 100,00
              </p>
              <p style={{ color: 'rgba(255,255,255,.55)', marginTop: '.5rem', fontSize: '.95rem' }}>por participante</p>
            </div>

            <CardContent className="p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="neel-display mb-4" style={{ fontSize: '1.2rem', color: 'var(--navy)' }}>O que está incluso:</p>
                  <ul className="space-y-3">
                    {['Acesso total às palestras', 'Material de apoio exclusivo', 'Coffee break completo', 'Certificado digital'].map(item => (
                      <li key={item} className="flex items-center gap-3" style={{ fontSize: '.95rem', color: '#374151' }}>
                        <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--gold)' }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl p-6" style={{ background: '#fffbf0', border: '1.5px solid #f0e0b0' }}>
                  <p className="neel-display mb-4" style={{ fontSize: '1.2rem', color: 'var(--navy)' }}>Formas de pagamento:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3" style={{ fontSize: '.9rem', color: '#374151' }}>
                      <Zap className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                      <span><strong>PIX</strong> — sem taxas, confirmação imediata</span>
                    </li>
                    <li className="flex items-start gap-3" style={{ fontSize: '.9rem', color: '#374151' }}>
                      <CreditCard className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                      <span><strong>Cartão</strong> — parcele em até 4× (com juros)</span>
                    </li>
                    <li className="flex items-start gap-3" style={{ fontSize: '.9rem', color: '#374151' }}>
                      <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                      <span>Transação 100% segura via Asaas</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f0ebe0', paddingTop: '2rem', textAlign: 'center' }}>
                {!showForm ? (
                  <button className="btn-gold inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg"
                          onClick={showInscricaoForm}>
                    Fazer Minha Inscrição Agora
                    <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <Button variant="outline" className="rounded-full px-8" onClick={() => setShowForm(false)}>
                    <X className="mr-2 h-4 w-4" /> Fechar Formulário
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── FORMULÁRIO ────────────────────────────────────────────────────── */}
          {showForm && (
            <Card id="formulario-inscricao" className="neel-card">
              <div className="px-8 pt-8 pb-6 rounded-t-xl"
                   style={{ background: 'linear-gradient(135deg, var(--navy), #1a3a7a)' }}>
                <h3 className="neel-display text-white flex items-center gap-3" style={{ fontSize: '1.5rem' }}>
                  <User className="h-5 w-5" style={{ color: 'var(--gold2)' }} />
                  Dados para Inscrição
                </h3>
                <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.88rem', marginTop: '.25rem' }}>
                  Informe seus dados corretamente para receber o comprovante
                </p>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                  {/* Dados */}
                  <div>
                    <p className="neel-display mb-5 flex items-center gap-2"
                       style={{ fontSize: '1.15rem', color: 'var(--navy)' }}>
                      <User className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                      Dados do Participante
                    </p>
                    <div className="space-y-4">
                      <div>
                        <Label className="neel-label mb-1.5 block" style={{ color: '#6b7280', fontSize: '.7rem' }}>
                          Nome completo *
                        </Label>
                        <Input id="nomeParticipante" name="nomeParticipante"
                               value={formData.nomeParticipante} onChange={handleInputChange}
                               required placeholder="Seu nome completo" className="neel-input" />
                      </div>

                      {/* WhatsApp */}
                      <div className="p-5 rounded-xl space-y-4"
                           style={{ background: '#fffbf0', border: '1.5px solid #f0e0b0' }}>
                        <p className="flex items-center gap-2 text-sm font-semibold"
                           style={{ color: '#92400e' }}>
                          <Phone className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                          O comprovante será enviado para este WhatsApp — digite com atenção!
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="neel-label mb-1.5 block" style={{ color: '#6b7280', fontSize: '.7rem' }}>WhatsApp *</Label>
                            <Input id="phone" name="phone" value={formData.phone}
                                   onChange={handleInputChange} required placeholder="(84) 99999-9999"
                                   maxLength="15"
                                   className={`neel-input ${formData.phone ? (phoneError ? 'invalid' : phoneValid ? 'valid' : '') : ''}`} />
                          </div>
                          <div>
                            <Label className="neel-label mb-1.5 block" style={{ color: '#6b7280', fontSize: '.7rem' }}>Confirme o WhatsApp *</Label>
                            <Input id="phoneConfirm" name="phoneConfirm" value={formData.phoneConfirm}
                                   onChange={handleInputChange} required placeholder="(84) 99999-9999"
                                   maxLength="15"
                                   className={`neel-input ${formData.phoneConfirm ? (phoneError ? 'invalid' : phoneValid ? 'valid' : '') : ''}`} />
                          </div>
                        </div>
                        {phoneError && <p className="text-red-600 text-sm flex items-center gap-1"><X className="h-3 w-3" />{phoneError}</p>}
                        {phoneValid && <p className="text-green-700 text-sm flex items-center gap-1"><CheckCircle className="h-3 w-3" />WhatsApp confirmado!</p>}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="neel-label mb-1.5 block" style={{ color: '#6b7280', fontSize: '.7rem' }}>E-mail *</Label>
                          <Input id="email" name="email" type="email" value={formData.email}
                                 onChange={handleInputChange} required placeholder="seu@email.com"
                                 className="neel-input" />
                        </div>
                        <div>
                          <Label className="neel-label mb-1.5 block" style={{ color: '#6b7280', fontSize: '.7rem' }}>CPF *</Label>
                          <Input id="cpf" name="cpf" value={formData.cpf}
                                 onChange={handleInputChange} required placeholder="000.000.000-00"
                                 maxLength="14"
                                 className={`neel-input ${formData.cpf ? (cpfError ? 'invalid' : cpfValid ? 'valid' : '') : ''}`} />
                          {cpfError && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><X className="h-3 w-3" />{cpfError}</p>}
                          {cpfValid && !cpfError && <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1"><CheckCircle className="h-3 w-3" />CPF válido</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pagamento */}
                  <div>
                    <p className="neel-display mb-5 flex items-center gap-2"
                       style={{ fontSize: '1.15rem', color: 'var(--navy)' }}>
                      <CreditCard className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                      Forma de Pagamento *
                    </p>
                    <div className="space-y-3 mb-6">
                      {/* PIX */}
                      <div className={`pay-opt ${formData.paymentMethod === 'pix' ? 'active' : ''}`}
                           onClick={() => setFormData(p => ({ ...p, paymentMethod: 'pix', installments: 1 }))}>
                        <div className="flex items-center gap-4">
                          <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
                               style={{ borderColor: formData.paymentMethod === 'pix' ? 'var(--gold)' : '#d1d5db',
                                        background: formData.paymentMethod === 'pix' ? 'var(--gold)' : 'transparent' }} />
                          <div>
                            <p className="font-bold" style={{ color: 'var(--navy)', fontFamily: "'Jost', sans-serif" }}>PIX</p>
                            <p className="text-sm" style={{ color: '#6b7280' }}>R$ 100,00 — sem taxas</p>
                          </div>
                        </div>
                      </div>
                      {/* Cartão */}
                      <div className={`pay-opt ${formData.paymentMethod === 'credit' ? 'active' : ''}`}
                           onClick={() => setFormData(p => ({ ...p, paymentMethod: 'credit', installments: 1 }))}>
                        <div className="flex items-center gap-4">
                          <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
                               style={{ borderColor: formData.paymentMethod === 'credit' ? 'var(--gold)' : '#d1d5db',
                                        background: formData.paymentMethod === 'credit' ? 'var(--gold)' : 'transparent' }} />
                          <div>
                            <p className="font-bold" style={{ color: 'var(--navy)', fontFamily: "'Jost', sans-serif" }}>Cartão de Crédito</p>
                            <p className="text-sm" style={{ color: '#22c55e', fontWeight: 600 }}>Parcele em até 4× (com juros)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.paymentMethod === 'credit' && (
                      <div className="mb-6">
                        <Label className="neel-label mb-2 block" style={{ color: '#6b7280', fontSize: '.7rem' }}>Número de Parcelas</Label>
                        <select className="neel-select"
                                value={formData.installments}
                                onChange={e => setFormData(p => ({ ...p, installments: parseInt(e.target.value) }))}>
                          {[1,2,3,4].map(n => (
                            <option key={n} value={n}>
                              {n}× de R$ {calculatePrice(n).valorParcela.toFixed(2).replace('.',',')} {n===1 ? '(à vista)' : '(com juros)'}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs mt-1.5" style={{ color: '#9ca3af' }}>* Taxas de cartão aplicadas ao valor total</p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="rounded-2xl p-6 text-center"
                         style={{ background: 'linear-gradient(135deg, #fffbf0, #fef3c7)', border: '1.5px solid #f0e0b0' }}>
                      <p className="neel-label mb-2" style={{ color: '#92400e', fontSize: '.68rem' }}>Valor Final</p>
                      <p className="neel-display" style={{ fontSize: '2.5rem', color: 'var(--navy)', fontWeight: 700 }}>
                        R$ {valorTotal.toFixed(2).replace('.',',')}
                      </p>
                      {formData.paymentMethod === 'credit' && formData.installments > 1 && (
                        <p className="text-sm font-semibold mt-1" style={{ color: '#92400e' }}>
                          {formData.installments}× de R$ {valorParcela.toFixed(2).replace('.',',')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit"
                          className="btn-gold w-full flex items-center justify-center gap-3 py-5 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isProcessing || !phoneValid || !cpfValid}>
                    {isProcessing ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Processando...</>
                    ) : (
                      <>FINALIZAR E IR PARA PAGAMENTO <ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>

                  {!phoneValid && formData.phone && (
                    <p className="text-xs text-center text-red-500">
                      ⚠️ Confirme o WhatsApp corretamente para habilitar o botão
                    </p>
                  )}
                  <p className="text-xs text-center" style={{ color: '#9ca3af' }}>
                    Você será redirecionado para o ambiente seguro de pagamento do Asaas
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════════ */}
      <footer className="py-12 text-center px-4" style={{ background: 'var(--navy)' }}>
        <p className="neel-display text-white mb-3" style={{ fontSize: '1.2rem' }}>
          2º Seminário Espírita do NEEL
        </p>
        <div className="flex justify-center gap-5 mb-4">
          <a href="https://instagram.com/neelsga" style={{ color: 'rgba(255,255,255,.5)', transition: 'color .2s' }}
             onMouseOver={e=>e.currentTarget.style.color='var(--gold2)'}
             onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,.5)'}>
            <Instagram className="h-5 w-5" />
          </a>
          <a href="https://wa.me/5584991335975" style={{ color: 'rgba(255,255,255,.5)', transition: 'color .2s' }}
             onMouseOver={e=>e.currentTarget.style.color='var(--gold2)'}
             onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,.5)'}>
            <Phone className="h-5 w-5" />
          </a>
        </div>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.8rem' }}>
          © 2026 NEEL — Centro Espírita Esperança de Luz. Todos os direitos reservados.
        </p>
        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.72rem', marginTop: '.25rem' }}>
          31 de Outubro de 2026 — Natal, RN
        </p>
      </footer>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
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

function App() {

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

  // Estados para validação de CPF
  const [cpfError, setCpfError] = useState('');
  const [cpfValid, setCpfValid] = useState(false);

  // Estados para validação de telefone
  const [phoneError, setPhoneError] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);

  // Função para validar CPF
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  // Formata telefone: (84) 99999-9999
  const formatarTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const telDigits = (v) => (v || '').replace(/\D/g, '');

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const showInscricaoForm = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('formulario-inscricao')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ============================================
  // CÁLCULO DE PREÇO
  // Cartão: à vista (1x) ou parcelado em até 4x (com juros)
  // ============================================
  const PRECO_BASE = 100.0;  // ← Valor do 1º Lote

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

    const valorParcela = valorTotal / numParcelas;
    return { valorTotal, valorParcela };
  };

  const { valorTotal, valorParcela } = calculatePrice();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      const cpfValue = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

      setFormData((prev) => ({ ...prev, [name]: cpfValue }));

      const cpfSemMascara = cpfValue.replace(/[^\d]/g, '');

      if (cpfSemMascara.length === 0) {
        setCpfError('');
        setCpfValid(false);
      } else if (cpfSemMascara.length < 11) {
        setCpfError('CPF deve ter 11 dígitos');
        setCpfValid(false);
      } else if (cpfSemMascara.length === 11) {
        if (validarCPF(cpfSemMascara)) {
          setCpfError('');
          setCpfValid(true);
        } else {
          setCpfError('CPF inválido. Verifique os números digitados.');
          setCpfValid(false);
        }
      }
    } else if (name === 'phone') {
      const formatted = formatarTelefone(value);
      setFormData((prev) => ({ ...prev, phone: formatted }));
      const digits = telDigits(formatted);

      if (!digits) { setPhoneError(''); setPhoneValid(false); return; }
      if (digits.length < 11) { setPhoneError('Telefone deve ter 11 dígitos com DDD'); setPhoneValid(false); return; }

      const confirmDigits = telDigits(formData.phoneConfirm);
      if (confirmDigits && confirmDigits !== digits) {
        setPhoneError('Os telefones não coincidem'); setPhoneValid(false);
      } else if (confirmDigits && confirmDigits === digits) {
        setPhoneError(''); setPhoneValid(true);
      } else {
        setPhoneError(''); setPhoneValid(false);
      }
    } else if (name === 'phoneConfirm') {
      const formatted = formatarTelefone(value);
      setFormData((prev) => ({ ...prev, phoneConfirm: formatted }));
      const digits = telDigits(formatted);
      const originalDigits = telDigits(formData.phone);

      if (!digits) { setPhoneError(''); setPhoneValid(false); return; }
      if (digits !== originalDigits) {
        setPhoneError('Os telefones não coincidem'); setPhoneValid(false);
      } else if (digits.length === 11) {
        setPhoneError(''); setPhoneValid(true);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.nomeParticipante.trim()) {
      alert('Por favor, preencha seu nome completo.');
      return false;
    }

    const cpfSemMascara = formData.cpf.replace(/[^\d]/g, '');
    if (!cpfSemMascara || cpfSemMascara.length !== 11) {
      alert('Por favor, preencha um CPF válido.');
      return false;
    }
    if (!validarCPF(cpfSemMascara)) {
      alert('CPF inválido. Verifique os números digitados.');
      return false;
    }

    if (telDigits(formData.phone).length < 11) {
      alert('Por favor, preencha um WhatsApp válido com DDD.');
      return false;
    }
    if (telDigits(formData.phone) !== telDigits(formData.phoneConfirm)) {
      alert('Os telefones não coincidem. Verifique e tente novamente.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const response = await fetch('https://SEU-WEBHOOK-AQUI/inscricoes-neel', {  // ← substitua pela sua URL
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
        console.log('Resposta do webhook:', responseData);

        if (responseData.success === false) {
          alert(responseData.message || 'Erro ao processar dados. Tente novamente.');
          return;
        }

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

  if (inscriptionSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="mx-auto mb-4 p-3 bg-white/20 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-white text-2xl">Inscrição Registrada!</CardTitle>
            <CardDescription className="text-blue-100">Finalize o pagamento para confirmar sua participação</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4 pt-8">
            <p className="text-sm text-muted-foreground">
              Os dados foram registrados com sucesso. Clique no botão abaixo para ir para a página de pagamento.
            </p>

            {paymentUrl && (
              <a
                href={paymentUrl}
                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg text-center text-lg transition-all transform hover:scale-105 shadow-lg"
                style={{ textDecoration: 'none' }}
              >
                Ir para Pagamento
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 z-10"></div>
        <div className="absolute inset-0 bg-[url('./assets/hero.jpg')] bg-cover bg-center"></div>
        
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-20">
          <div className="max-w-2xl text-center space-y-6 animate-fade-in">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-yellow-300 text-sm font-semibold tracking-widest uppercase">2º Seminário Espírita do NEEL</span>
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight drop-shadow-lg">
              Vinde a Mim
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-100 font-light italic drop-shadow-md">
              "Todos os que estais cansados e oprimidos, e eu vos aliviarei."
            </p>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all w-full sm:w-auto"
                onClick={showInscricaoForm}
              >
                Garantir Minha Vaga
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-full w-full sm:w-auto"
                onClick={() => scrollToSection('sobre')}
              >
                Saiba Mais
              </Button>
            </div>

            <div className="pt-12 grid grid-cols-3 gap-4 md:gap-8 text-white text-center">
              <div className="space-y-2">
                <Calendar className="h-6 w-6 mx-auto text-yellow-300" />
                <p className="text-sm font-semibold">31 de Outubro</p>
                <p className="text-xs opacity-80">2026</p>
              </div>
              <div className="space-y-2">
                <Clock className="h-6 w-6 mx-auto text-yellow-300" />
                <p className="text-sm font-semibold">08h às 17h</p>
                <p className="text-xs opacity-80">Dia inteiro</p>
              </div>
              <div className="space-y-2">
                <MapPin className="h-6 w-6 mx-auto text-yellow-300" />
                <p className="text-sm font-semibold">Cidade Alta</p>
                <p className="text-xs opacity-80">Natal, RN</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE O EVENTO - RESUMO DIRETO */}
      <section id="sobre" className="section-padding bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-blue-900 mb-4">Resumo do Evento</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <Card className="border-0 shadow-xl overflow-hidden mb-12">
            <CardContent className="p-8 md:p-12 space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm uppercase text-gray-500 font-bold tracking-wider">Tema</p>
                      <p className="text-xl font-serif text-blue-900">Vinde a Mim — 2º Seminário Espírita do NEEL</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm uppercase text-gray-500 font-bold tracking-wider">Local</p>
                      <p className="text-xl font-serif text-blue-900">Auditório SESC Cidade Alta, Natal-RN</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm uppercase text-gray-500 font-bold tracking-wider">Palestrantes</p>
                      <p className="text-xl font-serif text-blue-900">Jorge Elarrat (RO) e Rafael Siqueira (RJ)</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Heart className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm uppercase text-gray-500 font-bold tracking-wider">Realização</p>
                      <p className="text-xl font-serif text-blue-900">NEEL — Centro Espírita Esperança de Luz</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm uppercase text-gray-500 font-bold tracking-wider">Apoio</p>
                      <p className="text-xl font-serif text-blue-900">CRENORTE e FERN</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Dúvidas? Fale Conosco:
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <a href="https://wa.me/5584991335975" className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <Phone className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-semibold">(84) 9 9133-5975</span>
                  </a>
                  <a href="https://wa.me/5584988049371" className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <Phone className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-semibold">(84) 9 8804-9371</span>
                  </a>
                  <a href="https://instagram.com/neelsga" className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow sm:col-span-2">
                    <Instagram className="h-4 w-4 text-pink-600 mr-2" />
                    <span className="text-sm font-semibold">@neelsga (Instagram)</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* INGRESSO E FORMULÁRIO */}
      <section id="custos" className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold px-4 py-1 rounded-full animate-pulse">
              1º LOTE DISPONÍVEL
            </Badge>
            <h2 className="text-4xl md:text-5xl font-serif text-blue-900 mb-4">Inscrição</h2>
            <p className="text-lg text-gray-700">
              Garanta sua vaga no valor promocional de lançamento
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-blue-600 mx-auto rounded-full mt-4"></div>
          </div>

          <Card className="mb-8 border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg text-center py-10">
              <p className="text-blue-100 uppercase tracking-widest font-bold mb-2">Valor do Investimento</p>
              <CardTitle className="text-6xl font-serif">R$ 100,00</CardTitle>
              <CardDescription className="text-blue-100 text-lg mt-2">por participante</CardDescription>
            </CardHeader>
            <CardContent className="pt-10">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h4 className="font-serif text-xl text-blue-900 mb-2">O que está incluso:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700">Acesso total às palestras</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700">Material de apoio exclusivo</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700">Coffee break completo</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700">Certificado digital</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                  <h4 className="font-serif text-xl text-blue-900 mb-4">Formas de Pagamento</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">PIX: Sem taxas e confirmação imediata</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CreditCard className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Cartão: Parcele em até 4x (com juros)</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">Transação 100% segura via Asaas</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="text-center">
                {!showForm ? (
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-12 py-8 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all"
                    onClick={showInscricaoForm}
                  >
                    Fazer Minha Inscrição Agora
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-300 px-8 py-6 text-lg rounded-full font-semibold"
                    onClick={() => setShowForm(false)}
                  >
                    <X className="mr-2 h-5 w-5" />
                    Fechar Formulário
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* FORMULÁRIO */}
          {showForm && (
            <Card id="formulario-inscricao" className="border-0 shadow-2xl animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white text-2xl">
                  <User className="mr-3 h-6 w-6" />
                  Dados para Inscrição
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Informe seus dados corretamente para receber o comprovante
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                  {/* Dados do Participante */}
                  <div>
                    <h3 className="text-lg font-serif text-blue-900 mb-6 flex items-center">
                      <User className="mr-3 h-5 w-5 text-yellow-500" />
                      Dados do Participante
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nomeParticipante" className="text-gray-700 font-semibold">Nome completo *</Label>
                        <Input
                          id="nomeParticipante"
                          name="nomeParticipante"
                          value={formData.nomeParticipante}
                          onChange={handleInputChange}
                          required
                          placeholder="Seu nome completo"
                          className="mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-lg h-12"
                        />
                      </div>

                      {/* TELEFONE COM CONFIRMAÇÃO */}
                      <div className="p-6 rounded-xl border-2 border-yellow-300 bg-yellow-50 space-y-4">
                        <p className="text-sm font-semibold text-yellow-800 flex items-center">
                          <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                          O comprovante será enviado para este WhatsApp:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone" className="text-gray-700 font-semibold">WhatsApp *</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              placeholder="(84) 99999-9999"
                              maxLength="15"
                              className={`mt-2 border-2 rounded-lg transition-colors h-12 ${
                                formData.phone && phoneError
                                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                                  : formData.phone && phoneValid
                                  ? 'border-green-500 bg-green-50 focus:border-green-600'
                                  : 'border-gray-200 focus:border-blue-500'
                              }`}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phoneConfirm" className="text-gray-700 font-semibold">Confirme o WhatsApp *</Label>
                            <Input
                              id="phoneConfirm"
                              name="phoneConfirm"
                              value={formData.phoneConfirm}
                              onChange={handleInputChange}
                              required
                              placeholder="(84) 99999-9999"
                              maxLength="15"
                              className={`mt-2 border-2 rounded-lg transition-colors h-12 ${
                                formData.phoneConfirm && phoneError
                                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                                  : formData.phoneConfirm && phoneValid
                                  ? 'border-green-500 bg-green-50 focus:border-green-600'
                                  : 'border-gray-200 focus:border-blue-500'
                              }`}
                            />
                          </div>
                        </div>
                        {phoneError && (
                          <p className="text-red-700 text-sm font-medium flex items-center">
                            <X className="h-4 w-4 mr-2" />
                            {phoneError}
                          </p>
                        )}
                        {phoneValid && (
                          <p className="text-green-700 text-sm font-medium flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            WhatsApp confirmado!
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="text-gray-700 font-semibold">E-mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="seu@email.com"
                            className="mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-lg h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf" className="text-gray-700 font-semibold">CPF *</Label>
                          <Input
                            id="cpf"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleInputChange}
                            required
                            placeholder="000.000.000-00"
                            maxLength="14"
                            className={`mt-2 border-2 rounded-lg transition-colors h-12 ${
                              formData.cpf && cpfError
                                ? 'border-red-500 bg-red-50 focus:border-red-600'
                                : formData.cpf && cpfValid
                                ? 'border-green-500 bg-green-50 focus:border-green-600'
                                : 'border-gray-200 focus:border-blue-500'
                            }`}
                          />
                          {cpfError && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                              <X className="h-4 w-4 mr-1" />
                              {cpfError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Método de Pagamento */}
                  <div>
                    <h3 className="text-lg font-serif text-blue-900 mb-6 flex items-center">
                      <CreditCard className="mr-3 h-5 w-5 text-yellow-500" />
                      Escolha a Forma de Pagamento *
                    </h3>

                    <div className="space-y-3 mb-6">
                      {/* PIX */}
                      <div
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-102 ${
                          formData.paymentMethod === 'pix'
                            ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'pix', installments: 1 }))}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mr-4 transition-all ${
                              formData.paymentMethod === 'pix'
                                ? 'border-yellow-500 bg-yellow-500'
                                : 'border-gray-300'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-lg font-bold text-gray-900">PIX</p>
                            <p className="text-sm text-gray-600">R$ 100,00 (sem taxas)</p>
                          </div>
                        </div>
                      </div>

                      {/* CARTÃO */}
                      <div
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-102 ${
                          formData.paymentMethod === 'credit'
                            ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'credit', installments: 1 }))}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mr-4 transition-all ${
                              formData.paymentMethod === 'credit'
                                ? 'border-yellow-500 bg-yellow-500'
                                : 'border-gray-300'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-lg font-bold text-gray-900">Cartão de Crédito</p>
                            <p className="text-sm text-green-600 font-medium">Parcele em até 4x (com juros)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SELETOR DE PARCELAS - ATÉ 4X */}
                    {formData.paymentMethod === 'credit' && (
                      <div className="mb-6">
                        <Label className="text-gray-700 font-semibold">Número de Parcelas</Label>
                        <select
                          value={formData.installments}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, installments: parseInt(e.target.value) }))
                          }
                          className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 bg-white text-gray-900 font-semibold mt-2 focus:border-blue-500 transition-colors"
                        >
                          {[1, 2, 3, 4].map((n) => (
                            <option key={n} value={n}>
                              {n}x de R$ {calculatePrice(n).valorParcela.toFixed(2).replace('.', ',')} {n === 1 ? '(à vista)' : '(com juros)'}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                          * Taxas de cartão aplicadas ao valor total
                        </p>
                      </div>
                    )}

                    {/* Valor Total */}
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-6 rounded-xl border-2 border-yellow-300">
                      <div className="text-center">
                        <h4 className="text-lg font-serif text-yellow-900 mb-2">Valor Final</h4>
                        <div className="text-4xl font-bold text-yellow-900">
                          R$ {valorTotal.toFixed(2).replace('.', ',')}
                        </div>
                        {formData.paymentMethod === 'credit' && formData.installments > 1 && (
                          <div className="text-sm text-yellow-800 mt-3 font-semibold">
                            {formData.installments}x de R$ {valorParcela.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão de Envio */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-8 text-xl font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing || !phoneValid || !cpfValid}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        FINALIZAR E IR PARA PAGAMENTO
                        <ArrowRight className="ml-3 h-6 w-6" />
                      </>
                    )}
                  </Button>

                  {!phoneValid && formData.phone && (
                    <p className="text-xs text-center text-red-600 font-medium">
                      <X className="h-4 w-4 inline mr-1" />
                      Confirme o WhatsApp corretamente para habilitar o botão
                    </p>
                  )}

                  <p className="text-xs text-center text-gray-600">
                    Você será redirecionado para o ambiente seguro de pagamento do Asaas
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-lg font-serif">2º Seminário Espírita do NEEL</p>
          <div className="flex justify-center space-x-6 py-4">
             <a href="https://instagram.com/neelsga" className="hover:text-yellow-400 transition-colors"><Instagram className="h-6 w-6" /></a>
             <a href="https://wa.me/5584991335975" className="hover:text-yellow-400 transition-colors"><Phone className="h-6 w-6" /></a>
          </div>
          <p className="text-sm opacity-80">
            © 2026 NEEL — Centro Espírita Esperança de Luz. Todos os direitos reservados.
          </p>
          <p className="text-xs opacity-70">
            31 de Outubro de 2026 — Natal, RN
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

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
  // Cartão: à vista (1x) ou parcelado em 2x (com juros)
  // ============================================
  const PRECO_BASE = 40.0;  // ← altere o valor do ingresso aqui

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
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50 z-10"></div>
        <div className="absolute inset-0 bg-[url('./assets/hero.jpg')] bg-cover bg-center"></div>
        
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-20">
          <div className="max-w-2xl text-center space-y-6 animate-fade-in">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-yellow-300 text-sm font-semibold tracking-widest">2º SEMINÁRIO ESPÍRITA</span>
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight drop-shadow-lg">
              Vinde a Mim
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-100 font-light italic drop-shadow-md">
              "Todos os que estais cansados e oprimidos, e eu vos aliviarei."
            </p>

            <div className="pt-8 space-y-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all"
                onClick={showInscricaoForm}
              >
                Garantir Minha Vaga
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg rounded-full"
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

      {/* SOBRE O EVENTO */}
      <section id="sobre" className="section-padding bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-blue-900 mb-4">Sobre o Evento</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                O <strong>2º Seminário Espírita do NEEL</strong> é um encontro de espiritualidade, reflexão e acolhimento. Reunimos pessoas que buscam compreender melhor os ensinamentos espíritas e encontrar paz interior.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Com palestrantes renomados e uma atmosfera de harmonia, este seminário promove o crescimento espiritual e o fortalecimento da fé.
              </p>
              <div className="space-y-3 pt-4">
                <div className="flex items-start space-x-4">
                  <Zap className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Palestras Inspiradoras</h4>
                    <p className="text-sm text-gray-600">Ensinamentos profundos com especialistas renomados</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Heart className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Comunidade Acolhedora</h4>
                    <p className="text-sm text-gray-600">Encontro com pessoas que compartilham seus valores</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Star className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Experiência Transformadora</h4>
                    <p className="text-sm text-gray-600">Momentos de reflexão que marcam vidas</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 border-2 border-blue-200">
              <h3 className="text-2xl font-serif text-blue-900 mb-6">O Que Você Receberá</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-700">Acesso às palestras do dia inteiro</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-700">Material de apoio exclusivo</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-700">Coffee break durante o evento</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-700">Certificado de participação</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-700">Conexão com a comunidade espírita</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PALESTRANTES */}
      <section id="palestrantes" className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-blue-900 mb-4">Palestrantes</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl mb-6 h-64 bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <Users className="h-20 w-20 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-600 font-semibold">Foto do Palestrante</p>
                </div>
              </div>
              <h3 className="text-2xl font-serif text-blue-900 mb-2">Jorge Elarrat</h3>
              <p className="text-sm text-yellow-600 font-semibold mb-3">Rondônia (RO)</p>
              <p className="text-gray-700 leading-relaxed">
                Especialista em espiritismo com vasta experiência em palestras e orientação espiritual. Traz ensinamentos profundos e práticos para o dia a dia.
              </p>
            </div>

            <div className="group">
              <div className="relative overflow-hidden rounded-2xl mb-6 h-64 bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <Users className="h-20 w-20 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-600 font-semibold">Foto do Palestrante</p>
                </div>
              </div>
              <h3 className="text-2xl font-serif text-blue-900 mb-2">Rafael Siqueira</h3>
              <p className="text-sm text-yellow-600 font-semibold mb-3">Rio de Janeiro (RJ)</p>
              <p className="text-gray-700 leading-relaxed">
                Conferencista renomado no movimento espírita. Suas palestras tocam o coração e inspiram transformação espiritual genuína.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMAÇÕES PRÁTICAS */}
      <section id="praticas" className="section-padding bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-blue-900 mb-4">Informações Práticas</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-6 w-6" />
                  <CardTitle>Local</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="font-semibold text-gray-900 mb-2">Auditório SESC Cidade Alta</p>
                <p className="text-sm text-gray-600">
                  Rua Coronel Bozerra, 33<br />
                  Cidade Alta, Natal - RN
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6" />
                  <CardTitle>Data e Hora</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="font-semibold text-gray-900 mb-2">31 de Outubro de 2026</p>
                <p className="text-sm text-gray-600">
                  Início: 08h00<br />
                  Término: 17h00
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6" />
                  <CardTitle>Público</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  Aberto para todas as pessoas interessadas em espiritismo e crescimento espiritual. Não é necessário ser espírita para participar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <Heart className="h-6 w-6" />
                  <CardTitle>Apoio</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  <strong>CRENORTE</strong><br />
                  <strong>FERN</strong> — Federação Espírita do RN
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* IMPORTANTE */}
      <section id="documentacao" className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-blue-900 mb-4">Importante — Leia</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-600">
              <div className="flex items-start space-x-4">
                <Calendar className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-800">
                    O evento acontecerá no dia <strong>31 de outubro de 2026 (sábado)</strong>, das <strong>08h às 17h</strong>, no Auditório SESC Cidade Alta.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-600">
              <div className="flex items-start space-x-4">
                <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-800">
                    O ingresso é <strong>individual e intransferível</strong>. Apresente o comprovante de pagamento no dia do evento.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-600">
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-800">
                    O comprovante de pagamento e as informações de acesso serão enviados para o <strong>WhatsApp informado no cadastro</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-l-4 border-red-600">
              <div className="flex items-start space-x-4">
                <X className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-red-800 font-semibold">
                    Após o pagamento, não será permitido o reembolso.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INGRESSO E FORMULÁRIO */}
      <section id="custos" className="section-padding bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-blue-900 mb-4">Ingresso</h2>
            <p className="text-lg text-gray-700">
              Garanta sua vaga no 2º Seminário Espírita do NEEL
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-blue-600 mx-auto rounded-full mt-4"></div>
          </div>

          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg text-center">
              <CardTitle className="text-5xl font-serif">R$ 40,00</CardTitle>
              <CardDescription className="text-blue-100 text-lg">por participante</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-serif text-xl text-blue-900 mb-4">O ingresso inclui:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700">Acesso às palestras do dia inteiro</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700">Material de apoio exclusivo</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700">Coffee break</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700">Certificado de participação</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
                  <h4 className="font-serif text-xl text-red-900 mb-4">Informações Importantes</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">Ingresso individual e intransferível</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CreditCard className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">PIX (sem taxas) ou Cartão em até 2x (com juros)</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">Sem reembolso após pagamento</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="text-center">
                {!showForm ? (
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all"
                    onClick={showInscricaoForm}
                  >
                    Garantir Minha Vaga
                    <ArrowRight className="ml-3 h-5 w-5" />
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
            <Card id="formulario-inscricao" className="border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white text-2xl">
                  <User className="mr-3 h-6 w-6" />
                  Formulário de Inscrição
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Preencha todos os dados para confirmar sua participação
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
                          className="mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                        />
                      </div>

                      {/* TELEFONE COM CONFIRMAÇÃO */}
                      <div className="p-6 rounded-xl border-2 border-yellow-300 bg-yellow-50 space-y-4">
                        <p className="text-sm font-semibold text-yellow-800 flex items-center">
                          <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                          O comprovante será enviado para este WhatsApp — digite com atenção!
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
                              className={`mt-2 border-2 rounded-lg transition-colors ${
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
                              className={`mt-2 border-2 rounded-lg transition-colors ${
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
                            WhatsApp confirmado! O comprovante será enviado para <strong className="ml-1">{formData.phone}</strong>
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
                            className="mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
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
                            className={`mt-2 border-2 rounded-lg transition-colors ${
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
                          {cpfValid && !cpfError && (
                            <p className="text-green-600 text-sm mt-2 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              CPF válido
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
                      Método de Pagamento *
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
                            <p className="text-sm text-gray-600">R$ 40,00 (sem taxas)</p>
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
                            <p className="text-sm text-green-600 font-medium">Parcele em até 2x (com juros)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SELETOR DE PARCELAS */}
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
                          <option value={1}>
                            1x de R$ {calculatePrice(1).valorTotal.toFixed(2).replace('.', ',')} (à vista)
                          </option>
                          <option value={2}>
                            2x de R$ {calculatePrice(2).valorParcela.toFixed(2).replace('.', ',')} (com juros)
                          </option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                          * Taxas de cartão aplicadas ao valor total
                        </p>
                      </div>
                    )}

                    {/* Valor Total */}
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-6 rounded-xl border-2 border-yellow-300">
                      <div className="text-center">
                        <h4 className="text-lg font-serif text-yellow-900 mb-2">Valor Total</h4>
                        <div className="text-sm text-gray-700 mb-3">
                          Ingresso por participante
                          {formData.paymentMethod === 'credit' && ' + taxas do cartão'}
                        </div>
                        <div className="text-4xl font-bold text-yellow-900">
                          R$ {valorTotal.toFixed(2).replace('.', ',')}
                        </div>
                        {formData.paymentMethod === 'credit' && formData.installments > 1 && (
                          <div className="text-sm text-yellow-800 mt-3 font-semibold">
                            {formData.installments}x de R$ {valorParcela.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                        {formData.paymentMethod === 'credit' && (
                          <div className="text-xs text-yellow-700 mt-2">(inclui taxas do cartão)</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão de Envio */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing || !phoneValid || !cpfValid}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        CONTINUAR PARA PAGAMENTO
                        <ArrowRight className="ml-3 h-5 w-5" />
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
                    Ao finalizar, você será redirecionado para o pagamento via Asaas
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-blue-900 mb-4">Entre em Contato</h2>
            <p className="text-lg text-gray-700">Tire suas dúvidas conosco</p>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-blue-600 mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="h-6 w-6" />
                  <div>
                    <CardTitle>WhatsApp</CardTitle>
                    <CardDescription className="text-blue-100">NEEL — Atendimento</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-lg font-semibold text-gray-900">(84) 9 9133-5975</p>
                <p className="text-lg font-semibold text-gray-900">(84) 9 8804-9371</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-6 w-6" />
                  <div>
                    <CardTitle>Instagram</CardTitle>
                    <CardDescription className="text-blue-100">Acompanhe nossas novidades</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-lg font-semibold text-gray-900">@neelsga</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
            <p className="text-gray-800">
              <strong className="text-blue-900">NEEL — Centro Espírita Esperança de Luz</strong>
              <br />
              <span className="text-sm text-gray-700">Apoio: CRENORTE & FERN — Federação Espírita do RN</span>
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4 text-center space-y-3">
          <p className="text-sm">
            © 2026 NEEL — Centro Espírita Esperança de Luz. Todos os direitos reservados.
          </p>
          <p className="text-xs opacity-80">
            2º Seminário Espírita do NEEL — 31 de Outubro de 2026 — Natal, RN
          </p>
          <p className="text-xs opacity-70 pt-2">
            Desenvolvido com dedicação e espiritualidade
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

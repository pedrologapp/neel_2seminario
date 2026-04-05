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
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Inscrição Registrada!</CardTitle>
            <CardDescription>Finalize o pagamento para confirmar a sua participação</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Os dados foram registrados com sucesso. Clique no botão abaixo para ir para a página de pagamento.
            </p>

            {paymentUrl && (
              <a
                href={paymentUrl}
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-center text-lg transition-colors"
                style={{ textDecoration: 'none' }}
              >
                💳 IR PARA O PAGAMENTO
              </a>
            )}

            <p className="text-xs text-gray-500">
              Se o botão não abrir, copie e cole o link abaixo no seu navegador:
            </p>

            {paymentUrl && (
              <div className="p-3 bg-gray-100 rounded border text-xs text-gray-700 break-all select-all cursor-text text-left">
                {paymentUrl}
              </div>
            )}

            <Button onClick={() => window.location.reload()} variant="outline" className="w-full mt-2">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen smooth-scroll">

      {/* HEADER */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-900">NEEL — Centro Espírita Esperança de Luz</h1>
            <div className="hidden md:flex space-x-6">
              <button onClick={() => scrollToSection('sobre')} className="text-sm hover:text-primary transition-colors">Sobre</button>
              <button onClick={() => scrollToSection('itinerario')} className="text-sm hover:text-primary transition-colors">Informações</button>
              <button onClick={() => scrollToSection('custos')} className="text-sm hover:text-primary transition-colors">Inscrição</button>
              <button onClick={() => scrollToSection('documentacao')} className="text-sm hover:text-primary transition-colors">Importante</button>
              <button onClick={() => scrollToSection('contato')} className="text-sm hover:text-primary transition-colors">Contato</button>
            </div>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero-section min-h-screen flex items-center justify-center text-white relative">
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Vinde a Mim
          </h1>
          <p className="text-xl md:text-2xl mb-4 opacity-90">
            2º Seminário Espírita do NEEL
          </p>
          <p className="text-base md:text-lg mb-8 opacity-80">
            "Todos os que estais cansados e oprimidos, e eu vos aliviarei."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 bg-white text-primary"
              onClick={() => scrollToSection('sobre')}
            >
              Saiba Mais
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>31 de Outubro de 2026 (Sábado)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Auditório SESC Cidade Alta — Natal, RN
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              08h às 17h
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="section-padding bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Sobre o Evento</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              O 2º Seminário Espírita do NEEL é um encontro de estudo, reflexão e fraternidade,
              voltado ao aprofundamento da <strong>Doutrina Espírita</strong> e ao fortalecimento dos laços
              de <strong>amor, caridade e esperança</strong> entre os irmãos de fé.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Um Dia de Estudo e Fraternidade</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Palestras com <strong>Jorge Elarrat (RO)</strong> e <strong>Rafael Siqueira (FJ)</strong>, convidados de destaque no movimento espírita nacional</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Programação completa das <strong>08h às 17h</strong>, com momentos de estudo, reflexão e confraternização</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Realizado no <strong>Auditório SESC Cidade Alta</strong>, espaço amplo e acolhedor em Natal-RN</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Apoio da <strong>CRENORTE</strong> e da <strong>FERN — Federação Espírita do RN</strong></p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Realização do <strong>NEEL — Centro Espírita Esperança de Luz</strong></p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <Card className="border-l-4 border-l-blue-400">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Jorge Elarrat
                  </CardTitle>
                  <CardDescription>Palestrante convidado — RO</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-l-4 border-l-blue-400">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Rafael Siqueira
                  </CardTitle>
                  <CardDescription>Palestrante convidado — FJ</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMAÇÕES */}
      <section id="itinerario" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Informações do Evento</h2>
            <p className="text-lg text-muted-foreground">
              Confira todos os detalhes do 2º Seminário Espírita do NEEL
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Data e Horário</CardTitle>
                <CardDescription>31 de Outubro de 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center font-semibold text-blue-600">
                  08h às 17h
                </p>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Sábado
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                  <MapPin className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Local</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center font-semibold">
                  Auditório SESC Cidade Alta
                </p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Rua Coronel Bezerra, 33<br />Cidade Alta, Natal — RN
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>Palestrantes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center">
                  <strong>Jorge Elarrat</strong> (RO)<br />
                  <strong>Rafael Siqueira</strong> (FJ)
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-pink-100 rounded-full w-fit">
                  <Heart className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle>Apoio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center">
                  CRENORTE<br />
                  FERN — Federação Espírita do RN
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
            <h2 className="text-4xl font-bold mb-4">IMPORTANTE — LEIA</h2>
          </div>

          <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">
                  O evento acontecerá no dia <strong>31/10/2026 (sábado)</strong>,
                  das <strong>08h às 17h</strong>, no Auditório SESC Cidade Alta.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">
                  O ingresso é <strong>individual e intransferível</strong>. Apresente o comprovante de pagamento no dia do evento.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">
                  O comprovante de pagamento e as informações de acesso serão enviados para o <strong>WhatsApp informado no cadastro</strong>.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">
                  Dúvidas? Entre em contato pelos canais disponíveis na seção <strong>Contato</strong> desta página.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-red-700 font-semibold">
                  ⚠️ Após o pagamento, não será permitido o reembolso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALOR DO INGRESSO E FORMULÁRIO */}
      <section id="custos" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ingresso</h2>
            <p className="text-lg text-muted-foreground">
              Garanta sua vaga no 2º Seminário Espírita do NEEL
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-primary">R$ 40,00</CardTitle>
              <CardDescription>por participante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-accent">O ingresso inclui:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Acesso às palestras do dia inteiro
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Material de apoio
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Coffee break
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-destructive">Informações importantes:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      <span>Ingresso individual e intransferível</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      <span>Pagamento via PIX (sem taxas) ou cartão de crédito em até 2x (com juros)</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      Após o pagamento, não será permitido o reembolso.
                    </li>
                  </ul>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="text-center">
                {!showForm ? (
                  <Button
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700 px-8 py-3"
                    onClick={showInscricaoForm}
                  >
                    Garantir minha vaga
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-3"
                    onClick={() => setShowForm(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Fechar Formulário
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {!showForm
                    ? 'Preencha seus dados e escolha a forma de pagamento'
                    : 'Clique acima para fechar o formulário'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FORMULÁRIO */}
          {showForm && (
            <Card id="formulario-inscricao" className="border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <User className="mr-2 h-5 w-5" />
                  Formulário de Inscrição
                </CardTitle>
                <CardDescription>
                  Preencha todos os dados para confirmar sua participação no seminário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Dados do Participante */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Mail className="mr-2 h-5 w-5" />
                      Dados do Participante
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nomeParticipante">Nome completo *</Label>
                        <Input
                          id="nomeParticipante"
                          name="nomeParticipante"
                          value={formData.nomeParticipante}
                          onChange={handleInputChange}
                          required
                          placeholder="Seu nome completo"
                        />
                      </div>

                      {/* TELEFONE COM CONFIRMAÇÃO */}
                      <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50 space-y-3">
                        <p className="text-sm font-semibold text-blue-800 flex items-center">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                          📲 O comprovante de pagamento será enviado para este WhatsApp — digite com atenção!
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">WhatsApp *</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              placeholder="(84) 99999-9999"
                              maxLength="15"
                              className={
                                formData.phone && phoneError
                                  ? 'border-red-500 bg-red-50'
                                  : formData.phone && phoneValid
                                  ? 'border-green-500 bg-green-50'
                                  : ''
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="phoneConfirm">Confirme o WhatsApp *</Label>
                            <Input
                              id="phoneConfirm"
                              name="phoneConfirm"
                              value={formData.phoneConfirm}
                              onChange={handleInputChange}
                              required
                              placeholder="(84) 99999-9999"
                              maxLength="15"
                              className={
                                formData.phoneConfirm && phoneError
                                  ? 'border-red-500 bg-red-50'
                                  : formData.phoneConfirm && phoneValid
                                  ? 'border-green-500 bg-green-50'
                                  : ''
                              }
                            />
                          </div>
                        </div>
                        {phoneError && (
                          <p className="text-red-600 text-sm font-medium flex items-center">
                            <span className="mr-1">⚠️</span> {phoneError}
                          </p>
                        )}
                        {phoneValid && (
                          <p className="text-green-700 text-sm font-medium flex items-center">
                            ✅ WhatsApp confirmado! O comprovante será enviado para{' '}
                            <strong className="ml-1">{formData.phone}</strong>
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="seu@email.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF *</Label>
                          <Input
                            id="cpf"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleInputChange}
                            required
                            placeholder="000.000.000-00"
                            maxLength="14"
                            className={`${
                              formData.cpf && cpfError
                                ? 'border-red-500 bg-red-50'
                                : formData.cpf && cpfValid
                                ? 'border-green-500 bg-green-50'
                                : ''
                            }`}
                          />
                          {cpfError && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <span className="mr-1">⚠️</span>
                              {cpfError}
                            </p>
                          )}
                          {cpfValid && !cpfError && (
                            <p className="text-green-600 text-sm mt-1 flex items-center">
                              <span className="mr-1">✅</span>
                              CPF válido
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Método de Pagamento */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Método de Pagamento *</h3>

                    <div className="space-y-3 mb-6">
                      {/* PIX */}
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.paymentMethod === 'pix'
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'pix', installments: 1 }))}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full border-2 mr-3 ${
                              formData.paymentMethod === 'pix'
                                ? 'border-orange-400 bg-orange-400'
                                : 'border-gray-300'
                            }`}
                          />
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold">PIX</span>
                            <span className="text-sm">
                              R$ 40,00 (sem taxas)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CARTÃO */}
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.paymentMethod === 'credit'
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'credit', installments: 1 }))}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full border-2 mr-3 ${
                              formData.paymentMethod === 'credit'
                                ? 'border-orange-400 bg-orange-400'
                                : 'border-gray-300'
                            }`}
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">💳</span>
                              <span className="text-sm font-medium">Cartão de Crédito</span>
                            </div>
                            <div className="text-xs text-green-600 ml-6 font-medium">
                              Parcele em até 2x (com juros)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SELETOR DE PARCELAS — aparece só no cartão */}
                    {formData.paymentMethod === 'credit' && (
                      <div className="mb-6">
                        <Label className="text-sm font-medium">Número de Parcelas</Label>
                        <select
                          value={formData.installments}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, installments: parseInt(e.target.value) }))
                          }
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2"
                        >
                          <option value={1}>
                            1x de R$ {calculatePrice(1).valorTotal.toFixed(2).replace('.', ',')} (à vista)
                          </option>
                          <option value={2}>
                            2x de R$ {calculatePrice(2).valorParcela.toFixed(2).replace('.', ',')} (com juros)
                          </option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          * Taxas de cartão aplicadas ao valor total
                        </p>
                      </div>
                    )}

                    {/* Valor Total */}
                    <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                      <div className="text-center">
                        <h4 className="text-lg font-bold text-orange-800 mb-1">Valor Total</h4>
                        <div className="text-sm text-gray-600 mb-1">
                          Ingresso por participante
                          {formData.paymentMethod === 'credit' && ' + taxas do cartão'}
                        </div>
                        <div className="text-2xl font-bold text-orange-900">
                          R$ {valorTotal.toFixed(2).replace('.', ',')}
                        </div>
                        {formData.paymentMethod === 'credit' && formData.installments > 1 && (
                          <div className="text-sm text-orange-700 mt-1">
                            {formData.installments}x de R$ {valorParcela.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                        {formData.paymentMethod === 'credit' && (
                          <div className="text-xs text-orange-600 mt-1">(inclui taxas do cartão)</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão de Envio */}
                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold"
                    disabled={isProcessing || !phoneValid || !cpfValid}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      'CONTINUAR PARA PAGAMENTO'
                    )}
                  </Button>

                  {!phoneValid && formData.phone && (
                    <p className="text-xs text-center text-red-500">
                      ⚠️ Confirme o WhatsApp corretamente para habilitar o botão
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
            <h2 className="text-4xl font-bold mb-4">Entre em Contato</h2>
            <p className="text-lg text-muted-foreground">Tire suas dúvidas conosco</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Phone className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>WhatsApp</CardTitle>
                    <CardDescription>NEEL — Atendimento</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">(84) 9 9133-5975</p>
                <p className="text-lg font-semibold">(84) 9 8804-9371</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Mail className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Instagram</CardTitle>
                    <CardDescription>Acompanhe nossas novidades</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">@neelsga</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>NEEL — Centro Espírita Esperança de Luz</strong>
              <br />
              Apoio: CRENORTE &amp; FERN — Federação Espírita do RN
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2026 NEEL — Centro Espírita Esperança de Luz. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-2 opacity-80">
            2º Seminário Espírita do NEEL — 31 de Outubro de 2026 — Natal, RN
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

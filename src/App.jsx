import React, { useState, useEffect } from 'react';
import './App.css';

import heroImage from './assets/hero.jpg';

import {
  MapPin, Clock, Calendar, CreditCard, Phone,
  CheckCircle, ArrowRight, User, X, ChevronDown,
  Sparkles, Instagram, Users, Heart, HeartHandshake, UtensilsCrossed,
} from 'lucide-react';

// ⚙️ Modo manutenção — coloque false para reabrir o site normalmente
const EM_MANUTENCAO = false;

const PRECO_BASE   = 100.0;
const PRECO_ALMOCO = 25.0;

const OPCOES_ALMOCO = [
  { key: 'almocoFrango', nome: 'Frango desfiado, arroz e batata palha' },
  { key: 'almocoCarne',  nome: 'Carne ao molho madeira, arroz e batata palha' },
];

function App() {

  /* ─── Navbar: fundo sólido após rolar ───────────────────────────────────── */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── Animação de entrada das seções ────────────────────────────────────── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ─── Lógica ────────────────────────────────────────────────────────────── */
  const TAXA_ANTECIPACAO_VISTA = 0.025;
  const TAXA_ANTECIPACAO_PARCELADO = 0.03;

  const calcularTaxaAntecipacao = (valorBase, numParcelas) => {
    if (numParcelas === 1) return valorBase * TAXA_ANTECIPACAO_VISTA;
    const somaMeses = (numParcelas * (numParcelas + 1)) / 2;
    return (valorBase / numParcelas) * TAXA_ANTECIPACAO_PARCELADO * somaMeses;
  };

  const [showForm, setShowForm]   = useState(false);
  const [formData, setFormData]   = useState({
    nomeParticipante:'', cpf:'', email:'', phone:'', phoneConfirm:'',
    paymentMethod:'pix', installments:1, quantidade:1,
    almocoFrango:0, almocoCarne:0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [cpfError,  setCpfError]   = useState('');
  const [cpfValid,  setCpfValid]   = useState(false);
  const [phoneError,setPhoneError] = useState('');
  const [phoneValid,setPhoneValid] = useState(false);
  const [emailError,setEmailError] = useState('');

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g,'');
    if (cpf.length!==11||/^(\d)\1{10}$/.test(cpf)) return false;
    let s=0,r; for(let i=1;i<=9;i++) s+=parseInt(cpf[i-1])*(11-i);
    r=(s*10)%11; if(r===10||r===11) r=0; if(r!==parseInt(cpf[9])) return false;
    s=0; for(let i=1;i<=10;i++) s+=parseInt(cpf[i-1])*(12-i);
    r=(s*10)%11; if(r===10||r===11) r=0; return r===parseInt(cpf[10]);
  };

  const fmtTel = (v) => v.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2').replace(/(-\d{4})\d+?$/,'$1');
  const tdigs  = (v) => (v||'').replace(/\D/g,'');
  const scroll = (id) => document.getElementById(id)?.scrollIntoView({behavior:'smooth'});

  const openForm = () => {
    setShowForm(true);
    setTimeout(()=>document.getElementById('form-anchor')?.scrollIntoView({behavior:'smooth'}),100);
  };

  /* Quantidade de ingressos — ao diminuir, limita os almoços ao novo total */
  const decQuantidade = () => setFormData(p => {
    const q = Math.max(1, p.quantidade - 1);
    let f = p.almocoFrango, c = p.almocoCarne;
    while (f + c > q) { if (c > 0) c--; else f--; }
    return { ...p, quantidade: q, almocoFrango: f, almocoCarne: c };
  });
  const incQuantidade = () => setFormData(p => ({ ...p, quantidade: Math.min(10, p.quantidade + 1) }));

  /* Almoço — total de almoços nunca passa do nº de ingressos */
  const mudarAlmoco = (key, delta) => setFormData(p => {
    const totalAlmocos = p.almocoFrango + p.almocoCarne;
    const novo = p[key] + delta;
    if (novo < 0) return p;
    if (delta > 0 && totalAlmocos >= p.quantidade) return p;
    return { ...p, [key]: novo };
  });

  /* Preço: ingressos + almoços (taxas de cartão aplicadas proporcionalmente) */
  const calcPrice = (n=null) => {
    const np  = n ?? (parseInt(formData.installments)||1);
    const qty = formData.quantidade || 1;
    const almocos = (formData.almocoFrango||0) + (formData.almocoCarne||0);
    let tIngresso = PRECO_BASE;
    let tAlmoco   = PRECO_ALMOCO;
    if (formData.paymentMethod==='credit') {
      const pct = np===1 ? .0399 : .0449;
      tIngresso = PRECO_BASE + PRECO_BASE*pct + 0.49 + calcularTaxaAntecipacao(PRECO_BASE,np);
      tAlmoco   = PRECO_ALMOCO + PRECO_ALMOCO*pct + calcularTaxaAntecipacao(PRECO_ALMOCO,np);
    }
    const valorTotal   = tIngresso*qty + tAlmoco*almocos;
    const valorParcela = valorTotal / np;
    return { valorTotal, valorParcela, valorUnitario: tIngresso, valorAlmoco: tAlmoco, almocos };
  };
  const { valorTotal, valorParcela, valorUnitario, valorAlmoco, almocos } = calcPrice();

  const handleChange = (e) => {
    const {name,value} = e.target;
    if (name==='cpf') {
      const v = value.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
      setFormData(p=>({...p,cpf:v}));
      const r=v.replace(/\D/g,'');
      if(!r){setCpfError('');setCpfValid(false);}
      else if(r.length<11){setCpfError('CPF deve ter 11 dígitos');setCpfValid(false);}
      else if(validarCPF(r)){setCpfError('');setCpfValid(true);}
      else{setCpfError('CPF inválido');setCpfValid(false);}
    } else if (name==='phone') {
      const f=fmtTel(value); setFormData(p=>({...p,phone:f}));
      const d=tdigs(f);
      if(!d){setPhoneError('');setPhoneValid(false);return;}
      if(d.length<11){setPhoneError('WhatsApp deve ter 11 dígitos com DDD');setPhoneValid(false);return;}
      const cd=tdigs(formData.phoneConfirm);
      if(cd&&cd!==d){setPhoneError('Os números não coincidem');setPhoneValid(false);}
      else if(cd&&cd===d){setPhoneError('');setPhoneValid(true);}
      else{setPhoneError('');setPhoneValid(false);}
    } else if (name==='phoneConfirm') {
      const f=fmtTel(value); setFormData(p=>({...p,phoneConfirm:f}));
      const d=tdigs(f),od=tdigs(formData.phone);
      if(!d){setPhoneError('');setPhoneValid(false);return;}
      if(d!==od){setPhoneError('Os números não coincidem');setPhoneValid(false);}
      else if(d.length===11){setPhoneError('');setPhoneValid(true);}
    } else if (name==='email') {
      setFormData(p=>({...p,email:value}));
      if(!value.trim()) setEmailError('');
      else setEmailError(validarEmail(value)?'':'E-mail inválido');
    } else {
      setFormData(p=>({...p,[name]:value}));
    }
  };

  const validate = () => {
    if(!formData.nomeParticipante.trim()){alert('Preencha seu nome completo.');return false;}
    const r=formData.cpf.replace(/\D/g,'');
    if(!r||r.length!==11){alert('CPF inválido.');return false;}
    if(!validarCPF(r)){alert('CPF inválido.');return false;}
    if(!validarEmail(formData.email)){alert('E-mail inválido.');return false;}
    if(tdigs(formData.phone).length<11){alert('WhatsApp inválido.');return false;}
    if(tdigs(formData.phone)!==tdigs(formData.phoneConfirm)){alert('Os números de WhatsApp não coincidem.');return false;}
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!validate()) return;
    setIsProcessing(true);
    try {
      const res = await fetch('https://webhook.escolaamadeus.com/webhook/neelseminario',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          nomeParticipante:formData.nomeParticipante,
          cpf:formData.cpf,
          email:formData.email,
          phone:formData.phone,
          paymentMethod:formData.paymentMethod,
          installments:formData.installments,
          ticketQuantity:formData.quantidade,
          almocoFrango:formData.almocoFrango,
          almocoCarne:formData.almocoCarne,
          almocoQuantity:formData.almocoFrango+formData.almocoCarne,
          amount:valorTotal,
          timestamp:new Date().toISOString(),
          event:'NEEL-2SeminarioEspirita',
        }),
      });
      if(res.ok){
        const d=await res.json().catch(()=>null);
        if(!d){alert('Resposta inesperada do servidor. Tente novamente ou fale conosco pelo WhatsApp.');return;}
        if(d.success===false){alert(d.message||'Erro ao processar a inscrição.');return;}
        if(d.paymentUrl){setPaymentUrl(d.paymentUrl);setInscriptionSuccess(true);window.location.href=d.paymentUrl;}
        else alert('Link de pagamento não encontrado. Fale conosco pelo WhatsApp (84) 99133-5975.');
      } else {
        const e2=await res.json().catch(()=>null);
        alert(e2?.message||'Erro no servidor. Tente novamente em instantes.');
      }
    } catch(err){ console.error(err); alert('Erro de conexão. Tente novamente.'); }
    finally { setIsProcessing(false); }
  };

  /* ─── Tela de manutenção ────────────────────────────────────────────────── */
  if (EM_MANUTENCAO) return (
    <div style={{position:'relative',minHeight:'100svh',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,backgroundImage:`url(${heroImage})`,backgroundSize:'cover',backgroundPosition:'center 15%'}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(8,18,42,.78),rgba(8,18,42,.94))'}}/>

      <div className="fu" style={{position:'relative',zIndex:1,textAlign:'center',maxWidth:'34rem'}}>
        <p className="hero-badge" style={{margin:'0 auto 1.75rem'}}>
          <Sparkles style={{width:'.85rem',height:'.85rem'}}/> 2º Seminário Espírita do NEEL
        </p>

        <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontSize:'clamp(2.2rem,7vw,3.5rem)',color:'#fff',lineHeight:1.12,margin:'0 0 1.25rem',textShadow:'0 4px 30px rgba(0,0,0,.35)'}}>
          Estamos em manutenção
        </h1>

        <p style={{fontFamily:"'Lora',Georgia,serif",fontSize:'clamp(1rem,3vw,1.2rem)',color:'rgba(255,255,255,.82)',lineHeight:1.7,margin:'0 0 2.5rem'}}>
          Estamos aprimorando a página de inscrições e voltamos em breve.<br/>
          Agradecemos a sua compreensão. 🕊️
        </p>

        <div style={{display:'flex',flexDirection:'column',gap:'.75rem',alignItems:'center',marginBottom:'2.5rem'}}>
          <p style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.7rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--gold2)'}}>
            Enquanto isso, fale conosco
          </p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'.75rem',justifyContent:'center'}}>
            <a href="https://wa.me/5584991335975" className="btn-primary" style={{padding:'.85rem 1.75rem',fontSize:'.92rem'}}>
              <Phone style={{width:'1rem',height:'1rem'}}/> WhatsApp
            </a>
            <a href="https://instagram.com/neel.sga" className="btn-ghost-white" style={{padding:'.8rem 1.75rem',fontSize:'.92rem'}}>
              <Instagram style={{width:'1rem',height:'1rem'}}/> @neel.sga
            </a>
          </div>
        </div>

        <div style={{display:'inline-flex',flexWrap:'wrap',gap:'1.25rem',justifyContent:'center',color:'rgba(255,255,255,.7)',fontFamily:"'Lora',serif",fontSize:'.85rem'}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:'.4rem'}}><Calendar style={{width:'.95rem',height:'.95rem',color:'var(--gold2)'}}/> 31 de Outubro de 2026</span>
          <span style={{display:'inline-flex',alignItems:'center',gap:'.4rem'}}><MapPin style={{width:'.95rem',height:'.95rem',color:'var(--gold2)'}}/> SESC Cidade Alta, Natal-RN</span>
        </div>
      </div>
    </div>
  );

  /* ─── Tela de sucesso ───────────────────────────────────────────────────── */
  if (inscriptionSuccess) return (
    <div style={{minHeight:'100vh',background:'var(--cream)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
      <div className="nd-card" style={{width:'100%',maxWidth:'26rem',padding:'2.5rem',textAlign:'center'}}>
        <div style={{width:'3.5rem',height:'3.5rem',borderRadius:'50%',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
          <CheckCircle style={{color:'#16a34a',width:'1.75rem',height:'1.75rem'}}/>
        </div>
        <h2 className="nd-title" style={{fontSize:'1.6rem',marginBottom:'.5rem'}}>Inscrição Registrada!</h2>
        <p className="nd-subtitle" style={{fontSize:'.9rem',marginBottom:'1.5rem'}}>Finalize o pagamento para confirmar sua participação.</p>
        {paymentUrl && <a href={paymentUrl} className="btn-primary" style={{width:'100%',marginBottom:'1rem'}}>💳 Ir para o Pagamento</a>}
        {paymentUrl && <p style={{fontSize:'.72rem',color:'#9ca3af',wordBreak:'break-all',background:'#f9fafb',padding:'.75rem',borderRadius:'.5rem'}}>{paymentUrl}</p>}
        <button onClick={()=>window.location.reload()} style={{marginTop:'1rem',width:'100%',padding:'.75rem',border:'1.5px solid #e5e7eb',borderRadius:'9999px',background:'#fff',cursor:'pointer',fontFamily:'Lora,serif',fontWeight:600,color:'#374151'}}>Voltar ao Início</button>
      </div>
    </div>
  );

  return (
    <div style={{background:'var(--cream)',minHeight:'100vh'}}>

      {/* ══ NAVBAR ═══════════════════════════════════════════════════════════ */}
      <nav className={`navbar ${scrolled?'scrolled':''}`}>
        <div className="navbar-inner">
          <button className="brand" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>
            <span className="brand-mark">N</span>
            <span className="brand-text">
              <strong>NEEL</strong>
              <small>2º Seminário Espírita</small>
            </span>
          </button>
          <div className="nav-links">
            <button className="nav-link" onClick={()=>scroll('sobre')}>O Evento</button>
            <button className="nav-link" onClick={()=>scroll('custos')}>Ingressos</button>
            <button className="nav-cta" onClick={openForm}>Inscreva-se</button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <header className="hero">
        <div className="hero-bg" style={{backgroundImage:`url(${heroImage})`}}/>
        <div className="hero-overlay"/>

        <div className="hero-content">
          <p className="hero-badge fu">
            <Sparkles style={{width:'.85rem',height:'.85rem'}}/> 2º Seminário Espírita do NEEL
          </p>

          <h1 className="hero-title fu2">“Vinde a mim</h1>
          <p className="hero-sub fu2">
            Todos os que estais cansados e oprimidos,<br/>e eu vos aliviarei.”
          </p>

          <div className="hero-actions fu3">
            <button className="btn-primary" onClick={openForm}>
              Faça sua inscrição aqui <ArrowRight style={{width:'1.1rem',height:'1.1rem'}}/>
            </button>
            <button className="btn-ghost-white" onClick={()=>scroll('sobre')}>
              Saiba Mais
            </button>
          </div>

          <div className="hero-chips fu3">
            {[
              {icon:<Calendar size={20}/>, top:'31 de Outubro', sub:'2026 — Sábado'},
              {icon:<Clock    size={20}/>, top:'08h às 17h',    sub:'Dia inteiro'},
              {icon:<MapPin   size={20}/>, top:'Auditório SESC Cidade Alta', sub:'Rua Coronel Bezerra, 33, Cidade Alta, Natal - RN'},
            ].map(({icon,top,sub})=>(
              <div key={top} className="hero-chip">
                {icon}
                <span className="hero-chip-txt">
                  <b>{top}</b>
                  <span>{sub}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <button className="scroll-ind" onClick={()=>scroll('sobre')} aria-label="Rolar para baixo">
          <ChevronDown size={26}/>
        </button>
      </header>

      {/* ══ INFORMAÇÕES DO EVENTO ════════════════════════════════════════════ */}
      <section id="sobre" className="nd-section" style={{background:'var(--cream)'}}>
        <div style={{maxWidth:'52rem',margin:'0 auto'}}>

          <div className="reveal" style={{textAlign:'center',marginBottom:'2.75rem'}}>
            <p className="section-tag">Núcleo Espírita Esperança de Luz — NEEL</p>
            <h2 className="nd-title" style={{fontSize:'clamp(1.9rem,5vw,2.75rem)'}}>Informações do Evento</h2>
            <div className="gold-line"/>
          </div>

          {/* Tema em destaque */}
          <div className="tema-card reveal">
            <span className="tema-tag">Tema</span>
            <p className="tema-text">
              “Vinde a Mim — todos os que estais cansados e oprimidos,<br/>e eu vos aliviarei.”
            </p>
          </div>

          {/* Grid de informações */}
          <div className="info-grid reveal">
            {[
              {icon:<Calendar size={20}/>,       label:'Data',         value:'31 de Outubro de 2026 — Sábado'},
              {icon:<Clock size={20}/>,          label:'Horário',      value:'08h às 17h'},
              {icon:<MapPin size={20}/>,         label:'Local',        value:'Auditório SESC Cidade Alta — Rua Coronel Bezerra, 33, Natal-RN'},
              {icon:<Users size={20}/>,          label:'Palestrantes', value:'Jorge Elarrat (RO) e Rafael Siqueira (RJ)'},
              {icon:<Heart size={20}/>,          label:'Realização',   value:'NEEL — Centro Espírita Esperança de Luz'},
              {icon:<HeartHandshake size={20}/>, label:'Apoio',        value:'CRENORTE e FERN — Federação Espírita do RN'},
            ].map(({icon,label,value})=>(
              <div key={label} className="icard">
                <span className="icard-ic">{icon}</span>
                <div>
                  <b>{label}</b>
                  <p>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contatos */}
          <div className="nd-card reveal" style={{padding:'1.75rem 2rem',marginTop:'1.25rem'}}>
            <p className="nd-label" style={{marginBottom:'.85rem',display:'flex',alignItems:'center',gap:'.4rem'}}>
              <Phone style={{width:'.9rem',height:'.9rem',color:'var(--gold)'}}/> Dúvidas? Fale Conosco:
            </p>
            <div className="contact-grid">
              {[
                {href:'https://wa.me/5584991335975',icon:<Phone style={{width:'1rem',height:'1rem',color:'#16a34a'}}/>,text:'(84) 9 9133-5975'},
                {href:'https://wa.me/5584988049371',icon:<Phone style={{width:'1rem',height:'1rem',color:'#16a34a'}}/>,text:'(84) 9 8804-9371'},
                {href:'https://instagram.com/neel.sga',icon:<Instagram style={{width:'1rem',height:'1rem',color:'#e1306c'}}/>,text:'@neel.sga'},
              ].map(({href,icon,text})=>(
                <a key={text} href={href} className="contact-link" target="_blank" rel="noreferrer">
                  {icon}{text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ INSCRIÇÃO ════════════════════════════════════════════════════════ */}
      <section id="custos" className="nd-section" style={{background:'var(--cream)',paddingTop:'1rem'}}>
        <div style={{maxWidth:'38rem',margin:'0 auto'}}>

          <div className="reveal" style={{textAlign:'center',marginBottom:'2.25rem'}}>
            <p className="section-tag">Inscrição</p>
            <h2 className="nd-title" style={{fontSize:'clamp(1.9rem,5vw,2.75rem)'}}>Garanta sua Presença</h2>
            <div className="gold-line"/>
          </div>

          <div className="nd-card reveal" style={{marginBottom:'1.5rem',overflow:'hidden'}}>
            <div className="price-card">

              <span className="nd-tag" style={{display:'inline-block',background:'var(--gold)',color:'#fff',borderRadius:'9999px',padding:'.45rem 1.25rem',marginBottom:'1.5rem',letterSpacing:'.1em'}}>
                1º Lote Disponível
              </span>

              <p style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.68rem',letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:'.4rem'}}>
                Valor do Ingresso
              </p>

              <p className="price-num">R$&nbsp;100,00</p>

              <p style={{fontFamily:"'Lora',Georgia,serif",color:'rgba(255,255,255,.5)',fontSize:'.88rem',margin:'.4rem 0 1.5rem'}}>
                por participante
              </p>

              <p style={{fontFamily:"'Lora',Georgia,serif",color:'rgba(255,255,255,.6)',fontSize:'.82rem',margin:'0 0 .5rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'.4rem'}}>
                🎟️ QR Code de entrada enviado por WhatsApp
              </p>
              <p style={{fontFamily:"'Lora',Georgia,serif",color:'rgba(255,255,255,.6)',fontSize:'.82rem',margin:'0 0 2rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'.4rem'}}>
                🍽️ Almoço opcional por R$ 25,00 — escolha no formulário
              </p>

              <div>
                {!showForm ? (
                  <button className="btn-primary" style={{width:'100%',maxWidth:'22rem',fontSize:'1.05rem',padding:'1.1rem 2rem'}} onClick={openForm}>
                    Fazer Minha Inscrição <ArrowRight style={{width:'1.1rem',height:'1.1rem'}}/>
                  </button>
                ) : (
                  <button onClick={()=>setShowForm(false)}
                          style={{display:'inline-flex',alignItems:'center',gap:'.5rem',padding:'.9rem 2rem',borderRadius:'9999px',border:'2px solid rgba(255,255,255,.4)',background:'transparent',color:'#fff',cursor:'pointer',fontFamily:"'Lora',serif",fontWeight:600}}>
                    <X style={{width:'1rem',height:'1rem'}}/> Fechar Formulário
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── FORMULÁRIO ─────────────────────────────────────────────────── */}
          {showForm && (
            <div id="form-anchor" className="nd-card">

              <div style={{background:'linear-gradient(135deg,#0d1b3e,#1a3570)',padding:'1.75rem 2rem'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.35rem',color:'#fff',display:'flex',alignItems:'center',gap:'.6rem',margin:0}}>
                  <User style={{width:'1.1rem',height:'1.1rem',color:'var(--gold2)'}}/> Dados para Inscrição
                </h3>
                <p style={{fontFamily:"'Lora',serif",color:'rgba(255,255,255,.55)',fontSize:'.85rem',marginTop:'.25rem'}}>
                  Informe seus dados para receber o comprovante
                </p>
              </div>

              <div style={{padding:'2rem'}}>
                <form onSubmit={handleSubmit}>

                  {/* Nome */}
                  <div style={{marginBottom:'1.25rem'}}>
                    <label className="form-label">Nome completo *</label>
                    <input name="nomeParticipante" value={formData.nomeParticipante} onChange={handleChange}
                           required placeholder="Seu nome completo" className="nd-input" />
                  </div>

                  {/* Quantidade de ingressos */}
                  <div style={{marginBottom:'1.25rem'}}>
                    <label className="form-label">Quantidade de Ingressos *</label>
                    <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                      <button type="button" className="step-btn" onClick={decQuantidade} disabled={formData.quantidade<=1}>−</button>
                      <div className="step-val" style={{flex:1}}>{formData.quantidade}</div>
                      <button type="button" className="step-btn" onClick={incQuantidade} disabled={formData.quantidade>=10}>+</button>
                    </div>
                    <p style={{fontFamily:"'Lora',serif",fontSize:'.78rem',color:'#9ca3af',marginTop:'.4rem'}}>
                      R$ 100,00 por ingresso · máximo 10 por inscrição
                    </p>
                  </div>

                  {/* Almoço (opcional) */}
                  <div className="lunch-box">
                    <p className="lunch-head">
                      <UtensilsCrossed style={{width:'1rem',height:'1rem',color:'var(--gold)'}}/>
                      Almoço no local (opcional) — R$ 25,00 por pessoa
                    </p>
                    <p className="lunch-sub">
                      Se quiser, adicione almoço para cada participante (máximo de {formData.quantidade} almoço{formData.quantidade>1?'s':''} para {formData.quantidade} ingresso{formData.quantidade>1?'s':''}).
                    </p>
                    {OPCOES_ALMOCO.map(({key,nome})=>(
                      <div key={key} className={`lunch-row ${formData[key]>0?'picked':''}`}>
                        <div>
                          <p className="lunch-row-name">{nome}</p>
                          <p className="lunch-row-price">R$ 25,00</p>
                        </div>
                        <div className="lunch-stepper">
                          <button type="button" className="step-btn" onClick={()=>mudarAlmoco(key,-1)} disabled={formData[key]<=0}>−</button>
                          <div className="step-val">{formData[key]}</div>
                          <button type="button" className="step-btn" onClick={()=>mudarAlmoco(key,1)}
                                  disabled={formData.almocoFrango+formData.almocoCarne>=formData.quantidade}>+</button>
                        </div>
                      </div>
                    ))}
                    {almocos>0 && (
                      <p style={{fontFamily:"'Lora',serif",fontSize:'.8rem',color:'#92400e',marginTop:'.75rem',marginBottom:0,fontWeight:600}}>
                        🍽️ {almocos} almoço{almocos>1?'s':''} adicionado{almocos>1?'s':''} — + R$ {(valorAlmoco*almocos).toFixed(2).replace('.',',')}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div style={{background:'#fffbf0',border:'1.5px solid #f0d98a',borderRadius:'1rem',padding:'1.25rem',marginBottom:'1.25rem'}}>
                    <p style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.82rem',color:'#92400e',display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'1rem'}}>
                      <Phone style={{width:'.9rem',height:'.9rem',color:'var(--gold)'}}/> Seu QR Code de entrada no evento será enviado para este WhatsApp — digite com atenção!
                    </p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                      <div>
                        <label className="form-label">WhatsApp *</label>
                        <input name="phone" value={formData.phone} onChange={handleChange}
                               required placeholder="(84) 99999-9999" maxLength="15"
                               className={`nd-input ${formData.phone?(phoneError?'err':phoneValid?'ok':''):''}`} />
                      </div>
                      <div>
                        <label className="form-label">Confirme *</label>
                        <input name="phoneConfirm" value={formData.phoneConfirm} onChange={handleChange}
                               required placeholder="(84) 99999-9999" maxLength="15"
                               className={`nd-input ${formData.phoneConfirm?(phoneError?'err':phoneValid?'ok':''):''}`} />
                      </div>
                    </div>
                    {phoneError && <p style={{color:'#dc2626',fontSize:'.8rem',marginTop:'.5rem',display:'flex',alignItems:'center',gap:'.3rem'}}><X style={{width:'.8rem',height:'.8rem'}}/>{phoneError}</p>}
                    {phoneValid && <p style={{color:'#16a34a',fontSize:'.8rem',marginTop:'.5rem',display:'flex',alignItems:'center',gap:'.3rem'}}><CheckCircle style={{width:'.8rem',height:'.8rem'}}/>WhatsApp confirmado!</p>}
                  </div>

                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.75rem'}}>
                    <div>
                      <label className="form-label">E-mail *</label>
                      <input name="email" type="email" value={formData.email} onChange={handleChange}
                             required placeholder="seu@email.com"
                             className={`nd-input ${formData.email?(emailError?'err':'ok'):''}`} />
                      {emailError && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:'.35rem'}}>{emailError}</p>}
                    </div>
                    <div>
                      <label className="form-label">CPF *</label>
                      <input name="cpf" value={formData.cpf} onChange={handleChange}
                             required placeholder="000.000.000-00" maxLength="14"
                             className={`nd-input ${formData.cpf?(cpfError?'err':cpfValid?'ok':''):''}`} />
                      {cpfError && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:'.35rem'}}>{cpfError}</p>}
                      {cpfValid&&!cpfError && <p style={{color:'#16a34a',fontSize:'.75rem',marginTop:'.35rem'}}>✓ CPF válido</p>}
                    </div>
                  </div>

                  <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.1rem',color:'var(--navy)',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <CreditCard style={{width:'1rem',height:'1rem',color:'var(--gold)'}}/> Forma de Pagamento
                  </p>
                  <div style={{display:'flex',flexDirection:'column',gap:'.75rem',marginBottom:'1.25rem'}}>
                    <div className={`pay-row ${formData.paymentMethod==='pix'?'picked':''}`}
                         onClick={()=>setFormData(p=>({...p,paymentMethod:'pix',installments:1}))}>
                      <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                        <div className={`dot ${formData.paymentMethod==='pix'?'on':''}`}/>
                        <div>
                          <p style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.95rem',color:'var(--navy)',margin:0}}>PIX</p>
                          <p style={{fontFamily:"'Lora',serif",fontSize:'.82rem',color:'#6b7280',margin:0}}>Sem taxas</p>
                        </div>
                      </div>
                    </div>
                    <div className={`pay-row ${formData.paymentMethod==='credit'?'picked':''}`}
                         onClick={()=>setFormData(p=>({...p,paymentMethod:'credit',installments:1}))}>
                      <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                        <div className={`dot ${formData.paymentMethod==='credit'?'on':''}`}/>
                        <div>
                          <p style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.95rem',color:'var(--navy)',margin:0}}>Cartão de Crédito</p>
                          <p style={{fontFamily:"'Lora',serif",fontSize:'.82rem',color:'#16a34a',fontWeight:600,margin:0}}>Parcele em até 4× (com juros)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.paymentMethod==='credit' && (
                    <div style={{marginBottom:'1.25rem'}}>
                      <label className="form-label">Parcelas</label>
                      <select value={formData.installments}
                              onChange={e=>setFormData(p=>({...p,installments:parseInt(e.target.value)}))}
                              style={{width:'100%',height:'3rem',padding:'0 1rem',border:'1.5px solid #e5e7eb',borderRadius:'.75rem',fontFamily:"'Lora',serif",fontSize:'.92rem',background:'#fff',outline:'none'}}>
                        {[1,2,3,4].map(n=>(
                          <option key={n} value={n}>
                            {n}× de R$ {calcPrice(n).valorParcela.toFixed(2).replace('.',',')} {n===1?'(à vista)':'(com juros)'}
                          </option>
                        ))}
                      </select>
                      <p style={{fontFamily:"'Lora',serif",fontSize:'.72rem',color:'#9ca3af',marginTop:'.35rem'}}>* Taxas do cartão incluídas</p>
                    </div>
                  )}

                  {/* Valor Total — com detalhamento de ingressos e almoços */}
                  <div style={{background:'linear-gradient(135deg,#fffbf0,#fef3c7)',border:'1.5px solid #f0d98a',borderRadius:'1rem',padding:'1.25rem',textAlign:'center',marginBottom:'1.5rem'}}>
                    <p style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.68rem',letterSpacing:'.12em',textTransform:'uppercase',color:'#92400e',marginBottom:'.3rem'}}>Valor Total</p>
                    {(formData.quantidade>1 || almocos>0) && (
                      <p style={{fontFamily:"'Lora',serif",fontSize:'.82rem',color:'#92400e',marginBottom:'.25rem'}}>
                        {formData.quantidade} ingresso{formData.quantidade>1?'s':''} × R$ {valorUnitario.toFixed(2).replace('.',',')}
                        {almocos>0 && <><br/>{almocos} almoço{almocos>1?'s':''} × R$ {valorAlmoco.toFixed(2).replace('.',',')}</>}
                      </p>
                    )}
                    <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'2.25rem',color:'var(--navy)',lineHeight:1}}>
                      R$ {valorTotal.toFixed(2).replace('.',',')}
                    </p>
                    {formData.paymentMethod==='credit'&&formData.installments>1 && (
                      <p style={{fontFamily:"'Lora',serif",fontSize:'.85rem',color:'#92400e',marginTop:'.35rem',fontWeight:600}}>
                        {formData.installments}× de R$ {valorParcela.toFixed(2).replace('.',',')}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn-primary"
                          style={{width:'100%',padding:'1.1rem',fontSize:'1rem',borderRadius:'.875rem'}}
                          disabled={isProcessing||!phoneValid||!cpfValid||!validarEmail(formData.email)}>
                    {isProcessing
                      ? <><div style={{width:'1.1rem',height:'1.1rem',border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/> Processando...</>
                      : <>Finalizar e Ir para Pagamento <ArrowRight style={{width:'1.1rem',height:'1.1rem'}}/></>
                    }
                  </button>

                  {!phoneValid&&formData.phone && (
                    <p style={{textAlign:'center',fontSize:'.78rem',color:'#dc2626',marginTop:'.75rem'}}>
                      ⚠️ Confirme o WhatsApp para habilitar o botão
                    </p>
                  )}
                  <p style={{textAlign:'center',fontFamily:"'Lora',serif",fontSize:'.75rem',color:'#9ca3af',marginTop:'.75rem'}}>
                    Você será redirecionado para o pagamento seguro via Asaas
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark">N</span>
        </div>
        <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.15rem',color:'#fff',marginBottom:'.75rem'}}>
          2º Seminário Espírita do NEEL
        </p>
        <div style={{display:'flex',justifyContent:'center',gap:'1.25rem',marginBottom:'1rem'}}>
          {[
            {href:'https://instagram.com/neel.sga',icon:<Instagram style={{width:'1.2rem',height:'1.2rem'}}/>},
            {href:'https://wa.me/5584991335975',  icon:<Phone    style={{width:'1.2rem',height:'1.2rem'}}/>},
          ].map(({href,icon})=>(
            <a key={href} href={href} style={{color:'rgba(255,255,255,.4)',transition:'color .2s'}}
               onMouseOver={e=>e.currentTarget.style.color='var(--gold2)'}
               onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,.4)'}>
              {icon}
            </a>
          ))}
        </div>
        <p style={{fontFamily:"'Lora',serif",fontSize:'.78rem',color:'rgba(255,255,255,.35)'}}>
          © 2026 NEEL — Núcleo Espírita Esperança de Luz. Todos os direitos reservados.
        </p>
        <p style={{fontFamily:"'Lora',serif",fontSize:'.7rem',color:'rgba(255,255,255,.25)',marginTop:'.25rem'}}>
          31 de Outubro de 2026 — Natal, RN
        </p>
      </footer>
    </div>
  );
}

export default App;

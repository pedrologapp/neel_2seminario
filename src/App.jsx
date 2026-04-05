import React, { useState, useEffect } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Separator } from './components/ui/separator';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

import heroImage from './assets/hero.jpg';

import {
  MapPin, Clock, Calendar, Users, CreditCard, Phone,
  Shield, Heart, CheckCircle, ArrowRight, User, X,
  Sparkles, Zap, Instagram,
} from 'lucide-react';

function App() {

  useEffect(() => {
    if (document.getElementById('neel-extra')) return;
    const s = document.createElement('style');
    s.id = 'neel-extra';
    s.textContent = `
      :root {
        --navy:  #0d1b3e;
        --gold:  #b8861e;
        --gold2: #d4a732;
        --cream: #f4efe6;
        --white: #ffffff;
      }

      .nd-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        color: var(--navy);
        line-height: 1.15;
      }
      .nd-subtitle {
        font-family: 'Lora', Georgia, serif;
        font-weight: 400;
        color: #4b5563;
        line-height: 1.7;
      }
      .nd-label {
        font-family: 'Lora', Georgia, serif;
        font-weight: 600;
        font-size: .95rem;
        color: var(--navy);
      }
      .nd-value {
        font-family: 'Lora', Georgia, serif;
        font-weight: 400;
        font-size: .95rem;
        color: #374151;
      }
      .nd-tag {
        font-family: -apple-system, 'Segoe UI', sans-serif;
        font-weight: 700;
        font-size: .68rem;
        letter-spacing: .12em;
        text-transform: uppercase;
      }

      .btn-primary {
        display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
        background: var(--gold);
        color: #fff;
        font-family: -apple-system, 'Segoe UI', sans-serif;
        font-weight: 700;
        font-size: 1rem;
        letter-spacing: .03em;
        border: none; border-radius: 9999px;
        padding: 1rem 2.25rem;
        cursor: pointer;
        transition: background .2s, transform .15s, box-shadow .2s;
        box-shadow: 0 4px 16px rgba(184,134,30,.35);
        text-decoration: none;
      }
      .btn-primary:hover {
        background: var(--gold2);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(184,134,30,.45);
      }
      .btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }

      .btn-ghost-white {
        display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
        background: transparent;
        color: #fff;
        font-family: -apple-system, 'Segoe UI', sans-serif;
        font-weight: 500;
        font-size: 1rem;
        border: 2px solid rgba(255,255,255,.5);
        border-radius: 9999px;
        padding: .95rem 2rem;
        cursor: pointer;
        transition: border-color .2s, background .2s;
      }
      .btn-ghost-white:hover { border-color: #fff; background: rgba(255,255,255,.1); }

      .nd-card {
        background: #fff;
        border-radius: 1.25rem;
        border: none;
        box-shadow: 0 2px 20px rgba(13,27,62,.08);
        overflow: hidden;
      }

      .gold-line {
        width: 48px; height: 3px;
        background: linear-gradient(90deg, var(--gold), var(--gold2));
        border-radius: 2px; margin: .75rem auto 0;
      }

      .info-row { display: flex; gap: .75rem; align-items: flex-start; padding: .85rem 0; border-bottom: 1px solid #f0ebe0; }
      .info-row:last-child { border-bottom: none; }

      .nd-input {
        width: 100%;
        height: 3rem;
        padding: 0 1rem;
        border: 1.5px solid #e5e7eb !important;
        border-radius: .75rem !important;
        font-family: 'Lora', serif !important;
        font-size: .95rem !important;
        color: #111827 !important;
        background: #fff !important;
        transition: border-color .2s, box-shadow .2s !important;
        outline: none !important;
      }
      .nd-input:focus { border-color: var(--gold) !important; box-shadow: 0 0 0 3px rgba(184,134,30,.12) !important; }
      .nd-input.ok  { border-color: #22c55e !important; background: #f0fdf4 !important; }
      .nd-input.err { border-color: #ef4444 !important; background: #fef2f2 !important; }

      .pay-row {
        border: 1.5px solid #e5e7eb; border-radius: 1rem;
        padding: 1rem 1.25rem; cursor: pointer;
        transition: border-color .2s, background .2s;
      }
      .pay-row:hover  { border-color: var(--gold2); }
      .pay-row.picked { border-color: var(--gold); background: #fffbf0; }

      .dot {
        width: 1.1rem; height: 1.1rem;
        border-radius: 50%; border: 2px solid #d1d5db; flex-shrink: 0;
        transition: border-color .2s, background .2s;
      }
      .dot.on { border-color: var(--gold); background: var(--gold); }

      @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      .fu  { animation: fadeUp .65s ease both; }
      .fu2 { animation: fadeUp .65s .12s ease both; }
      .fu3 { animation: fadeUp .65s .25s ease both; }

      .nd-section { padding: 5rem 1.5rem; }
      @media(max-width:640px) { .nd-section { padding: 3.5rem 1.25rem; } }

      /* ── Fonte do preço — tamanho corrigido ── */
      .price-num {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        font-size: clamp(2rem, 6vw, 2.75rem);
        color: #fff;
        line-height: 1.15;
        margin: 0;
      }

      .section-tag {
        font-family: -apple-system, 'Segoe UI', sans-serif;
        font-weight: 700; font-size: .7rem;
        letter-spacing: .14em; text-transform: uppercase;
        color: var(--gold); margin-bottom: .5rem;
      }

      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(s);
  }, []);

  /* ─── Lógica (intacta) ──────────────────────────────────────────────────── */
  const TAXA_ANTECIPACAO_VISTA = 0.025;
  const TAXA_ANTECIPACAO_PARCELADO = 0.03;

  const calcularTaxaAntecipacao = (valorBase, numParcelas) => {
    if (numParcelas === 1) return valorBase * TAXA_ANTECIPACAO_VISTA;
    const somaMeses = (numParcelas * (numParcelas + 1)) / 2;
    return (valorBase / numParcelas) * TAXA_ANTECIPACAO_PARCELADO * somaMeses;
  };

  const [showForm, setShowForm]   = useState(false);
  const [formData, setFormData]   = useState({ nomeParticipante:'', cpf:'', email:'', phone:'', phoneConfirm:'', paymentMethod:'pix', installments:1 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [cpfError,  setCpfError]   = useState('');
  const [cpfValid,  setCpfValid]   = useState(false);
  const [phoneError,setPhoneError] = useState('');
  const [phoneValid,setPhoneValid] = useState(false);

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

  const PRECO_BASE = 100.0;
  const calcPrice  = (n=null) => {
    const np = n ?? (parseInt(formData.installments)||1);
    let t = PRECO_BASE;
    if (formData.paymentMethod==='credit') {
      t = PRECO_BASE + PRECO_BASE*(np===1?.0399:.0449) + 0.49 + calcularTaxaAntecipacao(PRECO_BASE,np);
    }
    return { valorTotal:t, valorParcela:t/np };
  };
  const { valorTotal, valorParcela } = calcPrice();

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
    } else {
      setFormData(p=>({...p,[name]:value}));
    }
  };

  const validate = () => {
    if(!formData.nomeParticipante.trim()){alert('Preencha seu nome completo.');return false;}
    const r=formData.cpf.replace(/\D/g,'');
    if(!r||r.length!==11){alert('CPF inválido.');return false;}
    if(!validarCPF(r)){alert('CPF inválido.');return false;}
    if(tdigs(formData.phone).length<11){alert('WhatsApp inválido.');return false;}
    if(tdigs(formData.phone)!==tdigs(formData.phoneConfirm)){alert('Os números de WhatsApp não coincidem.');return false;}
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!validate()) return;
    setIsProcessing(true);
    try {
      const res = await fetch('https://SEU-WEBHOOK-AQUI/inscricoes-neel',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({nomeParticipante:formData.nomeParticipante,cpf:formData.cpf,email:formData.email,phone:formData.phone,paymentMethod:formData.paymentMethod,installments:formData.installments,ticketQuantity:1,amount:valorTotal,timestamp:new Date().toISOString(),event:'NEEL-2SeminarioEspirita'}),
      });
      if(res.ok){
        const d=await res.json();
        if(d.success===false){alert(d.message||'Erro.');return;}
        if(d.paymentUrl){setPaymentUrl(d.paymentUrl);setInscriptionSuccess(true);window.location.href=d.paymentUrl;}
        else alert('Link de pagamento não encontrado.');
      } else { const e2=await res.json(); alert(e2.message||'Erro no servidor.'); }
    } catch(err){ console.error(err); alert('Erro de conexão. Tente novamente.'); }
    finally { setIsProcessing(false); }
  };

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

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section style={{position:'relative',minHeight:'100svh',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:`url(${heroImage})`,backgroundSize:'cover',backgroundPosition:'center 15%'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(8,18,42,.25) 0%,rgba(8,18,42,.55) 55%,rgba(8,18,42,.88) 100%)'}}/>

        <div style={{position:'relative',zIndex:10,minHeight:'100svh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'6rem 1.5rem 3rem'}}>
          <div style={{maxWidth:'42rem',textAlign:'center'}}>

            <p className="fu" style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.72rem',letterSpacing:'.16em',textTransform:'uppercase',color:'var(--gold2)',marginBottom:'1.25rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'.5rem'}}>
   
              2º Seminário Espírita do NEEL

            </p>

            {/* ── Título corrigido (era "min") ── */}
            <h1 className="fu2" style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontSize:'clamp(3.2rem,10vw,6rem)',color:'#fff',lineHeight:1.08,marginBottom:'1.25rem'}}>
              "Vinde a mim
            </h1>
            <p className="fu2" style={{fontFamily:"'Lora',Georgia,serif",fontStyle:'italic',fontWeight:400,fontSize:'clamp(1rem,3vw,1.25rem)',color:'rgba(255,255,255,.78)',marginBottom:'2.75rem',lineHeight:1.65}}>
              Todos os que estais cansados e oprimidos,<br/>e eu vos aliviarei."
            </p>

            <div className="fu3" style={{display:'flex',flexWrap:'wrap',gap:'1rem',justifyContent:'center',marginBottom:'4rem'}}>
              <button className="btn-primary" onClick={openForm}>
                Faça sua inscrição aqui <ArrowRight style={{width:'1.1rem',height:'1.1rem'}}/>
              </button>
              <button className="btn-ghost-white" onClick={()=>scroll('sobre')}>
                Saiba Mais
              </button>
            </div>

            <div className="fu3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',color:'#fff'}}>
              {[
                {icon:<Calendar style={{width:'1.25rem',height:'1.25rem'}}/>, top:'31 de Outubro', sub:'2026'},
                {icon:<Clock    style={{width:'1.25rem',height:'1.25rem'}}/>, top:'08h às 17h',    sub:'Dia inteiro'},
                {icon:<MapPin   style={{width:'1.25rem',height:'1.25rem'}}/>, top:'Auditório SESC Cidade Alta',   sub:'Rua Coronel Bezerra, 33, Cidade Alta, Natal - RN'},
              ].map(({icon,top,sub})=>(
                <div key={top} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'.35rem'}}>
                  <span style={{color:'var(--gold2)'}}>{icon}</span>
                  <span style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.88rem'}}>{top}</span>
                  <span style={{opacity:.6,fontSize:'.75rem',fontFamily:"'Lora',serif"}}>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ INFORMAÇÕES DO EVENTO ════════════════════════════════════════════ */}
      <section id="sobre" className="nd-section" style={{background:'var(--cream)'}}>
        <div style={{maxWidth:'46rem',margin:'0 auto'}}>

          <div style={{textAlign:'center',marginBottom:'2.75rem'}}>
            <p className="section-tag">Núcleo Espírita Esperança de Luz — NEEL</p>
            <h2 className="nd-title" style={{fontSize:'clamp(1.9rem,5vw,2.75rem)'}}>Informações do Evento</h2>
            <div className="gold-line"/>
          </div>

          <div className="nd-card" style={{padding:'2rem 2.25rem'}}>
            {[
              {label:'TEMA',         value:'"Vinde a Mim — todos os que estais cansados e oprimidos, e eu vos aliviarei."'},
              {label:'DATA',         value:'31 de Outubro de 2026 — Sábado'},
              {label:'HORÁRIO',      value:'08h às 17h'},
              {label:'LOCAL',        value:'Auditório SESC Cidade Alta — Rua Coronel Bezerra, 33, Natal-RN'},
              {label:'PALESTRANTES', value:'Jorge Elarrat (RO) e Rafael Siqueira (RJ)'},
              {label:'REALIZAÇÃO',   value:'NEEL — Centro Espírita Esperança de Luz'},
              {label:'APOIO',        value:'CRENORTE e FERN — Federação Espírita do RN'},
            ].map(({label,value})=>(
              <div key={label} className="info-row">
                <Sparkles style={{width:'.9rem',height:'.9rem',color:'var(--gold)',flexShrink:0,marginTop:'.2rem'}}/>
                <p style={{margin:0}}>
                  <span className="nd-label">{label}:&nbsp;</span>
                  <span className="nd-value">{value}</span>
                </p>
              </div>
            ))}

            <div style={{marginTop:'1.75rem',paddingTop:'1.75rem',borderTop:'1px solid #ede8df'}}>
              <p className="nd-label" style={{marginBottom:'.75rem',display:'flex',alignItems:'center',gap:'.4rem'}}>
                <Phone style={{width:'.9rem',height:'.9rem',color:'var(--gold)'}}/> Dúvidas? Fale Conosco:
              </p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(11rem,1fr))',gap:'.75rem'}}>
                {[
                  {href:'https://wa.me/5584991335975',icon:<Phone style={{width:'1rem',height:'1rem',color:'#16a34a'}}/>,text:'(84) 9 9133-5975'},
                  {href:'https://wa.me/5584988049371',icon:<Phone style={{width:'1rem',height:'1rem',color:'#16a34a'}}/>,text:'(84) 9 8804-9371'},
                  {href:'https://instagram.com/neel.sga',icon:<Instagram style={{width:'1rem',height:'1rem',color:'#e1306c'}}/>,text:'@neel.sga'},
                ].map(({href,icon,text})=>(
                  <a key={text} href={href} style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.75rem 1rem',borderRadius:'.75rem',background:'var(--cream)',border:'1.5px solid #ede8df',color:'var(--navy)',fontFamily:"'Lora',serif",fontWeight:600,fontSize:'.88rem',textDecoration:'none',transition:'box-shadow .2s'}}
                     onMouseOver={e=>e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.1)'}
                     onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
                    {icon}{text}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ INSCRIÇÃO ════════════════════════════════════════════════════════
           Fundo bege (sem branco), card azul com layout corrigido:
           badge → label "Valor do Ingresso" → preço → "por participante" → botão */}
      <section id="custos" className="nd-section" style={{background:'var(--cream)'}}>
        <div style={{maxWidth:'38rem',margin:'0 auto'}}>

          <div className="nd-card" style={{marginBottom:'1.5rem',overflow:'hidden'}}>
            <div style={{background:'linear-gradient(145deg,#0d1b3e 0%,#1a3570 100%)',padding:'3.5rem 2rem',textAlign:'center'}}>

              {/* 1 — Badge lote no topo */}
              <span className="nd-tag" style={{display:'inline-block',background:'var(--gold)',color:'#fff',borderRadius:'9999px',padding:'.45rem 1.25rem',marginBottom:'1.5rem',letterSpacing:'.1em'}}>
                1º Lote Disponível
              </span>

              {/* 2 — Label "Valor do Ingresso" (fonte pequena, separada do número) */}
              <p style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.68rem',letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:'.4rem'}}>
                Valor do Ingresso
              </p>

              {/* 3 — Número do preço (tamanho controlado pelo .price-num) */}
              <p className="price-num">R$&nbsp;100,00</p>

              {/* 4 — "por participante" */}
              <p style={{fontFamily:"'Lora',Georgia,serif",color:'rgba(255,255,255,.5)',fontSize:'.88rem',margin:'.4rem 0 2rem'}}>
                por participante
              </p>

              {/* 5 — Botão na linha própria */}
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

                  <div style={{marginBottom:'1.25rem'}}>
                    <label style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.7rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#6b7280',display:'block',marginBottom:'.5rem'}}>Nome completo *</label>
                    <input name="nomeParticipante" value={formData.nomeParticipante} onChange={handleChange}
                           required placeholder="Seu nome completo" className="nd-input" />
                  </div>

                  <div style={{background:'#fffbf0',border:'1.5px solid #f0d98a',borderRadius:'1rem',padding:'1.25rem',marginBottom:'1.25rem'}}>
                    <p style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.82rem',color:'#92400e',display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'1rem'}}>
                      <Phone style={{width:'.9rem',height:'.9rem',color:'var(--gold)'}}/> O comprovante será enviado para este WhatsApp — digite com atenção!
                    </p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                      <div>
                        <label style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#6b7280',display:'block',marginBottom:'.4rem'}}>WhatsApp *</label>
                        <input name="phone" value={formData.phone} onChange={handleChange}
                               required placeholder="(84) 99999-9999" maxLength="15"
                               className={`nd-input ${formData.phone?(phoneError?'err':phoneValid?'ok':''):''}`} />
                      </div>
                      <div>
                        <label style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#6b7280',display:'block',marginBottom:'.4rem'}}>Confirme *</label>
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
                      <label style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#6b7280',display:'block',marginBottom:'.4rem'}}>E-mail *</label>
                      <input name="email" type="email" value={formData.email} onChange={handleChange}
                             required placeholder="seu@email.com" className="nd-input" />
                    </div>
                    <div>
                      <label style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#6b7280',display:'block',marginBottom:'.4rem'}}>CPF *</label>
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
                          <p style={{fontFamily:"'Lora',serif",fontSize:'.82rem',color:'#6b7280',margin:0}}>R$ 100,00 — sem taxas</p>
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
                      <label style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#6b7280',display:'block',marginBottom:'.4rem'}}>Parcelas</label>
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

                  <div style={{background:'linear-gradient(135deg,#fffbf0,#fef3c7)',border:'1.5px solid #f0d98a',borderRadius:'1rem',padding:'1.25rem',textAlign:'center',marginBottom:'1.5rem'}}>
                    <p style={{fontFamily:"-apple-system,'Segoe UI',sans-serif",fontWeight:700,fontSize:'.68rem',letterSpacing:'.12em',textTransform:'uppercase',color:'#92400e',marginBottom:'.3rem'}}>Valor Total</p>
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
                          disabled={isProcessing||!phoneValid||!cpfValid}>
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
      <footer style={{background:'var(--navy)',padding:'3rem 1.5rem',textAlign:'center'}}>
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

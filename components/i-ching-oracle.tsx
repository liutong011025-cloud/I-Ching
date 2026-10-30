'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Check, CircleHelp, Coins, Hand, RotateCcw } from 'lucide-react'
import { CoinToss } from './coin-toss'
import { ReadingTour } from './reading-tour'
import { LineProgress } from './line-progress'
import { ReadingResult } from './reading-result'
import { useLanguage } from './language-provider'
import { getHexagramFromLines } from '@/lib/hexagrams'
import { clearReadingJobs } from '@/lib/reading-jobs'

type Step = 'question' | 'method' | 'tossing' | 'result'
type Session = { step: Step; question: string; mode: 'auto'|'manual'; lines: {value:number;coins:number[]}[] }
const emptySession: Session = {step:'question',question:'',mode:'auto',lines:[]}
const storageKey = 'eguide-reading-v1'
function readSession(): Session | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
    if (!s || typeof s.question !== 'string' || s.question.length > 1000 || !['auto','manual'].includes(s.mode) || !Array.isArray(s.lines) || s.lines.length > 6) return null
    if (!s.lines.every((l: {value:number;coins:number[]}) => [6,7,8,9].includes(l.value) && Array.isArray(l.coins) && l.coins.length === 3 && l.coins.every(c => c === 2 || c === 3) && l.coins.reduce((a,b)=>a+b,0) === l.value)) return null
    if (!['question','method','tossing','result'].includes(s.step)) return null
    if (s.step !== 'question' && !s.question.trim()) return null
    return {...s,step:s.lines.length===6?'result':s.step==='result'?'tossing':s.step}
  } catch { return null }
}

export function IChingOracle() {
  const {language} = useLanguage()
  const zh = language === 'zh'
  const [session,setSession] = useState<Session>(emptySession)
  const [ready,setReady] = useState(false)
  const [resetPending,setResetPending] = useState(false)
  useEffect(()=>{const saved=readSession();if(saved)setSession(saved);setReady(true)},[])
  useEffect(()=>{
    if(!ready)return
    try{if(!session.question && !session.lines.length)sessionStorage.removeItem(storageKey);else sessionStorage.setItem(storageKey,JSON.stringify(session))}catch{}
  },[session,ready])
  const {step,question,mode,lines} = session
  useEffect(()=>{
    if(!ready)return
    window.scrollTo({top:0,behavior:'instant'})
    const heading=document.querySelector<HTMLElement>('#main h1')
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
  },[step,ready])
  const steps = zh?['提出问题','选择方式','起卦成爻','阅读卦象']:['Your question','Your method','Cast six lines','Your reading']
  const stepIndex=['question','method','tossing','result'].indexOf(step)
  const reset=()=>{clearReadingJobs();setSession(emptySession);setResetPending(false);window.scrollTo({top:0,behavior:'smooth'})}
  const onResult=(value:number,coins:number[])=>setSession(current=>{
    if(current.step!=='tossing'||current.lines.length>=6||coins.length!==3||coins.some(c=>c!==2&&c!==3)||coins.reduce((a,b)=>a+b,0)!==value)return current
    const next=[...current.lines,{value,coins}]
    return {...current,lines:next,step:next.length===6?'result':'tossing'}
  })
  const examples = zh?['面对新的学习任务，我可以先关注什么？','如何更好地理解我与他人的关系？','此刻，我可以做出怎样的调整？']:['What could I focus on as I begin a new project?','How might I better understand this relationship?','What could I approach differently right now?']
  return <main id="main" className="reading-room">
    <div className="reading-topline"><span className="eyebrow">{zh?'易经占卜 / THE READING ROOM':'THE READING ROOM / 易经'}</span><ReadingTour language={language} ready={ready}/>{step!=='question'&&<button className="quiet-button" onClick={()=>setResetPending(true)}><RotateCcw size={15}/>{zh?'重新开始':'Start over'}</button>}</div>
    <ol className="reading-steps" aria-label={zh?'起卦流程':'Reading progress'}>{steps.map((label,i)=><li key={i} data-tour-step={i} className={i===stepIndex?'active':i<stepIndex?'complete':''} aria-current={i===stepIndex?'step':undefined}><span>{i<stepIndex?<Check size={13}/>:String(i+1).padStart(2,'0')}</span><span>{label}</span></li>)}</ol>
    {resetPending&&<aside className="reset-confirm" role="alert"><p>{zh?'重新开始会清空本轮问题和已记录的爻。':'Starting over clears your current question and lines.'}</p><div><button className="text-button" onClick={()=>setResetPending(false)}>{zh?'继续本轮':'Keep this reading'}</button><button className="primary-button" onClick={reset}>{zh?'确认重新开始':'Start a new reading'}</button></div></aside>}
    {step==='question'&&<section className="question-layout">
      <div className="question-intro"><p className="eyebrow">01 / {zh?'把注意力，带回当下':'A MOMENT TO REFLECT'}</p><h1>{zh?<>此刻，<br/>你在思考什么？</>:<>What is on<br/><em>your mind?</em></>}</h1><p>{zh?'写下一个具体的问题。\n不必急着寻找答案，先给自己一个重新审视它的机会。':'Begin with a specific question.\nTake a moment to see your situation from another angle.'}</p><div className="question-seal" aria-hidden="true">一<br/>问<br/>一<br/>念</div></div>
      <form className="question-form" onSubmit={e=>{e.preventDefault();if(question.trim())setSession({...session,question:question.trim(),step:'method'})}}><label htmlFor="reading-question">{zh?'你的问题':'Your question'}<span>{zh?'支持中文或英文':'Chinese or English welcome'}</span></label><textarea id="reading-question" value={question} onChange={e=>setSession({...session,question:e.target.value})} maxLength={1000} rows={5} placeholder={zh?'例如：面对新的学习任务，我可以先关注什么？':'For example: What could I focus on as I begin a new project?'} required aria-describedby="question-help"/><div className="input-meta"><span id="question-help">{zh?'一次围绕一个情境，以“如何”或“什么”开始。':'One situation at a time. Begin with “how” or “what”.'}</span><span>{question.length}/1000</span></div><button type="submit" className="primary-button full-width" disabled={!question.trim()}>{zh?'选择起卦方式':'Choose your method'}<ArrowUpRight size={18}/></button><div className="question-examples"><p>{zh?'也可以从这里开始':'Or begin with a question'}</p>{examples.map(example=><button type="button" key={example} onClick={()=>setSession({...session,question:example})}>{example}<PlusMark/></button>)}</div></form>
    </section>}
    {step==='method'&&<section className="method-section"><button className="quiet-button" onClick={()=>setSession({...session,step:'question'})}><ArrowLeft size={16}/>{zh?'修改问题':'Edit your question'}</button><div className="step-heading"><p className="eyebrow">02 / {zh?'选择你的方式':'CHOOSE YOUR METHOD'}</p><h1>{zh?'让一卦，慢慢形成。':'Let the lines take shape.'}</h1><p>{zh?'每轮使用三枚钱币，逐次确认，共六爻。':'Three coins per round. Six confirmed lines, from bottom to top.'}</p></div><div className="method-options"><button className="method-option digital" onClick={()=>setSession({...session,mode:'auto',step:'tossing'})}><span className="method-number">01</span><Coins size={45} strokeWidth={1}/><h2>{zh?'系统投币':'Digital coins'}</h2><p>{zh?'轻触投币按钮，让系统为你投掷三枚钱币。适合随时开启一次体验。':'Let the system cast three coins for you. A thoughtful moment, wherever you are.'}</p><span className="method-cta">{zh?'用系统起卦':'Cast digitally'}<ArrowUpRight size={20}/></span></button><button className="method-option physical" onClick={()=>setSession({...session,mode:'manual',step:'tossing'})}><span className="method-number">02</span><Hand size={45} strokeWidth={1}/><h2>{zh?'亲手投币':'Your own coins'}</h2><p>{zh?'准备三枚实体钱币。亲手投掷，然后逐枚录入正反面，让过程更有仪式感。':'Take three physical coins. Cast them yourself, then enter each face for a hands-on ritual.'}</p><span className="method-cta">{zh?'手动录入结果':'Enter your results'}<ArrowUpRight size={20}/></span></button></div></section>}
    {step==='tossing'&&<section className="casting-section"><div className="step-heading compact"><p className="eyebrow">03 / {mode==='auto'?(zh?'系统投币':'DIGITAL COINS'):(zh?'手动录入':'PHYSICAL COINS')}</p><h1>{zh?'一爻一爻，照见变化。':'One line at a time.'}</h1><p className="casting-question">“{question}”</p></div><div className="casting-layout"><div className="casting-surface"><CoinToss key={`${mode}-${lines.length}`} round={lines.length+1} onResult={onResult} mode={mode} language={language}/></div><aside className="progress-surface"><div className="progress-heading"><h2>{zh?'你的卦象':'Your hexagram'}</h2><span>{lines.length} / 6</span></div><LineProgress completedLines={lines} currentRound={lines.length+1} language={language}/><p className="small-note">{zh?'从下向上记录，六爻成一卦。\n金色为动爻，表示变化的线索。':'Built from bottom to top.\nGold highlights changing lines.'}</p><details className="line-legend"><summary><CircleHelp size={16}/>{zh?'6、7、8、9 代表什么？':'What do 6, 7, 8 and 9 mean?'}</summary><p>{zh?'6 老阴（动） · 7 少阳\n8 少阴 · 9 老阳（动）':'6 Old yin (changing) · 7 Young yang\n8 Young yin · 9 Old yang (changing)'}</p></details></aside></div></section>}
    {step==='result'&&lines.length===6&&<ReadingResult hexagram={getHexagramFromLines(lines.map(l=>l.value))} lines={lines.map(l=>l.value)} question={question} language={language}/>}
    <p className="reading-footnote">{zh?'本体验用于文化探索与个人思考。请结合现实情况，保留自己的判断。':'A cultural and reflective experience. Keep your own judgement grounded in real circumstances.'}</p>
  </main>
}
function PlusMark(){return <span aria-hidden="true">↗</span>}


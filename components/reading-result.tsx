'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Download, ImageIcon, Loader2, RefreshCw } from 'lucide-react'
import { HexagramDisplay } from './hexagram-display'
import { getHexagramFromLines, type Hexagram } from '@/lib/hexagrams'
import { localizedHexagram } from '@/lib/hexagram-localization'
import { saveHexagramImage } from '@/lib/save-hexagram-image'
import { getReadingJob, invalidateReadingJob } from '@/lib/reading-jobs'

export function ReadingResult({hexagram,lines,question,language='zh'}:{hexagram:Hexagram;lines:number[];question:string;language?:'zh'|'en'}){
  const zh=language==='zh'
  const [answer,setAnswer]=useState<string|null>(null)
  const [answerError,setAnswerError]=useState(false)
  const [answerLoading,setAnswerLoading]=useState(true)
  const [image,setImage]=useState<string|null>(null)
  const [imageError,setImageError]=useState(false)
  const [imageLoading,setImageLoading]=useState(true)
  const [textAttempt,setTextAttempt]=useState(0)
  const [imageAttempt,setImageAttempt]=useState(0)
  const [imageLanguage]=useState(language)
  const [saving,setSaving]=useState(false)
  const [saveError,setSaveError]=useState(false)
  const local=localizedHexagram(hexagram,language)
  const changing=lines.filter(v=>v===6||v===9).length
  const related=changing?getHexagramFromLines(lines.map(v=>v===6?7:v===9?8:v)):null
  useEffect(()=>{
    let cancelled=false;setAnswerLoading(true);setAnswerError(false);setAnswer(null)
    getReadingJob('text',hexagram,question,language).then(v=>{if(!cancelled)setAnswer(v)}).catch(()=>{if(!cancelled)setAnswerError(true)}).finally(()=>{if(!cancelled)setAnswerLoading(false)})
    return()=>{cancelled=true}
  },[hexagram,question,language,textAttempt])
  useEffect(()=>{
    let cancelled=false;setImageLoading(true);setImageError(false)
    getReadingJob('image',hexagram,question,imageLanguage).then(v=>{if(!cancelled)setImage(v)}).catch(()=>{if(!cancelled)setImageError(true)}).finally(()=>{if(!cancelled)setImageLoading(false)})
    return()=>{cancelled=true}
  },[hexagram,question,imageLanguage,imageAttempt])
  const save=async()=>{if(!image||saving)return;setSaving(true);setSaveError(false);try{await saveHexagramImage(image,`eguide-${hexagram.number}.jpg`)}catch{setSaveError(true)}finally{setSaving(false)}}
  return <section className="result-section">
    <div className="result-hero"><div className="result-identity"><p className="eyebrow">04 / {zh?'本次卦象':'YOUR READING'}</p><h1>{hexagram.chineseName}</h1><span className="result-en-name">{hexagram.name}</span></div><div className="result-figure"><HexagramDisplay lines={lines} animated/><span>{zh?`第 ${hexagram.number} 卦`:`HEXAGRAM ${String(hexagram.number).padStart(2,'0')}`}</span></div><div className="result-intro"><span className="eyebrow">{zh?'卦象主题':'A THEME TO CONSIDER'}</span><h2>{local.theme}</h2><p>{local.description}</p><span className="small-note">{zh?`上卦：${local.upper} · 下卦：${local.lower}`:`Above: ${local.upper} · Below: ${local.lower}`}</span></div></div>
    <div className="result-question"><span>{zh?'你的问题':'YOUR QUESTION'}</span><p>“{question}”</p></div>
    <div className="result-content"><article className="interpretation"><div className="result-section-title"><h2>{zh?'与当下的对话':'A perspective for now'}</h2><span>{answer? (zh?'AI 辅助解读':'AI REFLECTION'):(zh?'卦象导读':'HEXAGRAM GUIDE')}</span></div>{answerLoading?<div className="loading-state" role="status"><Loader2 size={23} className="spin"/><p>{zh?'正在结合你的问题整理思路…':'Reflecting on your question…'}</p></div>:<><div className="reading-prose">{(answer??(zh?`${local.description}\n\n试着回到你的问题：“${question}”。在这一主题下，哪些因素是你能影响的？哪些部分需要更多观察？写下一个你愿意尝试的小行动，并用现实中的信息继续检验它。`:`${local.description}\n\nReturn to your question: “${question}”. Which factors can you influence, and which need more observation? Consider one small action you could try, and test it against real information.`)).split(/\n\n+/).map((para,i)=><p key={i}>{para.replace(/^#+\s*/,'')}</p>)}</div>{answerError&&<div className="service-note"><p>{zh?'AI 解读暂不可用，以上为预置卦象导读。':'AI reflection is unavailable. The text above is a preset hexagram guide.'}</p><button className="text-button" onClick={()=>setTextAttempt(a=>a+1)}><RefreshCw size={14}/>{zh?'重试解读':'Try again'}</button></div>}</>}{related&&<div className="related-hexagram"><span className="eyebrow">{zh?`${changing} 个动爻 / 变化的另一种意象`:`${changing} CHANGING ${changing===1?'LINE':'LINES'} / ANOTHER PATTERN`}</span><div><HexagramDisplay lines={lines.map(v=>v===6?7:v===9?8:v)} size="sm"/><p>{related.chineseName}<span>{zh?`第 ${related.number} 卦`:`Hexagram ${related.number} · ${related.name}`}</span></p></div><p className="small-note">{zh?'将动爻阴阳转换后得到的变卦，可作为补充观察的意象。':'Changing lines reverse yin and yang to form a related hexagram, another image to contemplate.'}</p></div>}</article>
    <aside className="vision-panel">
      <div className="result-section-title"><h2>{zh?'一幅意境':'A visual reflection'}</h2><ImageIcon size={20}/></div>
      {imageLoading?<div className="vision-placeholder" role="status"><div className="vision-orbit" aria-hidden="true">易</div><p>{zh?'水墨正在慢慢成形…':'Your ink landscape is taking shape…'}</p><span>{zh?'图像生成需要一些时间':'Image generation can take a little time'}</span></div>:image?<>
        <img className="vision-image" src={image} alt={zh?`${hexagram.chineseName}卦与本次问题的AI水墨意境`:`AI ink-style reflection for ${hexagram.name} and your question`} onError={()=>{setImage(null);setImageError(true)}}/>
        <button className="primary-button full-width" onClick={save} disabled={saving}>{saving?<Loader2 className="spin" size={17}/>:<Download size={17}/>} {zh?saving?'正在准备图片…':'保存图片':saving?'Preparing image…':'Save image'}</button>
        {saveError&&<p className="service-note" role="status">{zh?'暂时无法直接保存，请打开原图后保存。':'Unable to save directly. Open the original image to save it.'}</p>}
        <div className="vision-save-help"><a className="text-link" href={image} target="_blank" rel="noreferrer">{zh?'打开原图':'Open original image'}<ArrowUpRight size={14}/></a><p>{zh?'手机可打开原图后长按保存。':'On mobile, open the original and press and hold to save.'}</p></div>
      </>:<div className="vision-placeholder"><ImageIcon size={36} strokeWidth={1}/><p>{zh?'意境图暂时未能生成':'The image is not available yet'}</p>{imageError&&<button className="text-button" onClick={()=>{invalidateReadingJob('image',hexagram,question,imageLanguage);setImageAttempt(a=>a+1)}}><RefreshCw size={15}/>{zh?'重新生成':'Try again'}</button>}</div>}
      <p className="small-note">{zh?'由 AI 根据问题与卦象创作，仅供审美与思考。':'AI-generated from your question and hexagram, for visual reflection.'}</p>
    </aside></div>
  </section>
}


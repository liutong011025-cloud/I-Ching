'use client'

import { useEffect, useState } from 'react'
import { Download, ImageIcon, Loader2, RefreshCw } from 'lucide-react'
import { HexagramDisplay } from './hexagram-display'
import { getHexagramFromLines, type Hexagram } from '@/lib/hexagrams'
import { localizedHexagram } from '@/lib/hexagram-localization'
import { prepareHexagramImage, saveHexagramImage } from '@/lib/save-hexagram-image'
import { composeHexagramImage } from '@/lib/compose-hexagram-image'
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
  const [prepared,setPrepared]=useState<{url:string;file:File;preview:string}|null>(null)
  const [preparing,setPreparing]=useState(false)
  const [prepareError,setPrepareError]=useState(false)
  const [prepareAttempt,setPrepareAttempt]=useState(0)
  const local=localizedHexagram(hexagram,language)
  const changingLines=lines.flatMap((value,index)=>value===6||value===9?[index+1]:[])
  const lineKey=lines.join(',')
  const changing=changingLines.length
  const lineNames=zh?changingLines.map(n=>n===1?'初爻':n===6?'上爻':'第'+n+'爻').join('、'):changingLines.join(', ')
  const related=changing?getHexagramFromLines(lines.map(v=>v===6?7:v===9?8:v)):null
  const relatedLocal=related?localizedHexagram(related,language):null
  useEffect(()=>{
    let cancelled=false;setAnswerLoading(true);setAnswerError(false);setAnswer(null)
    getReadingJob('text',hexagram,question,language,lineKey.split(',').map(Number)).then(v=>{if(!cancelled)setAnswer(v)}).catch(()=>{if(!cancelled)setAnswerError(true)}).finally(()=>{if(!cancelled)setAnswerLoading(false)})
    return()=>{cancelled=true}
  },[hexagram,question,language,lineKey,textAttempt])
  useEffect(()=>{
    let cancelled=false;setImageLoading(true);setImageError(false)
    getReadingJob('image',hexagram,question,imageLanguage).then(v=>{if(!cancelled)setImage(v)}).catch(()=>{if(!cancelled)setImageError(true)}).finally(()=>{if(!cancelled)setImageLoading(false)})
    return()=>{cancelled=true}
  },[hexagram,question,imageLanguage,imageAttempt])
  useEffect(()=>{
    setPrepared(null);setPrepareError(false);setSaveError(false)
    if(!image){setPreparing(false);return}
    const controller=new AbortController();let preview:string|undefined;setPreparing(true)
    prepareHexagramImage(image,`eguide-${hexagram.number}`,controller.signal)
      .then(file=>composeHexagramImage(file,lineKey.split(',').map(Number),controller.signal))
      .then(file=>{if(!controller.signal.aborted){preview=URL.createObjectURL(file);setPrepared({url:image,file,preview})}})
      .catch(()=>{if(!controller.signal.aborted)setPrepareError(true)})
      .finally(()=>{if(!controller.signal.aborted)setPreparing(false)})
    return()=>{controller.abort();if(preview)URL.revokeObjectURL(preview)}
  },[image,hexagram.number,lineKey,prepareAttempt])
  const save=()=>{
    if(!image||saving||prepared?.url!==image)return
    setSaving(true);setSaveError(false)
    // Invoke sharing before awaiting anything, while the click gesture is active.
    try{saveHexagramImage(prepared.file).catch(()=>setSaveError(true)).finally(()=>setSaving(false))}
    catch{setSaveError(true);setSaving(false)}
  }
  return <section className="result-section">
    <div className="result-hero"><div className="result-identity"><p className="eyebrow">04 / {zh?'本卦 / 这次起出的卦':'PRIMARY HEXAGRAM / YOUR CAST'}</p><h1>{hexagram.chineseName}</h1><span className="result-en-name">{hexagram.name}</span></div><div className="result-figure"><HexagramDisplay lines={lines} animated/><span>{zh?`第 ${hexagram.number} 卦`:`HEXAGRAM ${String(hexagram.number).padStart(2,'0')}`}</span><span>{changing?(zh?'金色为动爻：'+lineNames:'Gold = changing lines '+lineNames):(zh?'本次没有动爻':'No changing lines')}</span></div><div className="result-intro"><span className="eyebrow">{zh?'卦象主题':'A THEME TO CONSIDER'}</span><h2>{local.theme}</h2><p>{local.description}</p><span className="small-note">{zh?`上卦：${local.upper} · 下卦：${local.lower}`:`Above: ${local.upper} · Below: ${local.lower}`}</span></div></div>
    <div className="result-question"><span>{zh?'你的问题':'YOUR QUESTION'}</span><p>“{question}”</p></div>
    <div className="result-content"><article className="interpretation"><div className="result-section-title"><h2>{zh?'与当下的对话':'A perspective for now'}</h2><span>{answerLoading?(zh?'正在解读':'PREPARING'):answer?(zh?'AI 辅助解读':'AI REFLECTION'):(zh?'卦象导读':'HEXAGRAM GUIDE')}</span></div><p className="small-note">{answerLoading?(zh?'正在整理本次卦象与问题。':'Preparing a reflection on your cast and question.'):answer?(changing?(zh?'AI 结合你的问题、本卦、动爻和变卦辅助解读；不含逐爻经典原文。':'AI reflects on your question, primary hexagram, changing lines and related hexagram. It does not provide the classical line texts.'):(zh?'AI 结合你的问题和本卦辅助解读；本次没有动爻，不含逐爻经典原文。':'AI reflects on your question and primary hexagram. This cast has no changing lines, and classical line texts are not included.')):(zh?'以下是仅基于本卦的预置导读，不包含动爻或变卦解读。':'The preset guide below uses only the primary hexagram; it does not interpret changing lines or the related hexagram.')}</p>{answerLoading?<div className="loading-state" role="status"><Loader2 size={23} className="spin"/><p>{zh?'正在结合你的问题整理思路…':'Reflecting on your question…'}</p></div>:<><div className="reading-prose">{(answer??(zh?`${local.description}\n\n试着回到你的问题：“${question}”。在这一主题下，哪些因素是你能影响的？哪些部分需要更多观察？写下一个你愿意尝试的小行动，并用现实中的信息继续检验它。`:`${local.description}\n\nReturn to your question: “${question}”. Which factors can you influence, and which need more observation? Consider one small action you could try, and test it against real information.`)).split(/\n\n+/).map((para,i)=><p key={i}>{para.replace(/^#+\s*/,'')}</p>)}</div>{answerError&&<div className="service-note"><p>{zh?'AI 解读暂不可用，以上为预置卦象导读。':'AI reflection is unavailable. The text above is a preset hexagram guide.'}</p><button className="text-button" onClick={()=>setTextAttempt(a=>a+1)}><RefreshCw size={14}/>{zh?'重试解读':'Try again'}</button></div>}</>}<ReadingGuide zh={zh} primary={zh?hexagram.chineseName:hexagram.name} primaryTheme={local.theme} related={zh?related?.chineseName:related?.name} relatedTheme={relatedLocal?.theme}/>{related?<div className="related-hexagram"><span className="eyebrow">{zh?'变卦 / 同一次起卦的补充观察':'RELATED HEXAGRAM / ANOTHER VIEW OF THIS CAST'}</span><p className="small-note">{zh?'本卦「'+hexagram.chineseName+'」中，金色的是动爻：'+lineNames+'（从下往上数）。三枚钱币之和为6或9时，该爻记为动爻。':'In '+hexagram.name+', the gold lines are changing lines '+lineNames+', counted from the bottom. A coin total of 6 or 9 marks a changing line.'}</p><div><HexagramDisplay lines={lines.map(v=>v===6?7:v===9?8:v)} size="sm"/><p>{related.chineseName}<span>{zh?'第 '+related.number+' 卦':'Hexagram '+related.number+' · '+related.name}</span></p></div><p className="small-note">{zh?'将这些动爻的阴阳反转，就得到「'+related.chineseName+'」变卦；其他爻不变。这是对同一卦的补充观察，并非重新占卜，也不代表确定的未来。':'Reversing only those changing lines gives '+related.name+'. The other lines stay the same. This is another perspective on the same cast, not a new reading or a certain prediction.'}</p></div>:<div className="related-hexagram"><span className="eyebrow">{zh?'没有动爻':'NO CHANGING LINES'}</span><p className="small-note">{zh?'这次六爻中没有 6 或 9，因此只显示本卦，没有变卦。':'None of the six lines is a 6 or 9, so this reading has no related hexagram.'}</p></div>}</article>
    <aside className="vision-panel">
      <div className="result-section-title"><h2>{zh?'本卦的意境图':'A visual reflection of your primary hexagram'}</h2><ImageIcon size={20}/></div>
      <p className="small-note">{zh?'AI 结合你的问题和本卦「'+hexagram.chineseName+'」创作；右上角是本卦，金色表示动爻。画面是艺术演绎，不是变卦。':'AI combines your question with the primary hexagram '+hexagram.name+'. The upper-right seal shows its lines, with changing lines in gold. The artwork is not the related hexagram.'}</p>
      {imageLoading?<div className="vision-placeholder" role="status"><div className="vision-orbit" aria-hidden="true">易</div><p>{zh?'水墨正在慢慢成形…':'Your ink landscape is taking shape…'}</p><span>{zh?'图像生成需要一些时间':'Image generation can take a little time'}</span></div>:image?<>
        <img className="vision-image" src={prepared?.url===image?prepared.preview:image} alt={zh?`${hexagram.chineseName}卦与本次问题的AI水墨意境`:`AI ink-style reflection for ${hexagram.name} and your question`} onError={()=>{setImage(null);setImageError(true)}}/>
        <button className="primary-button full-width" onClick={prepareError?()=>setPrepareAttempt(a=>a+1):save} disabled={saving||preparing||(!prepareError&&prepared?.url!==image)}>{saving||preparing?<Loader2 className="spin" size={17}/>:<Download size={17}/>} {zh?preparing?'正在准备图片…':saving?'正在打开保存菜单…':prepareError?'重新准备图片':'保存图片':preparing?'Preparing image…':saving?'Opening save options…':prepareError?'Try preparing again':'Save image'}</button>
        {prepareError&&<p className="service-note" role="status">{zh?'卦象图章暂时未能添加；上方为原图，请重试准备图片。':'The hexagram seal could not be added. The image above is the original; please try again.'}</p>}
        {saveError&&<p className="service-note" role="status">{zh?'暂时无法直接保存，请重试，或长按上方图片选择保存。':'Unable to save right now. Try again or press and hold the image above to save.'}</p>}
      </>:<div className="vision-placeholder"><ImageIcon size={36} strokeWidth={1}/><p>{zh?'意境图暂时未能生成':'The image is not available yet'}</p>{imageError&&<button className="text-button" onClick={()=>{invalidateReadingJob('image',hexagram,question,imageLanguage);setImageAttempt(a=>a+1)}}><RefreshCw size={15}/>{zh?'重新生成':'Try again'}</button>}</div>}
    </aside></div>
  </section>
}

function ReadingGuide({zh,primary,primaryTheme,related,relatedTheme}:{zh:boolean;primary:string;primaryTheme:string;related?:string;relatedTheme?:string}) {
  return <section className="reading-guide" aria-label={zh?'怎么看本卦与变卦':'How to read the two hexagrams'}>
    <p className="eyebrow">{zh?'阅读指引 / 同一次起卦':'READING GUIDE / ONE CAST'}</p>
    <h3>{zh?'为什么会有两个卦？':'Why are there two hexagrams?'}</h3>
    <p>{zh?'六轮投币先组成一个本卦。传统三钱法把点数为 6 的爻称为老阴、9 的爻称为老阳，也叫动爻；按照这个方法，老阴变阳、老阳变阴，再组成变卦。这是一种观察变化的规则，不是又投了一次，也不是一定会发生的预言。':'Six rounds first form the primary hexagram. In the three-coin method, a 6 is called old yin and a 9 old yang; these are changing lines. By convention old yin changes to yang and old yang to yin, forming a related hexagram. This is a way to reflect on change, not another cast or a certain prediction.'}</p>
    {related&&relatedTheme?<>
      <h3>{zh?'怎样一起参考？':'How can I use them together?'}</h3>
      <ol>
        <li>{zh?<>先看本卦「{primary}」的主题：<strong>{primaryTheme}</strong>。这个角度让你想到问题中的什么处境？</>:<>Start with <strong>{primary}</strong> and its theme, <strong>{primaryTheme}</strong>. What does that bring to mind about your question?</>}</li>
        <li>{zh?<>再看变卦「{related}」的主题：<strong>{relatedTheme}</strong>。如果也考虑这个角度，和本卦有什么联系或不同？</>:<>Then consider <strong>{related}</strong> and its theme, <strong>{relatedTheme}</strong>. How might this perspective relate to or differ from the first?</>}</li>
        <li>{zh?'把两者当作思考的提示，结合真实情况选择自己的行动；不必把它们当成两个互相冲突的答案。':'Use both as prompts for reflection, then decide what to do in light of your circumstances. They are not two competing answers.'}</li>
      </ol>
      <p className="small-note">{zh?'主题是平台提供的现代简述；不同传统对动爻和变卦的解读方法并不完全相同。':'The themes are modern summaries supplied by this site. Traditions differ in how they interpret changing lines and related hexagrams.'}</p>
    </>:<p>{zh?'这次没有动爻，因此无需推算变卦；先用本卦主题回看你的问题即可。':'There are no changing lines in this cast, so no related hexagram is calculated. Use the primary theme to reflect on your question.'}</p>}
  </section>
}


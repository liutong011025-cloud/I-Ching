'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react'
import { useLanguage } from './language-provider'

const trigrams = [
  {symbol:'☰',name:'乾',english:'Heaven',nature:'天',color:'#AF925D',text:'以天为象，谈创造、行动与持续。',en:'Heaven evokes creative energy, initiative and continuity.'},
  {symbol:'☷',name:'坤',english:'Earth',nature:'地',color:'#95826E',text:'以地为象，谈承载、接纳与生长。',en:'Earth evokes receptivity, support and growth.'},
  {symbol:'☳',name:'震',english:'Thunder',nature:'雷',color:'#BD8169',text:'以雷为象，谈唤醒、行动与新的开始。',en:'Thunder evokes awakening, movement and a new beginning.'},
  {symbol:'☴',name:'巽',english:'Wind',nature:'风',color:'#92A17F',text:'以风为象，谈渐进、渗透与柔和的影响。',en:'Wind evokes gradual change and a gentle, persistent influence.'},
  {symbol:'☵',name:'坎',english:'Water',nature:'水',color:'#7C999D',text:'以水为象，谈流动、险阻与应变。',en:'Water evokes flow, difficulty and finding a way through.'},
  {symbol:'☲',name:'离',english:'Fire',nature:'火',color:'#B97753',text:'以火为象，谈明晰、依附与照见。',en:'Fire evokes clarity, connection and illumination.'},
  {symbol:'☶',name:'艮',english:'Mountain',nature:'山',color:'#909780',text:'以山为象，谈止步、边界与安定。',en:'Mountain evokes stillness, boundaries and steadiness.'},
  {symbol:'☱',name:'兑',english:'Lake',nature:'泽',color:'#8C9591',text:'以泽为象，谈交流、喜悦与开放。',en:'Lake evokes exchange, openness and joy.'},
]

export function AboutExperience() {
  const zh = useLanguage().language === 'zh'
  const [active, setActive] = useState(0)
  const selected = trigrams[active]
  return <main id="main">
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow"><span className="tiny-square" />{zh ? '一部关于变化的经典' : 'THE BOOK OF CHANGES'}</p>
        <h1>{zh ? <>观变化，<br /><em>知进退。</em></> : <>The art of<br /><em>changing.</em></>}</h1>
        <p className="hero-description">{zh ? '从一阴一阳，到六十四种情境。\n走近《易经》，为眼前的问题留一点思考的空间。' : 'From yin and yang to sixty-four patterns of change.\nExplore the I Ching, and make room for a new perspective.'}</p>
        <Link className="primary-button" href="/consult">{zh ? '开启一次占卜' : 'Begin a reading'}<ArrowUpRight size={19} /></Link>
        <a className="hero-scroll" href="#origins"><ArrowDown size={16} />{zh ? '了解易经' : 'Discover the I Ching'}</a>
      </div>
      <figure className="hero-art">
        <img src="/images/hero-landscape.webp" alt={zh ? '传屈鼎《夏山图》中的绢本水墨山水，约1050年，大都会艺术博物馆藏' : 'Summer Mountains, attributed to Qu Ding, circa 1050. The Metropolitan Museum of Art.'} fetchPriority="high" width="2000" height="800" />
        <div className="art-stamp" aria-hidden="true">山<br />水<br />有<br />时</div>
        <figcaption><span>{zh ? '夏山图（局部）· 约 1050 年' : 'SUMMER MOUNTAINS (DETAIL) · CA. 1050'}</span><span>THE MET · CC0</span></figcaption>
      </figure>
      <div className="hero-index"><span>{zh ? '01 — 变化的语言' : '01 — THE LANGUAGE OF CHANGE'}</span><span>YIN / YANG / POSSIBILITY</span><ArrowDown size={19} /></div>
    </section>

    <section className="origins-section section-space" id="origins">
      <div className="section-label"><span>01 / {zh ? '关于易经' : 'ORIGINS'}</span><span>{zh ? '读懂一种思考方式' : 'A WAY OF SEEING'}</span></div>
      <div className="origins-grid"><h2>{zh ? <>万物在变，<br />思考也可以。</> : <>Everything changes.<br />So can a perspective.</>}</h2><div className="editorial-copy"><p>{zh ? '《易经》，又称《周易》，是中国古代的经典之一。它以阴阳爻和六十四卦描述不同的情境，也在漫长的传承中成为人们理解变化、时机与行动的思想资源。' : 'The I Ching, or Book of Changes, is an ancient Chinese classic. Its yin and yang lines form sixty-four hexagrams: a symbolic language for reflecting on circumstances, timing and action.'}</p><p>{zh ? '在这里，你可以先认识这套符号，再用三枚钱币的方式起卦。把卦象当作一幅隐喻，与自己的处境对照，而不是把它当成未来的答案。' : 'Here, discover its symbols before casting with three coins. Read a hexagram as a metaphor to consider alongside your own circumstances, rather than a prediction of the future.'}</p><a className="text-link dark-link" href="#trigrams">{zh ? '探索八卦' : 'Explore the eight trigrams'}<ArrowDown size={17} /></a></div></div>
      <div className="number-strip"><div><strong>02</strong><span>{zh ? '阴与阳' : 'Yin & yang'}</span></div><div><strong>08</strong><span>{zh ? '自然的基本意象' : 'Trigrams of nature'}</span></div><div><strong>64</strong><span>{zh ? '卦象与情境' : 'Patterns of change'}</span></div><div><strong>06</strong><span>{zh ? '每一卦的爻' : 'Lines in a hexagram'}</span></div></div>
    </section>

    <section className="trigram-section section-space" id="trigrams">
      <div className="section-label"><span>02 / {zh ? '触摸八卦' : 'INTERACTIVE EXPLORATION'}</span><span>{zh ? '轻触色块，发现自然意象' : 'TAP A COLOUR. EXPLORE A SYMBOL.'}</span></div>
      <div className="trigram-heading"><h2>{zh ? <>八种自然，<br />万千变化。</> : <>Eight elements.<br />Endless change.</>}</h2><p>{zh ? '每一个经卦由三爻构成。两个经卦上下相叠，组成一幅六爻卦象。选择一个色块，看看它所代表的自然。' : 'Three lines form a trigram. Two trigrams combine into a six-line hexagram. Select a block to discover the natural image it represents.'}</p></div>
      <div className="trigram-explorer"><div className="trigram-grid" aria-label={zh ? '八卦选择' : 'Choose a trigram'}>{trigrams.map((t,i)=><button key={t.name} style={{backgroundColor:t.color}} aria-pressed={active===i} aria-controls="trigram-detail" onClick={()=>setActive(i)} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)} className={active===i?'is-active':''}><span>{t.symbol}</span><span>{zh?t.name:t.english}</span><Plus size={16} aria-hidden="true" /></button>)}</div><div id="trigram-detail" className="trigram-detail" style={{backgroundColor:selected.color}} aria-live="polite"><span className="detail-index">0{active+1} / 08</span><div className="detail-symbol" aria-hidden="true">{selected.symbol}</div><div className="detail-copy"><h3>{selected.name}<span>{zh?selected.nature:selected.english}</span></h3><p>{zh?selected.text:selected.en}</p></div></div></div>
    </section>

    <section className="ritual-section section-space">
      <div className="ritual-image"><img src="/images/yijing-book.webp" alt={zh?'古籍《周易》书页':'Pages of a historical edition of the Book of Changes'} width="1200" height="925" loading="lazy" /><span>{zh?'《周易本义》（局部）· 东京大学综合图书馆藏':'Zhouyi benyi (detail) · General Library, University of Tokyo'}</span></div>
      <div className="ritual-copy"><p className="eyebrow">03 / {zh?'从认识，到体验':'FROM UNDERSTANDING TO EXPERIENCE'}</p><h2>{zh?<>三枚钱币。<br />六次停留。<br /><em>一个新的视角。</em></>:<>Three coins.<br />Six moments.<br /><em>A new perspective.</em></>}</h2><p>{zh?'给自己留一点安静的时间。写下一个问题，逐次投币，看六爻从下向上形成。你可以使用系统投币，也可以亲手投掷，再录入结果。':'Take a quiet moment. Write down a question and watch six lines take shape, from the bottom up. Use the digital coins, or cast your own and enter the results.'}</p><Link className="primary-button" href="/consult">{zh?'进入易经占卜':'Enter the reading room'}<ArrowUpRight size={18} /></Link><span className="small-note">{zh?'无需注册。用心提问，慢慢阅读。':'No account needed. Ask thoughtfully. Read slowly.'}</span></div>
    </section>

    <section className="faq-section section-space"><div><p className="eyebrow">{zh?'开始之前':'BEFORE YOU BEGIN'}</p><h2>{zh?'一点了解，\n更从容地开始。':'A little context\nbefore you begin.'}</h2></div><div className="faq-list">{[
      [zh?'三枚钱币如何形成一卦？':'How do three coins form a hexagram?',zh?'每次投掷三枚钱币，正面记 3、反面记 2，合计得到 6、7、8 或 9，对应一种爻。重复六次，从下向上形成六爻卦象。':'Each toss uses three coins. Heads count as 3, tails as 2. The total of 6, 7, 8 or 9 determines a line. Six tosses build a hexagram from bottom to top.'],
      [zh?'什么样的问题更适合？':'What makes a useful question?',zh?'选择一个具体的情境，例如“面对新的学习任务，我可以先关注什么？”开放式的问题更便于你把卦象意象与实际处境联系起来。':'Choose a specific situation, such as “What could I focus on as I begin this project?” An open question leaves space to connect the imagery with your own circumstances.'],
      [zh?'AI 解读和意境图是什么？':'What are the AI reading and the image?',zh?'完成起卦后，平台可结合你的问题与卦象生成解读和水墨意境图。它们是辅助思考的生成内容，不是经典原文，也不是对未来的预测。':'After casting, the platform can generate a reading and an ink-style image informed by your question and hexagram. These are generated reflections, not original classical text or predictions.'],
      [zh?'可以把结果当作决策依据吗？':'Can a reading make decisions for me?',zh?'本体验用于文化探索、娱乐与个人思考。随机结果没有预测效力，也不能替代医疗、法律、财务等专业意见。':'This experience is for cultural exploration, entertainment and reflection. Random results have no predictive validity and do not replace medical, legal or financial advice.']
    ].map(([q,a])=><details key={q}><summary>{q}<Plus size={19} /></summary><p>{a}</p></details>)}</div></section>

    <section className="sources-section" id="sources"><span>{zh?'资料与图像':'SOURCES & IMAGES'}</span><p><a href="https://plato.stanford.edu/entries/chinese-change/" target="_blank" rel="noreferrer">Stanford Encyclopedia of Philosophy</a><a href="https://afe.easia.columbia.edu/" target="_blank" rel="noreferrer">Columbia University</a><a href="https://www.metmuseum.org/art/collection/search/39915" target="_blank" rel="noreferrer">{zh?'《夏山图》 / The Met · CC0':'Summer Mountains / The Met · CC0'}</a><a href="/images/credits.json" target="_blank" rel="noreferrer">{zh?'全部图像授权':'All image credits'}</a></p></section>
  </main>
}




'use client'
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <main id="main" className="error-page"><h1>稍作停留，再试一次。</h1><p>Something went wrong. Please try again.</p><button className="primary-button" onClick={reset}>重试 / Try again</button></main>}

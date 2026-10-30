'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useLanguage } from './language-provider'

export function SiteHeader() {
  const { language, setLanguage } = useLanguage()
  const zh = language === 'zh'
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open])
  return <>
    <a className="skip-link" href="#main">{zh ? '跳至主要内容' : 'Skip to content'}</a>
    <header className="site-header">
      <Link href="/" className="brand" aria-label={zh ? '易经 E-Guide 首页' : 'E-Guide home'} onClick={() => setOpen(false)}>
        <img src="/brand/logo-mark.svg" width="44" height="44" alt="" />
        <span className="brand-name">易经<span>E–GUIDE</span></span>
      </Link>
      <nav className="desktop-nav" aria-label={zh ? '主导航' : 'Main navigation'}>
        <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>{zh ? '关于易经' : 'About the I Ching'}</Link>
        <Link href="/consult" aria-current={pathname === '/consult' ? 'page' : undefined}>{zh ? '易经占卜' : 'Consult the I Ching'}<ArrowUpRight size={16} /></Link>
      </nav>
      <div className="header-controls">
        <div className="language-switch" aria-label={zh ? '语言' : 'Language'}>
          <button aria-pressed={zh} onClick={() => setLanguage('zh')} lang="zh-CN">中</button>
          <span aria-hidden="true">/</span><button aria-pressed={!zh} onClick={() => setLanguage('en')} lang="en">EN</button>
        </div>
        <button className="menu-button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} aria-label={zh ? open ? '关闭菜单' : '打开菜单' : open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav id="mobile-navigation" className="mobile-nav" aria-label={zh ? '手机导航' : 'Mobile navigation'}>
        <Link href="/" onClick={() => setOpen(false)}>{zh ? '关于易经' : 'About the I Ching'}<span>01</span></Link>
        <Link href="/consult" onClick={() => setOpen(false)}>{zh ? '易经占卜' : 'Consult the I Ching'}<ArrowUpRight /></Link>
      </nav>}
    </header>
  </>
}

export function SiteFooter() {
  const zh = useLanguage().language === 'zh'
  return <footer className="site-footer">
    <div className="footer-top"><Link className="footer-brand" href="/">易经 <span>E–GUIDE</span></Link><p>{zh ? '古老的智慧，当下的思考。' : 'An ancient text. A present perspective.'}</p><Link className="text-link" href="/consult">{zh ? '开始探索' : 'Begin your reading'}<ArrowUpRight size={18} /></Link></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} E–Guide</span><p>{zh ? '供传统文化体验、娱乐与个人思考。随机卦象不具预测效力，不作为重大决策依据。' : 'For cultural exploration, entertainment and reflection. Random readings do not predict events or replace professional advice.'}</p><a href="/#sources">{zh ? '资料与图像来源' : 'Sources & image credits'}</a></div>
  </footer>
}

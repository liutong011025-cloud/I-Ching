import type { Hexagram } from './hexagrams'

const themes = [
  '创造与自强','承载与包容','初始的困难','启蒙与求知','等待与准备','分歧与沟通','组织与责任','亲近与合作',
  '积蓄微小的力量','行止与分寸','交流与通达','阻隔与沉潜','共同的目标','拥有与分享','谦逊与节制','热情与准备',
  '跟随与选择','整理与修复','接近与照顾','观察与审视','决断与厘清','形式与内涵','剥落与守护','回归与更新',
  '真诚与自然','积蓄与涵养','养育与自养','承担与调整','险阻与流动','明晰与依托','感应与回应','恒久与持续',
  '退让与保存','力量与节制','进展与展现','收敛与守明','关系与分工','差异与理解','阻碍与求助','舒缓与释放',
  '减省与取舍','增益与给予','决断与表达','相遇与边界','汇聚与参与','渐进与成长','困顿与坚持','滋养与共享',
  '更新与时机','转化与培育','震动与警醒','安定与止步','循序与成长','关系中的位置','丰盛与觉察','旅途与适应',
  '柔和与深入','交流与喜悦','疏通与联结','节制与边界','诚意与信任','小步与谨慎','完成后的照料','未完成的可能',
]
const trigrams: Record<string,string> = {Heaven:'天',Earth:'地',Thunder:'雷',Water:'水',Mountain:'山',Wind:'风',Fire:'火',Lake:'泽'}
export function localizedHexagram(hexagram: Hexagram, language: 'zh'|'en') {
  const theme = themes[hexagram.number-1]
  return language === 'zh' ? {
    theme,
    description: `此卦由${trigrams[hexagram.lowerTrigram]}在下、${trigrams[hexagram.upperTrigram]}在上组成。可从“${theme}”这一主题出发，观察自己的处境、行动方式以及与他人的关系。`,
    lower:trigrams[hexagram.lowerTrigram],upper:trigrams[hexagram.upperTrigram],
  } : {theme:hexagram.subtitle,description:hexagram.description,lower:hexagram.lowerTrigram,upper:hexagram.upperTrigram}
}

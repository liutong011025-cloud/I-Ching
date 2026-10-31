import type { Metadata } from 'next'
import { IChingOracle } from '@/components/i-ching-oracle'

export const metadata: Metadata = { title: '易经占卜 · A reading | 易引 E-Guide' }
export default function ConsultPage() { return <IChingOracle /> }

'use client'

import { useEffect } from 'react'
import HeroSection from '@/app/team/HeroSection'
import MainContent from '@/app/team/MainContent'
import dynamic from 'next/dynamic'
import type { TeamMember } from '@/data/teamData'

const StackedSections = dynamic(() => import('@/app/team/StackedSections'), { ssr: false })

export default function TeamPageClient({
  ecMembers,
  webMembers,
  coreMembers,
}: {
  ecMembers: TeamMember[]
  webMembers: TeamMember[]
  coreMembers: TeamMember[]
}) {
  return (
    <main>
      <HeroSection ecMembers={ecMembers} />
      <MainContent />
      <StackedSections webMembers={webMembers} coreMembers={coreMembers} />
    </main>
  )
}

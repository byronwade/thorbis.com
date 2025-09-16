'use client'

import { useState, useEffect } from 'react'

export interface StudyGroup {
  id: string
  name: string
  description: string
  memberCount: number
  max_members: number
  category: string
  is_public: boolean
  isJoined: boolean
  moderator?: {
    name: string
    avatar_url?: string
  }
  created_at: string
  members?: unknown[]
}

export function useStudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for now
  useEffect(() => {
    const mockGroups: StudyGroup[] = [
      {
        id: '1',
        name: 'Plumbing Professionals',
        description: 'Connect with fellow plumbers and share knowledge',
        memberCount: 47,
        max_members: 50,
        category: 'plumbing',
        is_public: true,
        isJoined: true,
        moderator: {
          name: 'Mike Rodriguez'
        },
        created_at: new Date().toISOString(),
        members: []
      },
      {
        id: '2',
        name: 'Retail Excellence Group',
        description: 'Master customer service and retail operations together',
        memberCount: 23,
        max_members: 30,
        category: 'retail',
        is_public: true,
        isJoined: false,
        moderator: {
          name: 'Emma Wilson'
        },
        created_at: new Date().toISOString(),
        members: []
      },
      {
        id: '3',
        name: 'Thorbis Software Masters',
        description: 'Advanced users sharing tips and tricks',
        memberCount: 12,
        max_members: 15,
        category: 'software',
        is_public: false,
        isJoined: true,
        moderator: {
          name: 'Alex Chen'
        },
        created_at: new Date().toISOString(),
        members: []
      }
    ]

    setTimeout(() => {
      setGroups(mockGroups)
      setLoading(false)
    }, 1000)
  }, [])

  const joinGroup = async (groupId: string) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
          : group
      )
    )
  }

  const leaveGroup = async (groupId: string) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: false, memberCount: Math.max(0, group.memberCount - 1) }
          : group
      )
    )
  }

  const createGroup = async (groupData: Partial<StudyGroup>) => {
    const newGroup: StudyGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name: groupData.name || 'New Group',
      description: groupData.description || ',
      memberCount: 1,
      max_members: groupData.max_members || 20,
      category: groupData.category || 'general',
      is_public: groupData.is_public !== false,
      isJoined: true,
      created_at: new Date().toISOString(),
      members: []
    }
    
    setGroups(prevGroups => [...prevGroups, newGroup])
    return newGroup
  }

  return {
    groups,
    loading,
    joinGroup,
    leaveGroup,
    createGroup
  }
}
import { createServerSupabaseClient } from './supabase'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserProfile() {
  const supabase = createServerSupabaseClient()
  const user = await getUser()
  
  if (!user) {
    return null
  }
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error getting profile:', error)
      return null
    }
    
    return profile
  } catch (error) {
    console.error('Error getting profile:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    redirect('/admin/login')
  }
  
  return user
}

export async function requireAuthWithProfile() {
  const user = await requireAuth()
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect('/admin/login')
  }
  
  return { user, profile }
}
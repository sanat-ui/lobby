import {createClient} from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// ── Profile helpers ───────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function createProfile(profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select()
    .single()
  return { data, error }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export async function checkUsernameAvailable(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())
    .single()
  // if data is null and error code is PGRST116 = not found = username is free
  if (error?.code === 'PGRST116') return true
  return false
}

// ── LFG Post helpers ─────────────────────────────────────────

export async function createLFGPost(postData) {
  const { data, error } = await supabase
    .from('lfg_posts')
    .insert([postData])
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .single()
  return { data, error }
}

export async function getLFGPosts({ game, rank, page = 0, limit = 10 } = {}) {
  let query = supabase
    .from('lfg_posts')
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url,
        play_style
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  // Only apply filters if values are passed
  if (game && game !== 'all') query = query.eq('game', game)
  if (rank && rank !== 'all') query = query.eq('rank', rank)

  const { data, error } = await query
  return { data, error }
}

export async function getLFGPostById(postId) {
  const { data, error } = await supabase
    .from('lfg_posts')
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url,
        games,
        play_style
      )
    `)
    .eq('id', postId)
    .single()
  return { data, error }
}

export async function closeLFGPost(postId) {
  const { data, error } = await supabase
    .from('lfg_posts')
    .update({ status: 'closed' })
    .eq('id', postId)
    .select()
    .single()
  return { data, error }
}

export async function deleteLFGPost(postId) {
  const { error } = await supabase
    .from('lfg_posts')
    .delete()
    .eq('id', postId)
  return { error }
}

export async function requestToJoin(postId, userId) {
  // Append userId to the requests array — using Postgres array append
  const { data, error } = await supabase
    .rpc('append_join_request', {
      post_id: postId,
      user_id: userId
    })
  return { data, error }
}

export async function reportPost(postId, reporterId, reason) {
  const { data, error } = await supabase
    .from('reports')
    .insert([{
      post_id: postId,
      reporter_id: reporterId,
      reason
    }])
  return { data, error }
}

// ── DM helpers ────────────────────────────────────────────────

export async function getOrCreateConversation(userA, userB) {
  const { data, error } = await supabase
    .rpc('get_or_create_conversation', {
      user_a: userA,
      user_b: userB
    })
  return { data, error }
}

export async function getConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      profile_1:profiles!conversations_participant_1_fkey (
        id, username, display_name, avatar_url
      ),
      profile_2:profiles!conversations_participant_2_fkey (
        id, username, display_name, avatar_url
      )
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false })
  return { data, error }
}

export async function getMessages(conversationId, page = 0, limit = 30) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey (
        id, username, display_name, avatar_url
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)
  // Reverse so oldest is at top
  return { data: data ? [...data].reverse() : [], error }
}

export async function sendMessage(conversationId, senderId, content) {
  const { data, error } = await supabase
    .rpc('send_message', {
      p_conversation_id: conversationId,
      p_sender_id: senderId,
      p_content: content
    })
  return { data, error }
}

export async function markMessagesRead(conversationId, userId) {
  const { error } = await supabase
    .rpc('mark_messages_read', {
      p_conversation_id: conversationId,
      p_user_id: userId
    })
  return { error }
}

export async function getUnreadCount(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('unread_1, unread_2, participant_1, participant_2')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)

  if (error || !data) return { count: 0, error }

  const count = data.reduce((total, conv) => {
    if (conv.participant_1 === userId) return total + (conv.unread_1 || 0)
    return total + (conv.unread_2 || 0)
  }, 0)

  return { count, error: null }
}
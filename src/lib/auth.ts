import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import { supabaseAdmin } from './database'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'dispatcher' | 'technician' | 'office_staff' | 'customer'
  isActive: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Hash password using PBKDF2
export const hashPassword = (password: string): string => {
  const salt = randomBytes(32).toString('hex')
  const hash = createHash('pbkdf2')
    .update(password + salt)
    .digest('hex')
  return '${salt}:${hash}'
}

// Verify password
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  try {
    const [salt, hash] = hashedPassword.split(': '
    const verifyHash = createHash('pbkdf2')
      .update(password + salt)
      .digest('hex')
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'))
  } catch {
    return false
  }
}

// Generate JWT tokens
export const generateTokens = async (user: User): Promise<AuthTokens> => {
  const now = Math.floor(Date.now() / 1000)
  
  const accessToken = await new SignJWT({ 
    sub: user.id,
    email: user.email,
    role: user.role,
    type: 'access'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 15 * 60) // 15 minutes
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({ 
    sub: user.id,
    type: 'refresh'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 days
    .sign(JWT_SECRET)

  return { accessToken, refreshToken }
}

// Verify JWT token
export const verifyToken = async (token: string): Promise<unknown> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (_error) {
    throw new Error('Invalid token')
  }
}

// Authenticate user
export const authenticateUser = async (email: string, password: string): Promise<{ user: User; tokens: AuthTokens } | null> => {
  try {
    // Get user from database
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (error || !userData) {
      return null
    }

    // Verify password
    if (!verifyPassword(password, userData.password_hash)) {
      return null
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userData.id)

    const user: User = {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      isActive: userData.is_active
    }

    const tokens = await generateTokens(user)

    return { user, tokens }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Create new user
export const createUser = async (userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  role: User['role']
  phone?: string
  mobile?: string
}): Promise<User | null> => {
  try {
    const hashedPassword = hashPassword(userData.password)
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: userData.email.toLowerCase(),
        password_hash: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        phone: userData.phone,
        mobile: userData.mobile,
        is_active: true
      })
      .select()
      .single()

    if (error || !data) {
      console.error('User creation error:', error)
      return null
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      isActive: data.is_active
    }
  } catch (error) {
    console.error('User creation error:', error)
    return null
  }
}

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      isActive: data.is_active
    }
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

// Refresh access token
export const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const payload = await verifyToken(refreshToken)
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid refresh token')
    }

    const user = await getUserById(payload.sub as string)
    if (!user) {
      throw new Error('User not found')
    }

    const tokens = await generateTokens(user)
    return tokens.accessToken
  } catch (error) {
    console.error('Token refresh error:', error)
    return null
  }
}

// Middleware helper to extract user from request
export const getCurrentUser = async (authHeader?: string): Promise<User | null> => {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)
    
    if (payload.type !== 'access') {
      return null
    }

    return await getUserById(payload.sub as string)
  } catch (_error) {
    return null
  }
}
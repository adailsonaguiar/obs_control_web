import {User, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut} from '@firebase/auth'
import {FirebaseApp, getApp, getApps, initializeApp} from '@firebase/app'
import {ReactNode, createContext, useContext, useEffect, useMemo, useState} from 'react'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isAuthConfigured = Object.values(firebaseConfig).every(Boolean)
let app: FirebaseApp | null = null
if (isAuthConfigured) app = getApps().length ? getApp() : initializeApp(firebaseConfig)

type AuthContextValue = {
  user: User | null
  loading: boolean
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  getToken(): Promise<string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isAuthConfigured)

  useEffect(() => {
    if (!app) return
    return onAuthStateChanged(getAuth(app), next => { setUser(next); setLoading(false) })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async signIn(email, password) {
      if (!app) throw new Error('A autenticação ainda não foi configurada.')
      await signInWithEmailAndPassword(getAuth(app), email, password)
    },
    async signUp(email, password) {
      if (!app) throw new Error('A autenticação ainda não foi configurada.')
      await createUserWithEmailAndPassword(getAuth(app), email, password)
    },
    async signOut() { if (app) await firebaseSignOut(getAuth(app)) },
    async getToken() {
      if (!user) throw new Error('Entre na sua conta para continuar.')
      return user.getIdToken()
    },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  return context
}

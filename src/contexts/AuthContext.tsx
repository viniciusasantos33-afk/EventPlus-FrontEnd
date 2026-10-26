import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { auth } from '../services/auth'
import { eventPlusApi } from '../services/eventPlusApi'
import type { AuthSession, LoginCredentials } from '../types/auth'

interface AuthContextValue {
    session: AuthSession | null
    isAuthenticated: boolean
    isAdmin: boolean
    checkingRole: boolean
    login(credentials: LoginCredentials): Promise<void>
    logout(): void
}

interface AuthProviderProps {
    children: ReactNode
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<AuthSession | null>(() =>
        auth.getSession()
    )
    const [isAdmin, setIsAdmin] = useState(false)
    const [checkingRole, setCheckingRole] = useState(
        () => auth.getSession() !== null
    )

    useEffect(() => {
        let active = true
        if (!session) {
            setIsAdmin(false)
            setCheckingRole(false)
            return () => {
                active = false
            }
        }

        setCheckingRole(true)
        eventPlusApi
            .listarUsuarios(session.token)
            .then((usuarios) => {
                if (!active) return
                const usuarioAtual = usuarios.find(
                    (usuario) =>
                        usuario.idUsuario.toLowerCase() ===
                        session.user.idUsuario.toLowerCase()
                )
                setIsAdmin(
                    usuarioAtual?.idTipoUsuarioNavigation?.tituloTipoUsuario
                        .trim()
                        .toLocaleLowerCase('pt-BR') === 'administrador'
                )
            })
            .catch(() => {
                if (active) setIsAdmin(false)
            })
            .finally(() => {
                if (active) setCheckingRole(false)
            })

        return () => {
            active = false
        }
    }, [session])

    const login = useCallback(
        async (credentials: LoginCredentials): Promise<void> => {
            setCheckingRole(true)
            try {
                const nextSession = await auth.login(credentials)
                setIsAdmin(false)
                setSession(nextSession)
            } catch (error) {
                setCheckingRole(false)
                throw error
            }
        },
        []
    )

    const logout = useCallback((): void => {
        auth.logout()
        setSession(null)
        setIsAdmin(false)
        setCheckingRole(false)
    }, [])

    const value = useMemo<AuthContextValue>(
        () => ({
            session,
            isAuthenticated: session !== null,
            isAdmin,
            checkingRole,
            login,
            logout,
        }),
        [login, logout, session, isAdmin, checkingRole]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
    }

    return context
}

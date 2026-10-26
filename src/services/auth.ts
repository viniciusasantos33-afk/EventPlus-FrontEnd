import { eventPlusApi } from './eventPlusApi'
import type { AuthSession, LoginCredentials } from '../types/auth'
import type { LoginApi } from '../types/api'

const AUTH_STORAGE_KEYS = {
    token: 'eventplus.token',
    userId: 'eventplus.userId',
    userName: 'eventplus.user',
    userEmail: 'eventplus.userEmail',
    expires: 'eventplus.expires',
} as const

function saveSession(response: LoginApi): AuthSession {
    const session: AuthSession = {
        token: response.token,
        user: response.user,
        expires: response.expires,
    }

    localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token)
    localStorage.setItem(AUTH_STORAGE_KEYS.userId, session.user.idUsuario)
    localStorage.setItem(AUTH_STORAGE_KEYS.userName, session.user.nome)
    localStorage.setItem(AUTH_STORAGE_KEYS.userEmail, session.user.email)
    localStorage.setItem(AUTH_STORAGE_KEYS.expires, session.expires)

    return session
}

function clearStoredSession(): void {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) =>
        localStorage.removeItem(key)
    )
}

function readStoredSession(): AuthSession | null {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token)
    const idUsuario = localStorage.getItem(AUTH_STORAGE_KEYS.userId)
    const nome = localStorage.getItem(AUTH_STORAGE_KEYS.userName)
    const email = localStorage.getItem(AUTH_STORAGE_KEYS.userEmail) || ''
    const expires = localStorage.getItem(AUTH_STORAGE_KEYS.expires) || ''

    if (!token || !idUsuario || !nome) {
        clearStoredSession()
        return null
    }

    return {
        token,
        user: { idUsuario, nome, email },
        expires,
    }
}

export const auth = {
    async login(credentials: LoginCredentials): Promise<AuthSession> {
        const response = await eventPlusApi.entrar(
            credentials.email,
            credentials.senha
        )
        return saveSession(response)
    },

    getSession(): AuthSession | null {
        return readStoredSession()
    },

    logout(): void {
        clearStoredSession()
    },
}

import type { LoginUsuarioApi } from './api'

export interface AuthSession {
    token: string
    user: LoginUsuarioApi
    expires: string
}

export interface LoginCredentials {
    email: string
    senha: string
}

import type { InputHTMLAttributes } from 'react'

import './input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

function Input({ ...props }: InputProps) {
    return <input {...props} />
}

export default Input

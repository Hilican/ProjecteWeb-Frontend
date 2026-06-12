import { useState } from "react"

const RegisterForm = ({ onRegister }) => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const onSubmit = (event) => {
        event.preventDefault()
        onRegister({ username, email, password })
        setUsername('')
        setEmail('')
        setPassword('')
    }
     
    return (
        <form onSubmit={onSubmit}>
            <h2>Register</h2>
            <div>
                username
                <input
                    type="text" 
                    value={username} 
                    name="Username"
                    onChange={({ target }) => setUsername(target.value)}
                    required
                />
            </div>
            <div>
                email
                <input
                    type="email" 
                    value={email} 
                    name="Email"
                    onChange={({ target }) => setEmail(target.value)}
                    required
                />
            </div>
            <div>
                password
                <input
                    type="password" 
                    value={password} 
                    name="Password"
                    onChange={({ target }) => setPassword(target.value)}
                    required
                />
            </div>
            <button type="submit">create account</button>
        </form>
    )
}

export default RegisterForm
import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import VideogamesC from './components/Videogames'
import ProfileView from './components/Profile'
import TournamentsC from './components/Tournaments'
import loginService from './services/login'
import usersService from './services/usersService'
import token from './services/_token' //Pongo "_" para que aparezca el primero en la carpeta
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'

const App = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      token.setToken(user.token)
    }
  }, [])

  const handleLogin = async ({ username, password }) => {
    try {
      const user = await loginService.login({ username, password, })
      window.localStorage.setItem('loggedUser', JSON.stringify(user))
      token.setToken(user.token)
      setUser(user)
    } catch (exception) {
      // TODO: Error handling
      console.log('Wrong credentials')
      console.log(exception.response?.data?.error || exception.message)
    }
  }

  const handleRegister = async ({ username, email, password }) => {
    try {
      const user = await usersService.createSimpleUser({ username, email, password })
      console.log('User Registered Successfully')
      console.log(user)
      alert('Registro completado');
    } catch (exception) {
        console.log('Error en el registro:', exception.response?.data?.error || exception.message)
    }
  }

  const handleLogout = () => {
    setUser(null)
    token.setToken(null)
    window.localStorage.removeItem('loggedUser')
  }

  const padding = { padding: 5 }
  return (
    <Router>
      <div>
        <h1>App EN DESAROLLO</h1>

        {/* Si el usuario está logueado,se ve su nombre arriba */}
        {user && (
          <div style={{ marginBottom: '10px' }}>
            <span>{user.username} is logged-in | Role: {user.role} </span>
          </div>
        )}
        <div>
          <Link style={padding} to="/">home</Link>
          <Link style={padding} to="/tournaments">tournaments</Link>
          <Link style={padding} to="/videogames">videogames</Link>
        </div>
        {user == null ? (
          <div>
            <Link style={padding} to="/register">register</Link>
            <Link style={padding} to="/login">login</Link>
          </div>
          )
          :(
          <div>
            <Link style={padding} to="/profile">profile</Link>
            <Link style={padding} to="/" onClick={handleLogout}>logout</Link>
          </div>)
        }
        {user !== null && (
          <div>
            {/*ADMINISTRADORES */}
            {user.role === 'admin' && (
              <>
                <Link style={padding} to="/videogames/create">crear videojuego</Link>
                <Link style={padding} to="/createSpecialUser">crear usuario+</Link>
              </>
            )}
            {/*ORGANIZADORES */}
            {user.role === 'organizer' && (
              <>
                <Link style={padding} to="/tournaments/create">crear torneo</Link>
                <Link style={padding} to="/organizer/tournaments">mis torneos</Link>
              </>
            )}
            {/* USERS */}
            {user.role === 'user' && (
              <>
                <Link style={padding} to="/user/tournaments">mis inscripciones</Link>
              </>
            )}
          </div>
        )}

        <Routes>
          {/* HOME */}
          <Route path="/" element={
            user === null 
              ? (
                <div>
                  <h2>¡Bienvenido!</h2>
                  <p>Por favor, inicia sesión o regístrate para ver tus notas.</p>
                  <Link to="/login"><button>Iniciar Sesión</button></Link>
                  <Link to="/register"><button>Crear Cuenta</button></Link>
                </div>
              )
              : <Navigate replace to="/" />
          } />
          {/* Profile */}
          <Route path="/profile" element={
            user !== null 
              ? (
                <ProfileView username={user.username} />
              )
              : <Navigate replace to="/" />
          } />
          <Route path="/organizer/tournaments" element={
            user && user.role === 'organizer' ? 
              (
                <TournamentsC.MyTournaments user={user} />
              )
              : <Navigate replace to="/" />
          } />
          <Route path="/user/tournaments" element={user && user.role === 'user' ? (
            <TournamentsC.MyInscriptions user={user} />
          ) : (
            <Navigate replace to="/" />
          )} />

          {/* LOGIN */}
          <Route path="/login" element={
            user === null 
              ? (
                <div>
                  <LoginForm onLogin={handleLogin} />
                  <br />
                  <Link to="/">Volver al inicio</Link>
                </div>
              )
              : <Navigate replace to="/" />
          } />

          {/* REGISTRO */}
          <Route path="/register" element={
            user === null 
              ? (
                <div>
                  <RegisterForm onRegister={handleRegister} />
                  <br />
                  <Link to="/">Volver al inicio</Link>
                </div>
              )
              : <Navigate replace to="/" />
          } />
          <Route path="/createSpecialUser" element={
            user !== null && user.role === 'admin'
              ? (
                <div>
                  <Link to="/">POR HACER</Link>
                </div>
              )
              : <Navigate replace to="/" />
          } />
      
          {/* VIDEOGAMES */}
          <Route path="/videogames" element={
            <VideogamesC.Videogames />
          } />
          <Route path="/videogames/create" element={user && user.role === 'admin' ? (
            <VideogamesC.CreateVideogame />
          ) : (
            <Navigate replace to="/" />
          )} />
          {/* TOURNAMENTS */}
          <Route path="/tournaments" element={
            <TournamentsC.Tournaments />
          } />
          <Route path="/tournaments/:id" element={
            <TournamentsC.Tournament user={user} />
          } />
          <Route path="/tournaments/create" element={user && user.role === 'organizer' ? (
            <TournamentsC.CreateTournament />
          ) : (
            <Navigate replace to="/" />
          )} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
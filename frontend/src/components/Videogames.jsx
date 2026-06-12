import { useState, useEffect } from 'react'
import videogameService from '../services/videogamesService'

const Videogames = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchName, setSearchName] = useState('')
  const [searchDescription, setSearchDescription] = useState('')

  useEffect(() => {
    videogameService.getAll()
      .then(initialGames => {
        setGames(initialGames)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error al cargar los videojuegos:', err)
        setError('No se pudo conectar con el servidor')
        setLoading(false)
      })
  }, [])

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchName.toLowerCase()) &&
    game.description.toLowerCase().includes(searchDescription.toLowerCase())
  )

  if (loading) return <p>Cargando lista de videojuegos...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h2>Catálogo de Videojuegos</h2>
      <div>
        <label>Buscar videojuego: </label>
        <input
          type="text"
          placeholder="Escribe el nombre..."
          value={searchName}
          onChange={({ target }) => setSearchName(target.value)}
        />
        <input
          type="text"
          placeholder="Escribe la descripción..."
          value={searchDescription}
          onChange={({ target }) => setSearchDescription(target.value)}
        />
      </div>
      <br />
      {filteredGames.length === 0 ? (
        <p>No hay ningún videojuego registrado.</p>
      ) : (
        <ul>
            {filteredGames.map(game => (
                <Videogame key={game.id} game={game} />
            ))}
        </ul>
      )}
    </div>
  )
}

const Videogame = ({ game }) => {
  return (
    <li>
      <h3>{game.name}</h3>
      <p>{game.description || 'Sin descripción'}</p>
    </li>
  )
}

const VideogameForm = ({ onCreate }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const onSubmit = (event) => {
    event.preventDefault()
    onCreate({ name, description })
    setName('')
    setDescription('')
  }

  return (
    <form onSubmit={onSubmit}>
      <h3>Añadir Nuevo Videojuego</h3>
      <div>
        Nombre:
        <input
          type="text"
          value={name}
          onChange={({ target }) => setName(target.value)}
          required
        />
      </div>
      <div>
        Descripción:
        <input
          type="text"
          value={description}
          onChange={({ target }) => setDescription(target.value)}
          required
        />
      </div>
      <button type="submit">Guardar Videojuego</button>
    </form>
  )
}

const CreateVideogame = () => {
  const [error, setError] = useState(null)
  const handleSubmit = async (newGameData) => {
    event.preventDefault()
    try {
      await videogameService.create(newGameData)
      alert(`Videojuego creado correctamente`)
      console.error('Videojuego creado correctamente')
      setError(null)
    } catch (exception) {
      console.error('Error al crear el videojuego:', exception)
      setError('No se pudo crear el videojuego. Comprueba que el nombre no esté repetido.')
    }
  }
  return (
    <div>
      <VideogameForm onCreate={handleSubmit} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default { Videogames, CreateVideogame }
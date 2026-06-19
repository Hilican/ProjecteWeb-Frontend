import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom';
import tournamentsService from '../services/tournamentsService'

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchName, setSearchName] = useState('')
  const [searchGame, setSearchGame] = useState('')
  const [searchState, setSearchState] = useState('')

  useEffect(() => {
    tournamentsService.getAll()
      .then(initialTournaments => {
        setTournaments(initialTournaments)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error al cargar los torneos:', err)
        setError('No se pudo conectar con el servidor')
        setLoading(false)
      })
  }, [])

  const filteredTournaments = tournaments.filter(tournament => 
    tournament.name.toLowerCase().includes(searchName.toLowerCase()) &&
    tournament.videogameName.toLowerCase().includes(searchGame.toLowerCase()) &&
    tournament.stateTournament.toLowerCase().includes(searchState.toLowerCase())
  )

  if (loading) return <p>Cargando lista de torneos...</p>
  if (error) return <p>{error}</p>
  
  return (
    <div>
      <h2>Catálogo de Tournaments</h2>
      <div>
      <label>Buscar Torneo: </label>
        <input
          type="text"
          placeholder="Escribe el nombre..."
          value={searchName}
          onChange={({ target }) => setSearchName(target.value)}
        />
        <input
          type="text"
          placeholder="Escribe el juego..."
          value={searchGame}
          onChange={({ target }) => setSearchGame(target.value)}
        />
        <br></br>
        Estado del torneo:
        <select value={searchState} onChange={({ target }) => setSearchState(target.value)}>
          <option value="">Todos los estados</option>
          <option value="Anunciat">Anunciat</option>
          <option value="inscripcions obertes">Inscripcions Obertes</option>
          <option value="en curs">En Curs</option>
          <option value="finalitzat">Finalitzat</option>
        </select>
      </div>
      {filteredTournaments.length === 0 ? (
        <p>No hay ningún torneo para mostrar.</p>
      ) : (
        <ul>
            {filteredTournaments.map(tournament => (
                <TournamentDisplay key={tournament.id} tournament={tournament} showButton={true} />
            ))}
        </ul>
      )}
    </div>
  )
}

const Tournament = ({ user }) => {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isParticipant, setIsParticipant] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLoading(true)
    Promise.all([
      tournamentsService.getOne(id),
      tournamentsService.getGamesFromTournament(id)
    ])
    .then(([tournamentData, gamesData]) => {
      setTournament(tournamentData)
      setGames(gamesData)
      setLoading(false)
    })
    .catch(err => {
      console.error('Error al cargar los datos del torneo:', err)
      setError('No se pudo cargar la información completa del torneo')
      setLoading(false)
    })
  }, [id, updateTrigger])

  useEffect(() => {
    if (user && user.role === 'user') {
      tournamentsService.isRegistered(id, user.username)
        .then(response => {
          setIsParticipant(response.isRegistered)
        })
        .catch(err => console.error('Error al comprobar inscripción:', err)) 
    }
  }, [id, user, updateTrigger])

  const handleModify = (tournamentId, fieldsToUpdate) => {
    tournamentsService.modifyTournament(tournamentId, fieldsToUpdate)
      .then(() => {
        alert('¡Torneo actualizado con éxito!');
        setIsEditing(false); 
        setUpdateTrigger(!updateTrigger);
      })
      .catch(err => {
        console.error('Error al modificar:', err);
        alert(err.response?.data?.error || 'Hubo un problema al actualizar.');
      });
  };

  if (loading) return <p>Cargando detalles del torneo...</p>
  if (error) return <p>{error}</p>
  if (!tournament) return <p>Torneo no encontrado.</p>

  const handleRegister = () => {
    console.log(`Inscribiendo al usuario ${user.username} en el torneo ${id}`);
    tournamentsService.signIn(id)
    .then(data => {
      alert('¡Te has inscrito correctamente en el torneo!');
      setUpdateTrigger(!updateTrigger);
    })
    .catch(err => {
      console.error('Error al inscribirse:', err);
      alert('Hubo un problema al intentar inscribirte.');
    });
  };

  const handleUnregister = () => {
    console.log(`Dando de baja al usuario ${user.username} del torneo ${id}`)
    
    // Confirmación previa por seguridad para que el usuario no pulse por error
    const confirmCancel = window.confirm('¿Seguro que quieres borrar tu inscripción de este torneo?')
    if (!confirmCancel) return

    tournamentsService.signOut(id, user.username)
      .then(data => {
        alert('Te has desinscrito correctamente del torneo.')
        setUpdateTrigger(!updateTrigger)
      })
      .catch(err => {
        console.error('Error al desinscribirse:', err)
        alert('Hubo un problema al intentar borrar tu inscripción.')
      })
  }

  const isOwner = user && tournament && user.username === tournament.organizerName;

  return (
    <div>
      <h2>Detalles del Torneo</h2>
      {user && isParticipant && (
        <div style={{ margin: '10px 0', padding: '8px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
          <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>
            ✓ Estás registrado en este torneo
          </p>
        </div>
      )}
      <TournamentDisplay tournament={tournament} />
      {isOwner && !isEditing && (
        <div>
          <button onClick={() => setIsEditing(true)} style={{ backgroundColor: '#ffc107', color: 'black', fontWeight: 'bold' }}>
            Modificar torneo
          </button>
        </div>
      )}
      {isEditing && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <ModifyTournamentForm 
            tournamentToEdit={tournament} 
            onModify={handleModify}
            onCancel={() => setIsEditing(false)}
          />
          {/* Añadimos un botón de cancelar al lado/debajo para salir del modo edición */}
          <button 
            type="button" 
            onClick={() => setIsEditing(false)} 
            style={{ marginTop: '10px', backgroundColor: '#6c757d', color: 'white' }}
          >
            Cancelar
          </button>
        </div>
      )}
      {user && user.role === 'user' && tournament.stateRegistration === 'Oberta' && (
        isParticipant ? (
          /* Si SÍ es participante: Mostramos el botón de borrar inscripción */
          <div>
            <button type="button" onClick={handleUnregister}>
              Anular mi inscripción
            </button>
          </div>
        ) : (
          /* Si NO es participante: Mostramos el botón de inscribirse */
          <div>
            <button type="button" onClick={handleRegister}>
              Inscribirme en este torneo
            </button>
          </div>
        )
      )}
      <h3>Juegos del Torneo</h3>
      <ul>
        {games.map(game => (
          <GameDisplay key={game.id} game={game} />
        ))}
    </ul>
    </div>
  )
}

const TournamentDisplay = ({ tournament, showButton = false }) => {
  return (
    <li>
      <h3 style={{ marginBottom: '5px' }}><strong>Nombre:</strong> {tournament.name}</h3>
      
      <p style={{ margin: '2px 0' }}><strong>Descripción:</strong> {tournament.description || 'Sin descripción'}</p>
      <p style={{ margin: '2px 0' }}><strong>Tipo:</strong> {tournament.type}</p>
      <p style={{ margin: '2px 0' }}><strong>Rondas:</strong> {tournament.rounds}</p>
      <p style={{ margin: '2px 0' }}><strong>Estado de inscripción:</strong> {tournament.stateRegistration}</p>
      <p style={{ margin: '2px 0' }}><strong>Estado del torneo:</strong> {tournament.stateTournament}</p>
      <p style={{ margin: '2px 0' }}><strong>Fecha de inicio:</strong> {tournament.tournament_start_date}</p>
      <p style={{ margin: '2px 0' }}><strong>Fecha de fin:</strong> {tournament.tournament_end_date}</p>
      <p style={{ margin: '2px 0' }}><strong>Videojuego:</strong> {tournament.videogameName}</p>
      <p style={{ margin: '2px 0' }}><strong>Organizador:</strong> {tournament.organizerName}</p>
      
      {showButton && (
        <Link to={`/tournaments/${tournament.id}`}>
          <button style={{ marginTop: '10px' }}>Ver detalles del torneo</button>
        </Link>
      )}
    </li>
  )
}

const GameDisplay = ({ game }) => {
  const translateState = (state) => {
    switch (state) {
      case 'ToDefinePlayers': return 'Esperando rivales';
      case 'ToPlay': return 'Pendiente por jugar';
      case 'Played': return 'Finalizado';
      default: return state || 'Desconocido';
    }
  };

  const translateResult = (result, state) => {
    if (state !== 'Played') return 'Partido no jugado aún';
    
    switch (result) {
      case 0: return 'Empate';
      case 1: return 'Ganador: Jugador 1';
      case 2: return 'Ganador: Jugador 2';
      default: return 'Sin resultado';
    }
  };

  return (
    <li style={{ padding: '10px 0', borderBottom: '1px solid #ccc', listStyle: 'none' }}>
      {/* Título de la partida */}
      <h4 style={{ marginBottom: '5px' }}><strong>Partida #{game.id}</strong></h4>
      
      {/* Campos de la base de datos adaptados con márgenes juntos */}
      <p style={{ margin: '2px 0' }}><strong>Ronda:</strong> {game.round === 0 ? 'Sin rondas (Única)' : `Ronda ${game.round}`}</p>
      <p style={{ margin: '2px 0' }}><strong>Estado:</strong> {translateState(game.state)}</p>
      
      {/* Ojo: Aquí asumo que en tu backend haces un JOIN para traer los nombres de los jugadores.
        Si solo traes el ID numérico, cambia 'player1Name' por 'player1'.
      */}
      <p style={{ margin: '2px 0' }}><strong>Jugador 1:</strong> {game.player1Name || game.player1 || 'Por definir'}</p>
      <p style={{ margin: '2px 0' }}><strong>Jugador 2:</strong> {game.player2Name || game.player2 || 'Por definir'}</p>
      
      <p style={{ margin: '2px 0', color: game.state === 'Played' ? '#2e7d32' : '#666' }}>
        <strong>Resultado:</strong> {translateResult(game.result, game.state)}
      </p>
    </li>
  );
}

const CreateTournament = () => {
  const [error, setError] = useState(null)
  const handleSubmit = async (newTournamentData) => {
    event.preventDefault()
    try {
      await tournamentsService.create(newTournamentData)
      alert(`Torneo creado correctamente`)
      console.error('Torneo creado correctamente')
      setError(null)
    } catch (exception) {
      console.error('Error al crear el torneo:', exception)
      setError('No se pudo crear el torneo. Ver consola para más detalles.')
    }
  }
  return (
    <div>
      <TournamentForm onCreate={handleSubmit} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

const TournamentForm = ({ onCreate }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [videogame, setVideogame] = useState('')
  const [type, setType] = useState('torneig') // Valor por defecto
  const [rounds, setRounds] = useState(0)
  const [tournamentStartDate, setTournamentStartDate] = useState('')
  const [tournamentEndDate, setTournamentEndDate] = useState('')

  const onSubmit = (event) => {
    event.preventDefault()

    // Creamos el objeto con las claves EXACTAS que espera el allowedFields del backend
    const newTournamentData = {
      name: name,
      description: description,
      videogame: videogame,
      type: type,
      rounds: Number(rounds),       // Nos aseguramos de pasarlo a número (INTEGER)
      tournament_start_date: tournamentStartDate,
      tournament_end_date: tournamentEndDate
    }

    console.log("Lo que estás enviando tú:", newTournamentData);

    // Se lo enviamos al handler del padre
    onCreate(newTournamentData)

    // Limpiamos los campos del formulario
    setName('')
    setDescription('')
    setVideogame('')
    setType('torneig')
    setRounds(0)
    setTournamentStartDate('')
    setTournamentEndDate('')
  }

  return (
    <form onSubmit={onSubmit}>
      <h3>Crear Nuevo Torneo</h3>

      <div>
        Nombre del torneo:
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

      <div>
        Videojuego:
        <input
          type="text"
          value={videogame}
          onChange={({ target }) => setVideogame(target.value)}
          required
        />
      </div>

      <div>
        Tipo de torneo (por ahora solo torneo):
        <select value={type} onChange={({ target }) => setType(target.value)}>
          <option value="torneig">Torneig</option>
        </select>
      </div>

      <div>
        Número de rondas (0 si no tiene):
        <input
          type="number"
          min="0"
          value={rounds}
          onChange={({ target }) => setRounds(target.value)}
          required
        />
      </div>

      <div>
        Fecha de inicio:
        <input
          type="date"
          value={tournamentStartDate}
          onChange={({ target }) => setTournamentStartDate(target.value)}
          required
        />
      </div>

      <div>
        Fecha de fin:
        <input
          type="date"
          value={tournamentEndDate}
          onChange={({ target }) => setTournamentEndDate(target.value)}
          required
        />
      </div>

      <button type="submit">Crear Torneo</button>
    </form>
  )
}

const MyTournaments = ({ user }) => {
  const [tournamentsOwner, setTournamentsOwner] = useState([])
  const [tournamentsSupport, setTournamentsSupport] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    tournamentsService.getMyTournaments(user.username)
      .then(response => {
        setTournamentsOwner(response.tournaments)
        setTournamentsSupport(response.supportTournaments)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error al cargar los torneos:', err)
        setError('No se pudo conectar con el servidor')
        setLoading(false)
      })
  }, [user])

  if (loading) return <div>Cargando tus torneos...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div>
      <h2>Mis Torneos Creados</h2>
      {tournamentsOwner.length === 0 ? <p>No has creado ningún torneo todavía.</p> : (
        <ul>
          {tournamentsOwner.map(tournament => (
            <li key={tournament.id}>      
            <h3 style={{ marginBottom: '5px' }}><strong>Nombre:</strong> {tournament.name}</h3>
            <p style={{ margin: '2px 0' }}><strong>Estado del torneo:</strong> {tournament.stateTournament}</p>
            <p style={{ margin: '2px 0' }}><strong>Fecha de inicio:</strong> {tournament.tournament_start_date}</p>
            <p style={{ margin: '2px 0' }}><strong>Fecha de fin:</strong> {tournament.tournament_end_date}</p>
            <Link to={`/tournaments/${tournament.id}`}>
              <button style={{ marginTop: '10px' }}>Ver detalles del torneo</button>
            </Link>
            </li>
          ))}
        </ul>
      )}

      <h2>Torneos de Soporte / Ayudante</h2>
      {tournamentsSupport.length === 0 ? <p>No estás asignado como soporte en ningún torneo.</p> : (
        <ul>
          {tournamentsSupport.map(tournament => (
            <li key={tournament.id}>      
            <h3 style={{ marginBottom: '5px' }}><strong>Nombre:</strong> {tournament.name}</h3>
            <p style={{ margin: '2px 0' }}><strong>Estado del torneo:</strong> {tournament.stateTournament}</p>
            <p style={{ margin: '2px 0' }}><strong>Fecha de inicio:</strong> {tournament.tournament_start_date}</p>
            <p style={{ margin: '2px 0' }}><strong>Fecha de fin:</strong> {tournament.tournament_end_date}</p>
            <Link to={`/tournaments/${tournament.id}`}>
              <button style={{ marginTop: '10px' }}>Ver detalles del torneo</button>
            </Link>
            </li> 
          ))}
        </ul>
      )}
    </div>
  )
}

const ModifyTournamentForm = ({ tournamentToEdit, onModify, onCancel }) => {
  const [description, setDescription] = useState('')
  const [videogame, setVideogame] = useState('')
  const [type, setType] = useState('torneig')
  const [rounds, setRounds] = useState(0)
  const [tournamentStartDate, setTournamentStartDate] = useState('')
  const [tournamentEndDate, setTournamentEndDate] = useState('')
  const [stateRegistration, setStateRegistration] = useState('PerObrir')
  const [stateTournament, setStateTournament] = useState('Anunciat')

  useEffect(() => {
    if (tournamentToEdit) {
      setDescription(tournamentToEdit.description)
      setVideogame(tournamentToEdit.videogameName)
      setTournamentStartDate(tournamentToEdit.tournament_start_date)
      setTournamentEndDate(tournamentToEdit.tournament_end_date)
      setStateRegistration(tournamentToEdit.stateRegistration)
      setStateTournament(tournamentToEdit.stateTournament)
    }
  }, [tournamentToEdit])

  const handleSubmit = (event) => {
    event.preventDefault()

    const updatedFields = {}

    if (description !== tournamentToEdit.description) updatedFields.description = description
    if (videogame !== tournamentToEdit.videogame) updatedFields.videogame = videogame
    if (tournamentStartDate !== tournamentToEdit.tournament_start_date) updatedFields.tournament_start_date = tournamentStartDate
    if (tournamentEndDate !== tournamentToEdit.tournament_end_date) updatedFields.tournament_end_date = tournamentEndDate
    if (stateRegistration !== tournamentToEdit.stateRegistration) updatedFields.stateRegistration = stateRegistration
    if (stateTournament !== tournamentToEdit.stateTournament) updatedFields.stateTournament = stateTournament

    if (Object.keys(updatedFields).length === 0) {
      alert("No has modificado ningún campo.")
      return
    }

    console.log("Campos modificados que viajan al backend:", updatedFields)
    onModify(tournamentToEdit.id, updatedFields)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Modificar Campos del Torneo</h3>

      <label>
        <strong>Descripción:</strong>
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          rows="3"
        />
      </label>
      <br></br>
      <label>
        <strong>Nombre del Videojuego:</strong>
        <input 
          type="text" 
          value={videogame} 
          onChange={(e) => setVideogame(e.target.value)} 
        />
      </label>
      <br></br>
      <label>
        <strong>Fecha Inicio:</strong>
        <input 
          type="date" 
          value={tournamentStartDate} 
          onChange={(e) => setTournamentStartDate(e.target.value)} 
        />
      </label>
      <br></br>
      <label>
        <strong>Fecha Fin:</strong>
        <input 
          type="date" 
          value={tournamentEndDate} 
          onChange={(e) => setTournamentEndDate(e.target.value)} 
        />
      </label>
      <br></br>
      <label>
        <strong>Estado de las Inscripciones:</strong>
        <select value={stateRegistration} onChange={(e) => setStateRegistration(e.target.value)}>
          <option value="PerObrir">Per Obrir</option>
          <option value="Oberta">Oberta</option>
          <option value="Tancada">Tancada</option>
        </select>
      </label>
      <br></br>
      <label>
        <strong>Estado del Torneo:</strong>
        <select value={stateTournament} onChange={(e) => setStateTournament(e.target.value)}>
          <option value="Anunciat">Anunciat</option>
          <option value="inscripcions obertes">Inscripcions Obertes</option>
          <option value="en curs">En Curs</option>
          <option value="finalitzat">Finalitzat</option>
        </select>
      </label>
      <br></br>
      <div>
        <button type="submit">Guardar Cambios</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}

const MyInscriptions = ({ user }) => {
  const [myTournaments, setMyTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    tournamentsService.getMyInscriptions(user.username)
      .then(tournaments => {
        setMyTournaments(tournaments)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error al cargar tus inscripciones:', err)
        setError('No se pudieron cargar tus torneos inscritos.')
        setLoading(false)
      })
  }, [user])

  if (!user) return <p>Por favor, inicia sesión para ver tus inscripciones.</p>
  if (loading) return <p>Cargando tus torneos inscritos...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h2>Mis Inscripciones</h2>
      
      {myTournaments.length === 0 ? (
        <p>No estás inscrito en ningún torneo todavía.</p>
      ) : (
        <div>
          {/* Recorremos el array y reutilizamos tu componente visual */}
          {myTournaments.map(tournament => (
            <div key={tournament.id}>
              <TournamentDisplay tournament={tournament} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default {Tournaments, CreateTournament, Tournament, MyTournaments, MyInscriptions}
import noteService from './services/noteService'
import { useState, useEffect } from 'react'

const Note = ({ note }) => {
    return (
        <li>{note.content}</li>
    )
}

const NoteForm = (props) => {
    const [newNoteText, setNewNoteText] = useState('')
    const onSubmit = (event) => {
    event.preventDefault()
    props.onAddNote({ content: newNoteText })
    setNewNoteText("")
    }
    return <form onSubmit={onSubmit}>
        <input
            value={newNoteText}
            onChange={({ target }) => setNewNoteText(target.value)}
        />
        <button type="submit">save</button>
    </form>
}

const Notes = () => {
    const [notes, setNotes] = useState([])
    useEffect(() => {
        noteService
        .getAll().then(initialNotes => setNotes(initialNotes))
    }, [])

    const addNote = (note) => {
        const noteObject = {
            content: note.content,
            important: Math.random() < 0.5,
            id: notes.length + 1,
        }
        noteService.create(noteObject)
        .then(response => setNotes(notes.concat(response)))
    }

    return <div>
        <ul>
            {notes.map(note => <Note key={note.id} note={note} />)}
        </ul>
        <NoteForm onAddNote={addNote} />
    </div>
}


export default Notes
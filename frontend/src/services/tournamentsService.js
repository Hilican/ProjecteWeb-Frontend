import axios from 'axios'
import { getToken } from './_token'
const baseUrl = 'http://localhost:3001/api/tournaments'

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}

const getOne = (id) => {
    const request = axios.get(`${baseUrl}/${id}`)
    return request.then(response => response.data)
}

const getGamesFromTournament = (id) => {
    const request = axios.get(`${baseUrl}/${id}/games`)
    return request.then(response => response.data)
}

const getMyTournaments = (username) => {
    const config = {
        headers: { Authorization: getToken() }
    }
    const request = axios.get(`${baseUrl}/organizer/username/${username}`, config)
    return request.then(response => response.data)
}

const getMyInscriptions = (username) => {
    const config = {
        headers: { Authorization: getToken() }
    }
    const request = axios.get(`${baseUrl}/user/${username}`, config)
    return request.then(response => response.data)
}

const create = async newObject => {
    const config = {
        headers: { Authorization: getToken() }
    }
    const response = await axios.post(baseUrl, newObject, config)
    return response.data
}

const isRegistered = (tournamentId, username) => {
    const config = {
        headers: { Authorization: getToken() }
    }
    const request = axios.get(`${baseUrl}/${tournamentId}/participants/${username}`, config)
    return request.then(response => response.data)
}

const signIn = async (tournamentId) => {
    const config = {
        headers: { Authorization: getToken() }
    }
    const response = await axios.post(`${baseUrl}/${tournamentId}/participants`, {}, config)
    return response.data
}

const signOut = async (tournamentId, username) => {
    const config = {
        headers: { Authorization: getToken() }
    }
    const response = await axios.delete(`${baseUrl}/${tournamentId}/participants/username/${username}`, config)
    return response.data
}

const modifyTournament = async ( tournamentId, newObject) => {
    const config = {
        headers: { Authorization: getToken() }
    }
    const response = await axios.patch(`${baseUrl}/${tournamentId}`, newObject, config)
    return response.data
}

export default { 
    getAll, getOne, getGamesFromTournament, getMyInscriptions,
    create,
    isRegistered, signIn, signOut,
    getMyTournaments, modifyTournament
}
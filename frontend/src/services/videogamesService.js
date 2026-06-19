import axios from 'axios'
import { getToken } from './_token'
const baseUrl = 'http://localhost:3001/api/videogames'

const getAll = async () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}

const getOne = async (id) => {
    const request = axios.get(`${baseUrl}/${id}`)
    return request.then(response => response.data)
}

const create = async newObject => {
    const config = {
        headers: { Authorization: getToken() }
    }
    const response = await axios.post(baseUrl, newObject, config)
    return response.data
}

export default { getAll, getOne, create }
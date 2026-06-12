import axios from 'axios'
import { getToken } from './_token'
const baseUrl = 'http://localhost:3001/api/users'

const createSimpleUser = async newObject => {
    const response = await axios.post(baseUrl + "/createUser", newObject)
    return response.data
}

const getMe = async (username) => {
    const response = await axios.get(baseUrl + `/username/${username}`)
    return response.data
}

const updateMe = async (username, updatedData) => {
    const config = {
        headers: { Authorization: getToken() }
    }
    const response = await axios.patch(baseUrl + `/username/${username}`, updatedData, config)
    return response.data
}

export default { createSimpleUser, getMe, updateMe }
let token = null

const setToken = newToken => {
    token = `Bearer ${newToken}`
}

export const getToken = () => {
    return token
}

export default { setToken, getToken }
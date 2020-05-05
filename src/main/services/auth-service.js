require('dotenv').config()
const keytar = require('keytar')
const url = require('url')
const os = require('os')
const request = require('request')

const STREAMLABS_API_BASE = 'https://www.streamlabs.com/api/v1.0'

const redirectUri = `file:///callback`

const keytarService = 'donation-printer'
const keytarAccount = os.userInfo().username

let accessToken = null
let refreshToken = null
let socketToken = null

function getAccessToken() {
    return accessToken
}

function getSocketToken() {
    return socketToken
}

function getAuthenticationURL() {
    return (
        STREAMLABS_API_BASE +
        '/authorize?' +
        'client_id=' +
        process.env.STREAMLABS_CLIENT_ID +
        '&' +
        'scope=donations.read+socket.token&' +
        'response_type=code&' +
        '&' +
        'redirect_uri=' +
        redirectUri
    )
}

function refreshTokens() {
    // streamlabs doesn't expire its token so we just grab the access token from keytar
    return new Promise(async (resolve, reject) => {
        const token = await keytar.getPassword(keytarService, keytarAccount)

        if (!token) return reject(new Error('no token available'))

        accessToken = token

        global.accessToken = accessToken

        await getSocketTokenFromRemote()

        resolve()
    })
}

function getSocketTokenFromRemote() {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `${STREAMLABS_API_BASE}/socket/token?access_token=${accessToken}`
        }

        request(options, (error, resp, body) => {
            const responseBody = JSON.parse(body)
            socketToken = responseBody.socket_token

            resolve()
        })
    })
}

function loadTokens(callbackURL) {
    return new Promise((resolve, reject) => {
        const urlParts = url.parse(callbackURL, true)
        const query = urlParts.query

        const exchangeOptions = {
            grant_type: 'authorization_code',
            client_id: process.env.STREAMLABS_CLIENT_ID,
            client_secret: process.env.STREAMLABS_CLIENT_SECRET,
            code: query.code,
            redirect_uri: redirectUri
        }

        const options = {
            method: 'POST',
            url: `${STREAMLABS_API_BASE}/token`,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(exchangeOptions)
        }

        request(options, async (error, resp, body) => {
            if (error) {
                logout()
                return reject(error)
            }

            const responseBody = JSON.parse(body)
            accessToken = responseBody.access_token
            global.accessToken = accessToken
            refreshToken = responseBody.refresh_token

            // streamlabs doesn't expire the token so we store the access token instead of the refresh token
            await keytar.setPassword(keytarService, keytarAccount, accessToken)

            await getSocketTokenFromRemote()

            resolve()
        })
    })
}

async function logout() {
    await keytar.deletePassword(keytarService, keytarAccount)
    accessToken = null
    refreshToken = null
}

export default {
    getAccessToken,
    getAuthenticationURL,
    loadTokens,
    logout,
    refreshTokens,
    getSocketToken
}
#!/usr/bin/env node

const Mineflayer = require('mineflayer')
const { Vec3 } = require('vec3')
const mcping = require('mcping-js')
const moment = require('moment')
const antiafk = require("mineflayer-antiafk");
const DISPLAY_CHAT = false

let ticks = 0
let lastServerRestart = null

process.on('uncaughtException', (error) => {
  console.error(`An uncaught exception occurred at ${timestamp()}:`, error)
})

function log(message, chat) {
    console.log(`[${timestamp()}][${chat ? 'CHAT' : 'SELF'}]: ${message}`)
}

function timestamp() {
    return moment().subtract(3, 'hours').format('YYYY-MM-DD HH:mm:ss')  
}


async function sleeps(seconds) {
    return sleep(seconds*1000)
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function quit() {
    if(bot) {
        bot.quit()
        bot = null
    } else {
        log('Bot is already null')
    }
}

function createBot() {
    log('Logging in')
    bot = Mineflayer.createBot({
        host: 'hamhung.0b0t.org',
        username: '_Robot_Duck',
        auth: 'microsoft',
        version: '1.12.2',
        hideErrors: true
    })
    bot.loadPlugin(antiafk);
    log('Logged in')
    registerFunctions()
}


function registerFunctions() {
    bot.on('messagestr', async (message, position, jsonMsg, sender, verified) => {
        message = message.trim()
        if(message && DISPLAY_CHAT)
            log(message, true)
        const matchesTpRequest = message.match(/^(.*?) wants to teleport to you\.$/)
        const serverRestarting = message.match(/^\[Server\] Server restarting or shutting down in ..? seconds...$/)
        if(serverRestarting) {
            log('Server restart detected. Relogging soon')
            quit()
            lastServerRestart = moment()
            return
        }
        if(!matchesTpRequest)
            return
        const user = matchesTpRequest[1]
        if(bot.entity.position.distanceTo(new Vec3(0,0,0)) > 5000 || user == 'Kepterv')
            bot.chat('/tpn ' + user)
        else
            bot.chat('/tpy ' + user)
    })
    bot.on("spawn", () => {
        bot.afk.setOptions({ fishing: false })
        bot.afk.start()
    })
    bot.on('kicked', async (reason) => {
        log(`Kicked for reason: ${reason}`)
        let defaultKickMessages = [
            'ReadTimeoutException',
            'Not authenticated with',
            'Error occurred while contacting login servers, are they down?'
        ]
        if(reason.includes('You are already connected to this proxy!')) {
            quit()
            return
        }
        for(const message of defaultKickMessages) {
            if(reason.includes(message)) {
                recentlyDisconnected = true
                log('waiting 5s')
                await sleeps(5)
                quit()
                createBot()
                break
            }
        }
    })
    bot.on('error', async (err) => {
        log('Error:')
        log(err)
        let defaultReconnectMessages = [
            'Failed to obtain profile data for',
            'RateLimiter disallowed request',
            'Response is not JSON. Status code: 503',
            'Socket timeout',
            'client timed out after 30000'
        ]
        for(const message of defaultReconnectMessages) {
            if(err.toString().includes(message)) {
                log('Reconnecting after error')
                quit()
                await sleeps(60)
                createBot()
            }
        }
    })
    // bot.on('physicsTick', () => {
    //     ticks++
    //     if(ticks % 100 != 0)
    //         return
    //     bot.chat('kit (this is an automated attempt at jamming bots that do not have a command prefix. Please /ignore me. Thank you)')
    // })
}


let lastOnline = moment()
createBot()
while(true) {
    try {
        const server = new mcping.MinecraftServer('hamhung.0b0t.org', 25565)
        server.ping(3000, 47, (err, res) => {
            if(err) {
                log(err)
                return
            }
            let isOnline = res.players.sample.find(p => p.name == '_Robot_Duck')
            if(isOnline)
                lastOnline = moment()
            log(`lastOnline = ${timestamp()}`)
            let minutesSinceLastOnline = moment.duration(moment().diff(lastOnline)).asMinutes()
            let minutesSinceLastServerRestart = moment.duration(moment().diff(lastServerRestart)).asMinutes()
            if(minutesSinceLastOnline > 3 && lastServerRestart > 5) {
                log('Should relogin after 3 min downtime')
                createBot()
            }
        })
    } catch (error) {
        log('Error:')
        log(error.toString())
    }
    sleeps(60)
}

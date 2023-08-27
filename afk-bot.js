#!/usr/bin/env node

const Mineflayer = require('mineflayer')
const { Vec3 } = require('vec3')
const mcping = require('mcping-js')
const moment = require('moment')
const antiafk = require("mineflayer-antiafk");

function log(message, chat) {
    console.log(`[${timestamp()}][${chat ? 'CHAT' : 'SELF'}]: ${message}`)
}

function timestamp() {
    return moment().subtract(3, 'hours').format('YYYY-MM-DD HH:mm:ss')  
}

let ticks = 0

async function sleeps(seconds) {
    return sleep(seconds*1000)
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
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
        if(message)
            log(message)
        const matchesTpRequest = message.match(/^(.*?) wants to teleport to you\.$/)
        if(!matchesTpRequest)
            return
        const user = matchesTpRequest[1]
        if(user == 'xdarked' || user == '_Nether_Chicken')
            bot.chat('/tpy ' + user)
        else
            bot.chat('/tpn ' + user)
        // if(bot.entity.position.distanceTo(new Vec3(0,0,0)) > 5000 || user == 'Kepterv')
        //     bot.chat('/tpn ' + user)
        // else
        //     bot.chat('/tpy ' + user)
    })
    bot.on('end', async (reason) => { 
        log(`Disconnected for reason: ${reason}`)
        if(reason == 'disconnect.quitting')
            return
        log('Auto-Reconnecting')
        if(bot)
            bot.quit()
        await sleeps(20)
        createBot()
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
            if(bot)
                bot.quit()
            bot = null
            return
        }
        for(const message of defaultKickMessages) {
            if(reason.includes(message)) {
                recentlyDisconnected = true
                log('waiting 5s')
                await sleeps(5)
                if(bot)
                    bot.quit()
                bot = null
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
        ]
        for(const message of defaultReconnectMessages) {
            if(err.toString().includes(message)) {
                log('Reconnecting after error')
                await sleeps(30)
                bot.quit()
                bot = null
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
    bot.on('whisper', (username, message, translate, jsonMsg, matches) => {
        log(`${username} whispered: ${message}`)
        if(username != '_Nether_Chicken')
            return
        bot.chat('/tpa _Nether_Chicken')
    })      
}


let lastOnline = moment()
createBot()
const server = new mcping.MinecraftServer('hamhung.0b0t.org', 25565)
setInterval(() => {
    server.ping(3000, 47, (err, res) => {
        if(err) {
            log(err)
            return
        }
        let isOnline = res.players.sample.find(p => p.name == '_Robot_Duck')
        if(isOnline)
            lastOnline = moment()
        if(moment.duration(lastOnline.fromNow()).asMinutes() > 3)
            createBot()
    })
}, 5000)

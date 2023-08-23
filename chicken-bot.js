/* START OF IMPORTS */
require('./env.js') // load environment variables
const Mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const { generateTablist } = require('mineflayer-playerlist')

const repl = require('repl')
const fs = require('fs').promises
const axios = require('axios')
const FormData = require('form-data')
const { Vec3 } = require('vec3')
const langDetector = new (require('languagedetect'))
const moment = require('moment')
const levenshtein = require('fast-levenshtein')
const path = require('path')
 
const { Client, GatewayIntentBits, EmbedBuilder, WebhookClient, Attachment } = require('discord.js')
const { MessageContent, GuildMessages, Guilds, GuildMembers } = GatewayIntentBits
/* END OF IMPORTS */

/* START OF ERROR HANDLING OR LACK THEREOF */
process.on('uncaughtException', (error) => {
  console.error(`An uncaught exception occurred at ${timestamp()}:`, error)
})
/* END OF ERROR HANDLING OR LACK THEREOF */

/* START OF CONSTANTS */
const OUR_WEBSITE = 'https://robot-chicken.neocities.org'
const DISPLAY_CHAT = true
const BED_POS = new Vec3(...process.env.BED.match(/(\S+),(\S+),(\S+)/).slice(1).map(Number))
const START_TIME = moment()
const DATABASE = 'database.json'
const BLACKLIST_FILE = 'blacklist.json'
const ONE_MINUTE = 1 * 60 * 20
const FIVE_MINUTES = 5 * 60 * 20
const TEN_MINUTES = 10 * 60 * 20
const FIFTEEN_MINUTES = 15 * 60 * 20
const THIRTY_MINUTES = 30 * 60 * 20
const RANDOM_CHANNEL_ID = '1113295878606831741'
const BRIDGE_CHANNEL_ID = '1113295943140380703'
const SOURCE_CHANNEL_ID = '1131397353107116193'
const PLAYER_CHANNEL_ID = '1135339325446426714'
const SOURCE_MESSAGE_ID = '1131398231868313670'
const LOGS_CHANNEL_ID = '1143955427864887426'
const SPAM_SIMILARITY_CHECK = 0.88
const PROMOTION_MESSAGES = [
    ',Try &dupe today! Make sure to have an enderchest nearby. You can see my other commands with &help',
    ",I'm opensource! Check out my current version with &source",
    ",Tired of duping manually? Just type &dupe, and you're set!",
    ',Get expert advice today with &askgpt command!',
    ',Drop by the discord bridge! https://discord.gg/fegUKHTwQd',
    ",Try &kit today! You can see the list here: `" + OUR_WEBSITE,
    ",Need to send someone items? Just &mail them!",
    ",I can anonymize messages, just /whisper it to me!",
]
const COMMAND_PREFIXES = ['!', '&', '$', '?', '*', '%', '>', ':']
const WEBHOOK = new WebhookClient({ url: `http://discord.com/api/webhooks/1131047779817500793/${process.env.WEBHOOK_ID}` }) // thanks Cody4687

const VIP = [ // cooldown removed, more kits!
    'antonymph', 
    'antonymphs', 
    'AstolfoIsKing', 
    'prljav', 
    '_Nether_Chicken', 
    'PayTheParrot', 
    'lilkitkat1'
    ]
const VVIP = [ // reset priviledges!!
    'antonymph', 
    'antonymphs', 
    '_Nether_Chicken'
    ]
const VVVIP = [ // tp and whisper command priviledge!!!
    '_Nether_Chicken'
] 

const EXCLUSIVE_KITS = ['lava', 'obsidian', 'tnt', 'grief', 'illegal']
const KITS_2 = {
    'kit'             : BED_POS.offset( 4, 0, -17), // https://i.imgur.com/X7IwX5i.png
    'sand'            : BED_POS.offset( 4, 0, -16), // https://i.imgur.com/z0HkbVD.png
    'lava'            : BED_POS.offset( 4, 0, -15), // https://i.imgur.com/l0X8gJl.png
    'signs'           : BED_POS.offset( 4, 0, -14), // https://i.imgur.com/51ZzDuA.png
    'end'             : BED_POS.offset( 4, 0, -13), // https://i.imgur.com/SEB6z5T.png
}
const KITS_1 = {
    'tree'            : BED_POS.offset(-4, 0,  19), // https://i.imgur.com/nRUlj2e.png
    'xp'              : BED_POS.offset(-4, 0,  18), // https://i.imgur.com/R2xLcaf.png
    'quartz'          : BED_POS.offset(-4, 0,  17), // https://i.imgur.com/aOmIzRZ.png
    'illegal'         : BED_POS.offset(-4, 0,  16), // https://i.imgur.com/W3enroH.png
    'nether'          : BED_POS.offset(-4, 0,  15), // https://i.imgur.com/T1BKTHo.png
    'boxbox'          : BED_POS.offset(-4, 0,  14), // https://i.imgur.com/5o8f8Mp.png
    'stone'           : BED_POS.offset(-4, 0,  13), // https://i.imgur.com/LCd7lCf.png
    'obsidian'        : BED_POS.offset(-4, 0,  12), // https://i.imgur.com/HF64MdY.png
    'toolbox'         : BED_POS.offset(-4, 0,  11), // https://i.imgur.com/WgcQShb.png
    'farming'         : BED_POS.offset(-4, 0,  10), // https://i.imgur.com/jLJEUrP.png
    'grass'           : BED_POS.offset(-4, 0,   9), // https://i.imgur.com/g9fuVTo.png
    'sponge'          : BED_POS.offset(-4, 0,   8), // https://i.imgur.com/SA34fQk.png
    'wood'            : BED_POS.offset(-4, 0,   7), // https://i.imgur.com/FHTfrBS.png
    'g-terracotta'    : BED_POS.offset(-4, 0,   6), // https://i.imgur.com/x16gpe6.png
    'beacon'          : BED_POS.offset(-4, 0,   5), // https://i.imgur.com/hZphcFy.png
    'autograph'       : BED_POS.offset(-4, 0,   4), // https://i.imgur.com/5qfOHEl.png
    'trans'           : BED_POS.offset(-4, 0,   3), // https://i.imgur.com/qURiMsi.png
    'flower'          : BED_POS.offset(-4, 0,   2), // https://i.imgur.com/BaAj1gI.png
    'misc'            : BED_POS.offset(-4, 0,   1), // https://i.imgur.com/HU9YJHj.png
    'tinyhouse'       : BED_POS.offset(-4, 0,   0), // https://i.imgur.com/3T6K1NF.png
    'redstone'        : BED_POS.offset(-4, 0,  -1), // https://i.imgur.com/5vNi2wJ.png
    'dyes'            : BED_POS.offset(-4, 0,  -2), // https://i.imgur.com/nQfRnY8.png
    'respawn'         : BED_POS.offset(-4, 0,  -3), // https://i.imgur.com/qfBne02.png
    'totems'          : BED_POS.offset(-4, 0,  -4), // https://i.imgur.com/q1Xk1ew.png

    'elytra'          : BED_POS.offset(-4, 0,  -5), // https://i.imgur.com/VMBNlqh.png
    'travel'          : BED_POS.offset(-4, 0,  -5), // https://i.imgur.com/VMBNlqh.png
    'fireworks'       : BED_POS.offset(-4, 0,  -5), // https://i.imgur.com/VMBNlqh.png

    'dupe'            : BED_POS.offset(-4, 0,  -6), // https://i.imgur.com/dhe5sjH.png
    'maps'            : BED_POS.offset(-4, 0,  -7), // https://i.imgur.com/xQRql7N.png
    'light'           : BED_POS.offset(-4, 0,  -8), // https://i.imgur.com/Y4eq8HH.png
    'storage'         : BED_POS.offset(-4, 0,  -9), // https://i.imgur.com/yj5xpOQ.png
    'brewing'         : BED_POS.offset(-4, 0, -10), // https://i.imgur.com/eoQgSkN.png
    'wool'            : BED_POS.offset(-4, 0, -11), // https://i.imgur.com/SC9qxaO.png
    'terracotta'      : BED_POS.offset(-4, 0, -12), // https://i.imgur.com/yiDnuPg.png
    'concrete'        : BED_POS.offset(-4, 0, -13), // https://i.imgur.com/0JmFmT1.png
    'glass'           : BED_POS.offset(-4, 0, -14), // https://i.imgur.com/3JQJe9N.png
    'box'             : BED_POS.offset(-4, 0, -15), // https://i.imgur.com/qJSI84f.png

    'gaps'            : BED_POS.offset(-4, 0, -16), // https://i.imgur.com/FclqKHf.png
    'gapples'         : BED_POS.offset(-4, 0, -16), // https://i.imgur.com/FclqKHf.png

    'banner-maker'    : BED_POS.offset(-4, 0, -17), // https://i.imgur.com/lLWDaQf.png
}
const HEX_CONVERSION_CODES = {
    "§0": "#000000",
    "§1": "#0000AA",
    "§2": "#00AA00",
    "§3": "#00AAAA",
    "§4": "#AA0000",
    "§5": "#AA00AA",
    "§6": "#FFAA00",
    "§7": "#AAAAAA",
    "§8": "#555555",
    "§9": "#5555FF",
    "§a": "#55FF55",
    "§b": "#55FFFF",
    "§c": "#FF5555",
    "§d": "#FF55FF",
    "§e": "#FFFF55",
    "§f": "#FFFFFF",
}
const DISCORD_ROLES = {
    "§0": '1127715959365435402',
    "§1": '1127716592466280609',
    "§2": '1127705116942798909',
    "§3": '1127716846494306357',
    "§4": '1127720350071914557',
    "§5": '1127705372279439512',
    "§6": '1127705636365414439',
    "§7": '1127704942954676254',
    "§8": '1127706101211734126',
    "§9": '1127705253932974120',
    "§a": '1127705116942798909',
    "§b": '1127705859275898940',
    "§c": '1127705686072115411',
    "§d": '1127706161437749310',
    "§e": '1127705778476810240',
    "§f": '1127705022734545038',
}

class CommandHandler {
    constructor() {
        this.commands = []
    }

    register(commandClass) {
        this.commands.push(commandClass)
    }

    getAll() {
        return this.commands
    }

    get(commandId) {
        for(const commandClass of this.commands)
            if(commandClass.prototype.id == commandId)
                return commandClass
    }

    matchCommand(commandMessage) {
        let commandIds = this.commands.map(command => command.prototype.id) 
        let commandRegex = `^(?:> )?(${commandIds.join('|')})( .*)?$`
        return commandMessage.match(commandRegex)
    }

    handle(username, commandMessage) {
        if(username == '_Robot_Chicken')
            return
        let match = this.matchCommand(commandMessage)
        if(!match)
            return
        let commandId = match[1]
        let args = match[2]?.trim()
        let commandClass = this.get(commandId)
        new commandClass(username, args).execute()
    }
}
const commandHandler = new CommandHandler()
/* END OF CONSTANTS */

/* START OF GLOBAL VARS */
let bridgeChannel = null
let sourceChannel = null
let randomChannel = null
let playerChannel = null
let logsChannel = null
let bot = null
let ticks = 0
let firstInit = true
let lastTipIx = null
let emojis = null
let lastMessage = null
let lastAnonimizedMessageTicks = null
let lastMessageTicks = null
let maintenance = false
let intentionalDeath = false
let database = null
let isWalking = false
let ll = null
let chatCache = []
let speakQueue = []
let speaking = false
let lock = null
let critical = false
let recentlyDisconnected = false
let blacklist = []
let tpingTo = null
/* END OF GLOBAL VARS */

/* START OF DISCORD FUNCTIONS */
async function updateIgnColorIfNeeded(rawUsername) {
    let possibleColorCode = rawUsername.substring(0,2)
    let actualColor = HEX_CONVERSION_CODES[possibleColorCode] ?? null
    let username = rawUsername.replaceAll(/§./g, '')
    if(actualColor == null)
        return
    if(!HEX_CONVERSION_CODES.hasOwnProperty(possibleColorCode)) {
        log(`Unknown color code: ${possibleColorCode}`)
        return
    }
    let targetRoleId = DISCORD_ROLES[possibleColorCode]

    let discordTag = null
    for (const [discordUsername, ign] of Object.entries(database.verification)) {
        if (ign === username) {
            discordTag = discordUsername
            break
        }
    }
    if(!discordTag) {
        log(`Discord user not found for ign ${username}`)
        return
    }
    if(!bridgeChannel)
        return
    let guildMember = bridgeChannel.guild.members.cache.find(member => member.user.tag == discordTag)


    await bridgeChannel.guild.roles.fetch()
    if(!guildMember) {
        log('GuildMember not found')
        return
    }
    if(!guildMember.roles) {
        log('GuildMember.roles not found')
        return
    }
    let currentRole = guildMember.roles.cache.filter(role => role.name != '@everyone').at(0)
    let targetRole = bridgeChannel.guild.roles.cache.get(targetRoleId)

    if(!targetRole) {
        log('Target role not found')
        return
    }
    if(currentRole) {
        if(currentRole.id == targetRoleId)
            return
        try {
            guildMember.roles.remove(currentRole)
        } catch(error) {
            console.error(`error changing ${username}'s role:`, error)
        }
    }
    guildMember.roles.add(targetRole)
}

function initDiscord() {
    const client = new Client({ intents: [Guilds, GuildMessages, MessageContent, GuildMembers] })
    client.login(process.env.DISCORD_BOT_KEY)
    client.once('ready', c => {
        log(`Discord bot logged in as ${c.user.tag}`)
        bridgeChannel = client.channels.cache.get(BRIDGE_CHANNEL_ID)
        sourceChannel = client.channels.cache.get(SOURCE_CHANNEL_ID)
        randomChannel = client.channels.cache.get(RANDOM_CHANNEL_ID)
        playerChannel = client.channels.cache.get(PLAYER_CHANNEL_ID)
        logsChannel = client.channels.cache.get(LOGS_CHANNEL_ID)
        bridgeChannel.guild.members.fetch()
        if (!bridgeChannel) {
            log(`I could not find the bridge channel!`)
            process.exit(1)
        }
        if (!sourceChannel) {
            log(`I could not find the source channel!`)
            process.exit(1)
        }
        if (!randomChannel) {
            log(`I could not find the random channel!`)
            process.exit(1)
        }
    })
    client.on('error', error => {
        console.error('A websocket connection encountered an error:', error)
    })
    client.on('messageCreate', async message => {
        if (message.webhookId) return
        let author = `${message.author.username}#${message.author.discriminator}`
        if(author == '_Robot_Chicken#3088')
            return
        let content = message.content
        if(content == '&source') {
            let sourceUrl = await new SourceCommand(null, true).execute()
            message.channel.send(`${author}, I just updated my source code at ${sourceUrl}`)
        }
        if(content.startsWith('&ban') && author == '_nether_chicken#0') {
            ban(content.substring(4).trim())
            return
        }
        if(content.startsWith('&unban') && author == '_nether_chicken#0') {
            unban(content.substring(6).trim())
            return
        }
        if(content == '&verify') {
            VerifyCommand.generateCode()
            VerifyCommand.verificationUsername = author
            message.author.send(`Send ${VerifyCommand.verification} in-game within 30s to verify your username`)
            VerifyCommand.clearAfterSeconds(30)
        }
        if(content == VerifyCommand.verification) {
            database.verification[author] = VerifyCommand.verificationUsername
            while(!bot)
                await sleeps(1)
            bot.chat(`/w ${VerifyCommand.verificationUsername} you are now verified`)
            saveDatabase()
            return
        }
        if(database.verification.hasOwnProperty(author))
            author = database.verification[author]
        if(author == 'XDARKED')
            author = 'xdarked'
        if (message.channel.id !== bridgeChannel.id) return
        let removedNewlines = content.replaceAll(/\n|\r/g, '').trim()
        let authorTag = `[${author}]`
        let messageBlocks = splitStringIntoBlocks(removedNewlines, 96 - authorTag.length)
        for(const msg of messageBlocks) {
            let line = `${authorTag}: \`${msg}`
            await getEmojis()            
            Object.entries(emojis).forEach(([emoji, convertedEmoji]) => {
                line = line.replaceAll(emoji, `:${convertedEmoji}:`)
            })
            log('Discord: ' + line)
            speak(line)
        }
        if(author == '_Nether_Chicken' && content.startsWith('&'))
            commandHandler.handle('_Nether_Chicken', content)
    })
}

async function updatePlayerTabImg() {
    if(!bot || !bot.players || !playerChannel)
        return
    let playerList = Object.keys(bot.players)
        .map(player => ({ name: player, ping: bot.players[player].ping }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    try {
        const tablistBase64 = await generateTablist(playerList)
        const buffer = Buffer.from(tablistBase64.replace("data:image/png;base64,",""), 'base64')
        const attachment = new Attachment(buffer, { name: 'playerlist.png', contentType: 'image/png' })
        let existingMessages = await playerChannel.messages.fetch()
        await playerChannel.send({
            files: [
                {
                    contentType: 'image/png', 
                    name: 'playerlist.png', 
                    attachment: buffer
                }
            ],
            flags: [4096]
        }).then(async ()=>{
            for(let i=0; i < existingMessages.size; i++) {
                existingMessages.at(i).delete()
                .then(()=>{})
                .catch(()=>{})
            }
        })
    } catch (err) {
        log('Error while updating playertab img')
        console.error(err)
    }
}

function forwardDiscordBridge(username, message, server) {
    if(isSpam(message)) {
        return
    }
    let oddUsername = username.match('.*[❘| ].*')
    message = message.split('@everyone').join(`*@*everyone`)
    message = message.split('@here').join(`*@*here`)
    message = message.replaceAll('~', '\\~')
    message = message.replaceAll('_', '\\_')
    message = message.replaceAll('*', '\\*')
    username = username.replaceAll('_', '\_')
    message = message.replaceAll(/((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g, '<$1>') // 3 votes **ahead**
    message = message.trim()
    if(!message)
        return
    if(server) {
        WEBHOOK.send({
            content: message,
            username: '[Server]',
            avatarURL: `http://styles.redditmedia.com/t5_3f7j6/styles/communityIcon_1ym4m7ga94231.png`,
            flags: [4096] // thanks diamondFTW!
        })
    } else {
        WEBHOOK.send({
            content: message,
            username: username,
            avatarURL: `http://mc-heads.net/head/${oddUsername ? '0385': username}`,
            flags: [4096] // thanks diamondFTW!
        })
    }
}
/* END OF DISCORD FUNCTIONS */

/* START DATABASE-RELATED FUNCTIONS */
async function clearUpdateLockFile() {
    try {
        const filePath = path.join(__dirname, "updateInProgress")
        await fs.unlink(filePath)
    } catch (err) {
        console.error(`Error deleting file: ${err}`)
        process.exit(1)
    }
}

function isUpdating() {
    const filePath = path.join(__dirname, "updateInProgress")
    try {
        fs.accessSync(filePath)
        return true
    } catch (error) {
        return false
    }
}

function initBlacklist() {
    fs.access(BLACKLIST_FILE, fs.constants.F_OK)
    .then(() => {
        return fs.readFile(BLACKLIST_FILE, 'utf8')
    })
    .then((data) => {
        log('Read blacklist: ')
        blacklist = JSON.parse(data)
        log('\n' + JSON.stringify(blacklist, null, 2))
    })
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
}

function initDatabase() {
    fs.access(DATABASE, fs.constants.F_OK)
    .then(() => {
        return fs.readFile(DATABASE, 'utf8')
    })
    .then((data) => {
        log('Read database: ')
        database = JSON.parse(data)
        log('\n' + JSON.stringify(database, null, 2))
    })
    .catch((err) => {
        if (err.code === 'ENOENT') {
            database = { dupeCount: {} }
            const json = JSON.stringify(database)
            return fs.writeFile(DATABASE, json)
        } else {
            console.error(err)
            process.exit(1)
        }
    })
    .then(() => {
        log('Database file created.')
    })
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
}

async function ban(username) {
    if(blacklist.includes(username))
        return
    blacklist.push(username)
    saveBlacklist()
}
async function unban(username) {
    blacklist = blacklist.filter((user) => user !== username)
    saveBlacklist()
}

async function incrementFagCounter(username, message) {
    log('Incrementing fag counter')
    let hard = (message.match(/\bfaggot(s)?\b/g) || []).length
    let soft = (message.match(/\bfag(s)?\b/g) || []).length
    if(!database.hasOwnProperty('fagCounter'))
        database.fagCounter = {}
    if(!database.fagCounter[username])
        database.fagCounter[username] = [0,0]
    database.fagCounter[username][0] += hard
    database.fagCounter[username][1] += soft
    saveDatabase()
}

function incrementDupeCount(username) {
    if(!database.dupeCount.hasOwnProperty(username))
        database.dupeCount[username] = lock.itemCount
    else
        database.dupeCount[username] += lock.itemCount
    saveDatabase()
}

function incrementKitCount(username) {
    if(!database.hasOwnProperty('kitCount'))
        database.kitCount = {}
    if(!database.kitCount.hasOwnProperty(username))
        database.kitCount[username] = 1
    else
        database.kitCount[username] += 1
    saveDatabase()
}

function saveBlacklist() {
  return fs.writeFile(BLACKLIST_FILE, JSON.stringify(blacklist))
    .then(() => {
      log('Blacklist saved successfully.')
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}

function saveDatabase() {
  return fs.writeFile(DATABASE, JSON.stringify(database))
    .then(() => {
      log('Database saved successfully.')
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
/* END DATABASE-RELATED FUNCTIONS */


/* START OF AUXILIARY TEXT FUNCTIONS */
function timestamp() {
    return moment().subtract(3, 'hours').format('YYYY-MM-DD HH:mm:ss')  
}

function log(message, chat) {
    if(!DISPLAY_CHAT && chat)
        return
    console.log(`[${timestamp()}][${chat ? 'CHAT' : 'SELF'}]: ${message}`)
    if(logsChannel && !chat)
        logsChannel.send(message)
}

async function getEmojis() {
    if(!emojis) {
        try {
            const response = await axios.get('http://pastebin.com/raw/LhQek0L1') // thanks diamondFTW !!
            emojis = response.data
        } catch (error) {
            console.error('Error loading remote JSON:', error.message)
            return null
        }
    }
    return emojis
}

function isSpam(newMessage) {
    let obfuscatedUrlHuntingCompatible = newMessage.replaceAll(/[^A-Za-z0-9]/g, '').toLowerCase()
    if(['anarchymc0rg', 'mcalphaanarchyonline'].some(ouhc => obfuscatedUrlHuntingCompatible.includes(ouhc)))
        return true
    if(newMessage.match('<@&?[0-9]+>'))
        return true
    if(commandHandler.matchCommand(newMessage))
        return false
    let newMessageLength = newMessage.length
    let matchCount = 0
    for(const chatMsg of chatCache) {
        let [_, msg] = chatMsg
        let msgDistance = levenshtein.get(msg, newMessage)
        let oldMsgLength = msg.length
        if(msgDistance/oldMsgLength < 1 - SPAM_SIMILARITY_CHECK)
            matchCount += 1
    }
    return matchCount > 1
}

async function checkAfk(username, message) {
    if(username == '_Robot_Chicken')
        return
    if(AfkCommand.afkPlayers.hasOwnProperty(username)) {
        delete AfkCommand.afkPlayers[username]
    }
    Object.keys(AfkCommand.afkPlayers).forEach((afkPlayer) => {
        if(message.toLowerCase().includes(afkPlayer.toLowerCase())) {
            let [afkStart, afkReason] = AfkCommand.afkPlayers[afkPlayer]
            let afkTime = moment.duration(moment().diff(afkStart))
            let afkWarnMessage = `${username}, ${afkPlayer} has been AFK for ${afkTime.humanize()}`
            if(afkReason)
                afkWarnMessage += ` for ${afkReason}`
            speak(afkWarnMessage)
        }
    })
}

function splitStringIntoBlocks(str, blockSize) {
    const blocks = []
    let currentIndex = 0
    while (currentIndex < str.length) {
        let currentBlockSize = blockSize
        while (currentIndex + currentBlockSize < str.length && !/\s/.test(str[currentIndex + currentBlockSize]))
            currentBlockSize++
        blocks.push(str.substring(currentIndex, currentIndex + currentBlockSize))
        currentIndex += currentBlockSize
        while (currentIndex < str.length && /\s/.test(str[currentIndex]))
            currentIndex++
    }
    return blocks
}

function shamelessSelfPromotion() {
    let tipIx = null
    while(!tipIx || tipIx == lastTipIx)
        tipIx = Math.floor(Math.random() * PROMOTION_MESSAGES.length)
    speak(PROMOTION_MESSAGES[tipIx])
    lastTipIx = tipIx
}

async function speakRoutine() {
    if(speaking)
        return
    if(speakQueue.length == 0)
        return
    let initTicks = ticks
    speaking = true
    let message = speakQueue.shift()
    while(ticks - lastMessageTicks < 80)
        await sleep(20)
    while(isWalking)
        await sleep(20)
    try {
        bot.chat(message)
        lastMessage = message
        lastMessageTicks = ticks
    } catch (error) {
        log('Chat error pls fix me:')
        log(error)
    }
    speaking = false
}

async function copypasta(username) {
    let bedtimeStory = `Who the fuck are you saying "hi" to? This is 0b0t motherfucker there's only psychopaths, murderers and white-collar criminals in here. If you have the audacity to say "hello" or "good morning" you can fuck off right back to Hypixel, you hear me? This place is not for your pleasantries or cordiality; it's a realm for the twisted, the deranged, and the devious. So watch your step and adjust your attitude accordingly. You think you can waltz into this dark corner of the internet and expect warm greetings? Well, you've got another thing coming. We thrive on chaos, anonymity, and lawlessness here. This is the realm where maddened minds rejoice, where illicit dealings unfold in the shadows. We don't care about your social norms or your delicate sensibilities. So take your "hellos" and "good mornings" and shove them up your ass. If you can't handle the grit and the grime, the blood and the betrayal, then get the fuck out. This is not a place for the faint-hearted or the easily swayed.`
    for(const msg of splitStringIntoBlocks(bedtimeStory, 99))
        speak(msg)
}
/* END OF AUXILIARY TEXT FUNCTIONS */

/* START OF COMMAND DECLARATIONS */
class Command {
    constructor(username) {
        this.username = username
    }
    execute() {}
}

function registeredCommand(id, args, description) {
    return function (commandClass) {
        commandClass.prototype.id = id
        commandClass.prototype.args = args
        commandClass.prototype.description = description
        commandHandler.register(commandClass)
        return commandClass
    }
}

@registeredCommand("&help", "[command]", "shows a command's description")
class HelpCommand extends Command {

    constructor(username, commandId) {
        super(username)
        this.commandId = commandId
    }

    execute() {
        if(this.commandId) {
            if(!this.commandId.startsWith('&'))
                this.commandId = '&' + this.commandId
            let commandClass = commandHandler.get(this.commandId)
            if(commandClass) {
                let helpString = commandClass.prototype.id       + ' ' + 
                                 commandClass.prototype.args    + ' - ' + 
                                 commandClass.prototype.description
                speak(helpString)
            } else {
                speak(`< There's no such command YET`)
            }
        } else {
            speak(`You can see all the commands here: \`${OUR_WEBSITE}/#commands`)
        }
    }
}

@registeredCommand("&bible", "<query>", "shows a bible verse containing the queried string")
class BibleCommand extends Command {
    constructor(username, query) {
        super(username)
        this.query = query
    }

    async execute() {
        if(!this.query) {
            speak(`&bible requires a query`)
            return
        }
        const url = 'http://bible-go-api.rkeplin.com/v1/search'
        axios.get(url, {
            params: {
                query: this.query
            }
        }).then((response) => {
            const items = response.data.items
            if(!items) {
                speak(`${this.query} is not contained in this bible`)
                return
            }
            let verseIx = Math.floor(Math.random() * items.length)
            let blocks = splitStringIntoBlocks(items[verseIx].verse.replaceAll(/<.+?>/g, ''), 99)
            for(const block of blocks)
                speak(block)
        })
        .catch((error) => {
            speak('The Bible is unavailable at this moment. Surely the work of the Devil.')
            log(`Error: ${error.message}`)
        })
    }
}

@registeredCommand("&endportal", "", "shows the closest endportal to spawn")
class EndPortalCommand extends Command {

    execute() {
        speak("X: 1888 Z: -30 is the closest end portal to spawn! Going to the end allows you to tpa to anyone, and is quicker then escaping.")
    }
}

@registeredCommand("&godsword", "", "Terry Davis' gw program")
class GwCommand extends Command {
    
    async execute() {
        const url = 'http://raw.githubusercontent.com/orhun/godsays/master/Happy.TXT'
        axios.get(url)
        .then(response => {
            const data = response.data
            const lines = data.split('\n')
            const randomLines = lines
            .sort(() => 0.5 - Math.random())
            .slice(0, 16)
            .join(' ')
            let blocks = splitStringIntoBlocks(randomLines, 99)
            for(const block of blocks)
                speak(block)
        })
        .catch(error => {
            console.error(`Error: ${error.message}`)
        })
    }
}

@registeredCommand("&afk", "[reason]", "sets you as AFK and warns anyone who tries to contact you in chat")
class AfkCommand extends Command {
    static afkPlayers = {}

    constructor(username, reason) {
        super(username)
        this.reason = reason
    }

    execute() {
        log(`Setting ${this.username} as AFK`)
        let afkMessage = `${this.username} is now set as AFK`
        if(this.reason)
            afkMessage += `: ${this.reason}`
        speak(afkMessage)
        AfkCommand.afkPlayers[this.username] = [moment(), this.reason]
    }
}

@registeredCommand("&howdupe", "", "shows Aspect's video on how to dupe")
class HowDupeCommand extends Command {
    execute() {
        speak(`Here's how to dupe: https://www.youtube.com/watch?v=TdoypGpkcz0`)
    }
}

@registeredCommand("&topfslur", "<hard|soft>", "shows the fslur leaderboard")
class TopFslurCommand extends Command {
    constructor(username, args) {
        super(username)
        this.args = args
    }

    execute() {
        let [, degree] = this.args?.match(/^(hard|soft)?$/) || []
        if(!degree) {
            speak(`Invalid args, use &topfslur <hard|soft>`)
            return
        }
        const entries = Object.entries(database.fagCounter)
        let sortedEntries = null
        if(degree == 'hard') {
            sortedEntries = entries.sort((a, b) => b[1][0] - a[1][0])
        } else if(degree == 'soft'){
            sortedEntries = entries.sort((a, b) => b[1][1] - a[1][1])
        }
        const top3FCallers = sortedEntries.slice(0, 3)
        let ix = 1
        let scoreboard = []
        top3FCallers.forEach(([user, count]) => {
          scoreboard.push(`#${ix++}: ${user} - ${count[degree == 'hard' ? 0 : 1]}`) 
        })
        speak(scoreboard.join(' | '))
    }
}

@registeredCommand("&fslur", "[username]", "shows fslur count of the player")
class FslurCommand extends Command {
    constructor(username, args) {
        super(username)
        this.args = args
    }

    execute() {
        let user = this.args?.trim()
        if(!user)
            user = this.username
        if(!database.hasOwnProperty('fagCounter'))
            database.fagCounter = {}
        if(database.fagCounter?.hasOwnProperty(user)) {
            let hardCount = database.fagCounter[user][0]
            let softCount = database.fagCounter[user][1]
            if(hardCount == 0 && softCount == 0)
                speak(`> ${user} has not said the f slur YET.`)
            else
                speak(`> ${user}: Hard T: ${hardCount}, Normal: ${softCount}`)
        } else {
            speak(`> ${user} has not said the f slur YET.`)
        }
    }
}

@registeredCommand("&uptime", "", "shows the bot's current uptime")
class UptimeCommand extends Command {
    execute() {
        const duration = moment.duration(moment().diff(START_TIME))
        speak(`I have been up for ${duration.humanize()}`)
    }
}

@registeredCommand("&kits", "", "shows the kit menu")
class KitsCommand extends Command {
    execute() {
        speak(`You can check the list of kits and their IDs here: \`${OUR_WEBSITE}`)
    }
}

@registeredCommand("&kitCount", "[username]", "shows the amount of kits the user got out of me")
class KitCount extends Command {
    constructor(username, kitCountPlayer) {
        super(username)
        this.kitCountPlayer = kitCountPlayer
    }

    execute() {
        if(this.kitCountPlayer) {
            if(database.kitCount.hasOwnProperty(this.kitCountPlayer)) {
                let kitsCount = database.kitCount[this.kitCountPlayer]
                speak(`I have given ${kitCount} kits to ${this.kitCountPlayer}`)
            } else {
                speak(`I have never given ${this.kitCountPlayer} a kit`)
            }
        } else {
            let totalKits = Object.values(database.kitCount).reduce((acc, curr) => acc + curr, 0)
            speak(`I have given out a total of ${totalKits} kits`)
        }
    }
}

@registeredCommand("&translate", "[username]", "translates the last foreign message, or the last message of the specified user")
class TranslateCommand extends Command {

    static userToTranslate = null

    constructor(username, userToTranslate) {
        super(username)
        this.userToTranslate = userToTranslate
    }

    execute() {
        if(this.userToTranslate && !bot.players.hasOwnProperty(this.userToTranslate)) {
            speak(`Player ${this.userToTranslate} is not online`)
            return
        }
        for(const chatMsg of chatCache) {
            let [username, possibleForeignMessage] = chatMsg
            if(this.userToTranslate && this.userToTranslate != username)
                continue
            log('Detecting language of: ' + possibleForeignMessage)
            let langScore = langDetector.detect(possibleForeignMessage)
            let lang = langScore.length != 0 ? langScore[0][0] : null
            if(COMMAND_PREFIXES.some(prefix => possibleForeignMessage.startsWith(prefix)))
                continue
            if(langScore.length == 0 || langScore[0].length == 0) {
                speak("Weird language. This shouldn't happen. Tell _Nether_Chicken to check logs")
                log(langScore)
                return
            }
            log(langScore)
            let notRealLanguages = ['hawaiian', 'pidgin']
            if(lang && !notRealLanguages.includes(lang)) {
                log(`Translating message from ${username}: ${possibleForeignMessage}`)
                TranslateCommand.userToTranslate = this.userToTranslate
                let le_prompt = `Translate: "${possibleForeignMessage}"`
                commandHandler.handle(username, `&askgpt ${le_prompt}`)
                break
            }
        }
    }
}

@registeredCommand("&antonymph", "", "tells you who antonymph is")
class AntonymphCommand extends Command {
    execute() {
        speak(`fag in love with the trans colours who donated a buncha kits`)
    }
}

@registeredCommand("&xdarked", "", "tells you what happened on 2023-June-01")
class XdarkedCommand extends Command {
    execute() {
        const daysDiff = moment().diff(moment('2023-06-01'), 'days')
        speak('On 2023-June-01 xdarked found a vulnerability in this bot and managed to tp to it.')
        speak(`It has been ${daysDiff} days, and in each one he chose not to fuck everything up completely`)
        speak(`Be more like xdarked.`)
    }
}

@registeredCommand("&verify", "", "verifies your ign for the discord bridge and reflects your name color as a custom role")
class VerifyCommand extends Command {
    static verification = null
    static verificationUsername = null

    constructor(username) {
        super(username)
    }

    async execute() {
        if(!database.verification) {
            database.verification = {}
            saveDatabase()
        }
        VerifyCommand.generateCode()
        VerifyCommand.verificationUsername = this.username
        while(!bot)
            await sleeps(1)
        bot.chat(`/w ${this.username} send ${VerifyCommand.verification} within 30s in the discord bridge channel to verify your username`)
        VerifyCommand.clearAfterSeconds(30)
    }

    static generateCode() {
        VerifyCommand.verification = Math.floor(Math.random()*90000) + 10000
    }

    static async clearAfterSeconds(secs) {
        await sleeps(secs)
        VerifyCommand.verification = null
        VerifyCommand.verificationUsername = null
    }
}

@registeredCommand("&discord", "", "shows the discord server link")
class DiscordCommand extends Command {
    execute() {
        speak(PROMOTION_MESSAGES[4])
    }
}

@registeredCommand("&music", "", "shows the currently playing song")
class MusicCommand extends Command {
    async execute() {
        axios.get(`http://${process.env.HOME}:5887`)
            .then(async (response) => {
                if(response.data == '[paused]')
                    speak('Not playing music at the moment')
                else
                    speak('Currently playing: ' + response.data)
            })
            .catch(error => {
                log(error)
                speak('Music server is unreachable at the moment')
            })
    }
}

@registeredCommand("&dupes", "[user]", "shows the amount of times a player has duped, or total duped shulkers")
class DupesCommand extends Command {
    constructor(username, user) {
        super(username)
        this.user = user
    }

    execute() {
        if(this.user) {
            if(database.dupeCount.hasOwnProperty(this.user)) {
                let totalDupes = database.dupeCount[this.user]
                speak(`I have duped ${totalDupes} shulkers for ${this.user}`)
            } else {
                speak(`I have never duped for ${this.user}`)
            }
        } else {
            let totalDupes = Object.values(database.dupeCount).reduce((acc, curr) => acc + curr, 0)
            speak(`I have duped a total of ${totalDupes} shulkers`)
        }
    }
}

@registeredCommand("&askgpt", "<prompt>", "get expert advice")
class AskGPTCommand extends Command {
    static cooldown = {}
    static answeringGpt = false

    constructor(username, question) {
        super(username)
        this.question = question
    }

    async execute() {
        if(AskGPTCommand.answeringGpt) {
            speak('GPT: Wait a moment')
            return
        }
        if(!this.question || !this.question.trim()) {
            speak('GPT requires a non-empty prompt')
            return
        }
        if(AskGPTCommand.cooldown.hasOwnProperty(this.username)) {
            let duration = moment.duration(moment().diff(AskGPTCommand.cooldown[this.username])).asSeconds()
            if(duration < 30 && duration > 0) {
                log(`&askgpt is on cooldown for ${this.username}`)
                speak(`< &askgpt is on cooldown for ${this.username}. Try again later`)
                return
            }
        }
        speak('Hmmmm...')
        AskGPTCommand.answeringGpt = true
        axios.post(`http://${process.env.ORACLE}:5957/prompt`, {'prompt': Buffer.from(this.question).toString('base64')})
            .then(async (response) => {
                let text = Buffer.from(response.data, 'base64').toString('utf-8').replaceAll('\n', ' ')
                let replies = splitStringIntoBlocks(text.trim(), 90)
                if(text.trim().length == 0) {
                    speak(`GPT: I have nothing to say about that.`)
                    return
                }
                if(TranslateCommand.userToTranslate) {
                    speak(`I think ${TranslateCommand.userToTranslate} said this:`)
                    TranslateCommand.userToTranslate = null
                }
                for(const reply of replies)
                    speak('GPT: ' + reply)
                AskGPTCommand.cooldown[this.username] = moment()
                AskGPTCommand.answeringGpt = false
            })
            .catch(error => {
                log(error)
                speak('< ChickenGPT is not available at the moment.')
                AskGPTCommand.answeringGpt = false
            })
    }
}

@registeredCommand("&topdupes", "", "shows the top three players who duped the most")
class TopDupesCommand extends Command {
    execute() {
        const entries = Object.entries(database.dupeCount)
        const sortedEntries = entries.sort((a, b) => b[1] - a[1])
        const top3Dupers = sortedEntries.slice(0, 3)
        top3Dupers.map(([user, count], index) => `#${index + 1}: ${user}, with ${count} shulkers`)
         .forEach(speak)
    }
}

@registeredCommand("&reset", "", "moderator-exclusive command. Do not attempt. I'm watching you.")
class ResetCommand extends Command {
    constructor(username) {
        super(username)
    }

    execute() {
        if(VVIP.includes(this.username))
            if(lock)
                lock.reset(true)
    }
}

@registeredCommand("&source", "", "returns the link to my currently running source code")
class SourceCommand extends Command {
    static currentSource = null

    constructor(username, quiet) {
        super(username)
        this.quiet = quiet === true
    }

    async execute() {
        if(!SourceCommand.currentSource)
            await this.uploadSource()
                .then(response => {
                    let url = response.data
                    SourceCommand.currentSource = url
                    return sourceChannel.messages.fetch(SOURCE_MESSAGE_ID)
                })
                .then(sourceMessage => {
                    return sourceMessage.edit(`Current source: ${SourceCommand.currentSource}`)
                })
                .catch(error => {
                    let cantSendSourceMessage = '< Unable to upload source at this moment. Try again later'
                    if(!this.quiet)
                        speak(cantSendSourceMessage)
                    log(error)
                })
        if(!this.quiet)
            speak('> This is my current source code: ' + SourceCommand.currentSource)
        return SourceCommand.currentSource
    }

    async uploadSource() {
        return fs.readFile(__filename, 'utf8')
            .then(source => {
                const formData = new FormData()
                formData.append('f:1', source)
                return axios.post('http://ix.io', formData, {
                    headers: formData.getHeaders()
                })
            })
            
    }
}

@registeredCommand("&dupe", "", "dupes up to 18 shulkers at a time for you")
class DupeCommand extends Command {

    static cooldown = {}
    static dupingFor = null

    constructor(username) {
        super(username)
        this.itemCount = 0
    }

    reset(doKill) {
        DupeCommand.dupingFor = null
        if(doKill)
            kill()
        lock = null
    }

    async fixChestIfNeeded() {
        log('Checking chest status')
        let chestBlock = bot.blockAt(BED_POS.offset(3, 0, 0))
        critical = true
        let chest = await bot.openContainer(chestBlock)
        let emptySlots = getEmptySlots(chest)
        if(emptySlots.length > 0) {
            log('Chest is not full')
            return
        } else {
            log('Chest is borked')
        }
        // unbork stack 1
        for(let slot=0; slot < 16; slot++) {
            await bot.simpleClick.leftMouse(slot).catch(()=>{})
            await bot.waitForTicks(2)
            await bot.simpleClick.leftMouse(0).catch(()=>{})
            await bot.waitForTicks(2)
        }
        // unbork stack 2
        for(let slot=16; slot < 27; slot++) {
            await bot.simpleClick.leftMouse(slot).catch(()=>{})
            await bot.waitForTicks(2)
            await bot.simpleClick.leftMouse(1).catch(()=>{})
            await bot.waitForTicks(2)
        }
        chest.close()
        critical = false
        log('Done fixing chest')
    }

    checkLocked(username) {
        if(DupeCommand.dupingFor == username) {
            speak(`< Wait, I'm duping for you!`)
        } else if(DupeCommand.dupingFor) {
            speak(`< Wait, I'm duping for ${DupeCommand.dupingFor}`)
        }
    }

    async execute() {
        if(!VVVIP.includes(this.username) && maintenance){
            speak('&dupe is out of order. Try again later')
            return
        }
        if(DupeCommand.cooldown.hasOwnProperty(this.username)) {
            let duration = moment.duration(moment().diff(DupeCommand.cooldown[this.username])).asSeconds()
            if(duration < 40 && duration > 0) {
                log(`&dupe is on cooldown for ${this.username}`)
                speak(`< &dupe is on cooldown for ${this.username}. Try again in ${duration}s`)
                return
            }
        }
        if(lock) {
            lock.checkLocked(this.username)
            return
        }
        if(BED_POS.distanceTo(bot.entity.position) > 300) {
            speak(`I'm too far away from the stash. This shouldn't happen. Try again in a few seconds`)
            this.reset(true)
            return
        }
        if(Object.values(bot.entities).filter(entity=>entity.type=='player').length > 1) {
            speak(`I can't dupe right now, there's someone nearby`)
            return
        }
        if(isUpdating()) {
            speak(`I'm about to update, try again in a few seconds`)
            return
        }
        lock = this
        log('Started duping for ' + this.username)
        DupeCommand.dupingFor = this.username 
        tpaTo(this.username)
        await waitForPlayer(this.username)
        if(DupeCommand.dupingFor) {
            if(!database.dupeCount.hasOwnProperty(this.username) || database.dupeCount[this.username] < 5)
                speak(`${this.username}, drop me up to 18 shulkers, and I will double them. Make sure to place an enderchest nearby. Hit me when you're done handing the shulks.`)
        }
        if(!DupeCommand.dupingFor)
            return
        await forEnderchest(this.username)
        if(!DupeCommand.dupingFor)
            return
        await massDepositEnderchest(true)
        if(!DupeCommand.dupingFor)
            return
        kill()
        await sleeps(1)
        await massWithdrawEnderchest()
        await sleeps(1)
        await this.fixChestIfNeeded()
        await sleeps(1)
        await massDepositChest()
        log('Quitting 1')
        bot.quit()
        await sleeps(1)
        bot = null
        log('sleeping 21s')
        await sleeps(21)
        log('done sleeping 21s')
        createBot()
        await sleeps(2)
        if(!DupeCommand.dupingFor)
            return
        await massWithdrawChest()
        if(!DupeCommand.dupingFor)
            return
        await spreadBooks()
        if(!DupeCommand.dupingFor)
            return
        log('Quitting 2')
        bot.quit()
        bot = null
        log('sleeping 21s')
        await sleeps(21)
        log('done sleeping 21s')
        createBot()
        await sleeps(2)
        await massWithdrawChest()
        await sleeps(2)
        tpaTo(this.username)
        await waitForPlayer(this.username).then(() => {
            if(!DupeCommand.dupingFor) 
                return
            incrementDupeCount(this.username)
            log(`Done duping for ${this.username}`)
            if(!VIP.includes(this.username))
                DupeCommand.cooldown[this.username] = moment()
            this.reset(true)
        }).catch(error => log(error))
    }
}

@registeredCommand("&kit", "[kitId]", "gives you one of these kits: " + OUR_WEBSITE)
class KitCommand extends Command {
    static cooldown = {}
    static kitFor = null
    static kitId = null

    constructor(username, kitId) {
        super(username)
        this.kitId = kitId
    }

    reset(doKill) {
        KitCommand.kitId = null
        KitCommand.kitFor = null
        if(doKill)
            kill()
        lock = null
    }

    checkLocked(username) {
        if(KitCommand.kitFor == username) {
            speak(`< Accept the tpa silly I'm waiting for you ${username}!`)
        } else if(KitCommand.kitFor) {
            speak(`< Wait, I'm giving ${KitCommand.kitFor} a kit`)
        }
    }

    parseKit() {
        if(!this.kitId)
            this.kitId = 'respawn'
        this.kitId = this.kitId.toLowerCase()
        if(this.kitId == 'grief' || this.kitId == 'griefing') {
            lock = null
            this.kitId = null
            new AttackCommand(this.username, this.username+',').execute()
            return
        }
        if(this.kitId.includes(' '))
            this.kitId = this.kitId.split(' ')[0]
        const levenshteinDiffSortedMatches = (object) => Object.keys(object)
            .filter(key => levenshtein.get(this.kitId, key.toLowerCase()) < 3)
            .sort((a, b) => levenshtein.get(this.kitId, a.toLowerCase()) - levenshtein.get(this.kitId, b.toLowerCase()))
        let kitMatches1 = levenshteinDiffSortedMatches(KITS_1)
        let kitMatches2 = levenshteinDiffSortedMatches(KITS_2)
        let kitMatches = kitMatches1.length > 0 || kitMatches2.length > 0
        if(!kitMatches) {
            speak('< Unknown kit. Check the IDs under the images here: `' + OUR_WEBSITE)
            this.kitId = null
        } else {
            let side = kitMatches1.length > 0 ? 1 : 2
            this.kitId = side == 1 ? kitMatches1[0] : kitMatches2[0]
            if(EXCLUSIVE_KITS.hasOwnProperty(this.kitId) && !VIP.includes(this.username)) {
                speak('< Unknown kit. Check the IDs under the images here: `' + OUR_WEBSITE)
                this.kitId = null
                return null
            }
            return side
        }
    }

    getKitPosGround() {
        if(KITS_1.hasOwnProperty(this.kitId)) {
            return KITS_1[this.kitId]
        } else if(KITS_2.hasOwnProperty(this.kitId)) {
            return KITS_2[this.kitId]
        }
        log('Ooooopsieeee')
    }

    async execute() {
        if(!VVVIP.includes(this.username) && maintenance){
            speak('&kit is out of order. Try again later')
            return
        }
        if(isUpdating()) {
            speak(`I'm about to update, try again in a few seconds`)
            return
        }
        if(lock) {
            lock.checkLocked(this.username)
            return
        }
        let kitSide = this.parseKit()
        if(!this.kitId)
            return
        if(KitCommand.cooldown.hasOwnProperty(this.username)) {
            let duration = moment.duration(moment().diff(KitCommand.cooldown[this.username])).asMinutes()
            if(duration < 5 && duration > 0) {
                log(`&kit is on cooldown for ${this.username}`)
                speak(`< &kit is on cooldown for ${this.username}. Try again later`)
                return
            } else {
                delete KitCommand.cooldown[this.username]
            }
        }
        lock = this
        log('About to give a kit to ' + this.username)
        KitCommand.kitFor = this.username
        KitCommand.kitId = this.kitId
        let chest = null
        let kitPosGround = this.getKitPosGround()
        if(kitPosGround.distanceTo(bot.entity.position) > 300) {
            speak(`I'm too far away from the stash. This shouldn't happen. Try again in a few seconds`)
            this.reset(true)
            return
        }
        let kitPosChest = kitSide == 1 ? kitPosGround.offset(-1, 0, 0) : kitPosGround.offset(1, 1, 0)
        await walkTo(kitPosGround)
        while(!chest) {
            try {
                let chestBlock = bot.blockAt(kitPosChest)
                critical = true
                chest = await bot.openContainer(chestBlock)
            } catch(error) {
                log(error)
            }
        }
        let shulkerSlots = getShulkerSlotsFromChest(chest).filter(slot => slot < 27)
        if(shulkerSlots.length == 0) {
            speak(`I'm out of ${KitCommand.kitId} kits, yell about this on the discord`)
            chest.close()
            critical = false
            this.reset(true)
            return
        }
        let emptySlots = getEmptySlotsInventory()
        let from_ = shulkerSlots[0]
        let to = emptySlots[0]+45
        await bot.simpleClick.leftMouse(from_).catch(()=>{})
        await bot.waitForTicks(10)
        await bot.simpleClick.leftMouse(to).catch(()=>{})
        await bot.waitForTicks(10)
        chest.close()
        critical = false
        tpaTo(KitCommand.kitFor)
        await waitForPlayer(KitCommand.kitFor).then(() => {
            if(KitCommand.kitFor) {
                incrementKitCount(KitCommand.kitFor)
                log(`Gave kit ${KitCommand.kitId} to ${KitCommand.kitFor}`)
                if(!VIP.includes(KitCommand.kitFor))
                    KitCommand.cooldown[KitCommand.kitFor] = moment()
            }
            this.reset(true)
        })
    }
}

@registeredCommand("&mail", "<username>", "mails someone up to 27 items")
class MailCommand extends Command {
    
    static mailingFor = null
    static mailingTo = null

    constructor(mailingFor, mailingTo) {
        super(mailingFor)
        this.mailingTo = mailingTo
    }

    reset(doKill) {
        MailCommand.mailingFor = null
        MailCommand.mailingTo = null
        this.itemCount = 0
        if(doKill)
            kill()
        lock = null
    }

    checkLocked(username) {
        if(MailCommand.mailingFor == username) {
            speak(`< Wait, I'm sending mail for you!`)
        } else if(MailCommand.mailingFor) {
            speak(`< Wait, I'm sending mail for ${MailCommand.mailingFor}`)
        }
    }

    async execute() {
        if(!VVVIP.includes(this.username) && maintenance){
            speak('&mail is out of order. Try again later')
            return
        }
        if(this.mailingTo && !bot.players.hasOwnProperty(this.mailingTo)) {
            speak(`Player ${this.mailingTo} is not online`)
            return
        }
        if(!this.mailingTo) {
            speak(`&mail <username> requires a username argument`)
            return
        }
        if(isUpdating()) {
            speak(`I'm about to update, try again in a few seconds`)
            return
        }
        if(lock) {
            lock.checkLocked(this.username)
            return
        }
        MailCommand.mailingFor = this.username
        MailCommand.mailingTo = this.mailingTo
        lock = this
        log('Started mailing for ' + this.username + ' to ' + this.mailingTo)
        tpaTo(this.username)
        await waitForPlayer(this.username)
        speak(`${this.username}, drop me up to 27 shulkers, and I will send them to ${this.mailingTo}. Make sure to place an enderchest nearby. Hit me when you're done handing the shulks.`)
        await forEnderchest(this.username)
        if(!MailCommand.mailingFor)
            return
        await massDepositEnderchest()
        kill()
        await sleeps(2)
        await massWithdrawEnderchest()
        await sleeps(1)
        this.itemCount = bot.inventory.items().length
        log('Item count: ' + this.itemCount)
        if(this.itemCount == 0) {
            this.reset(true)
            return
        }
        tpaTo(MailCommand.mailingTo)
        let ticksStart = ticks
        while(Object.values(bot.entities).filter(entity=>entity.type=='player' && entity.username == MailCommand.mailingTo).length == 0) {
            if(!MailCommand.mailingFor)
                this.reset(true)
            await bot.waitForTicks(20)
        }
        log(`Done mailing items from ${MailCommand.mailingFor} to ${MailCommand.mailingTo}`)
        this.reset(true)
    }
}

// @registeredCommand("&godpot", "", "baptizes the fuck out of you")
class GodPotCommand extends Command { // WIP
    constructor(username) {
        super(username)
    }

    reset(doKill) {
        if(doKill)
            kill()
        lock = null
    }

    async execute() {

    }
}

@registeredCommand("&attack", "<username>", "bonks a fellow gamer")
class AttackCommand extends Command {
    constructor(username, targetUser) {
        super(username)
        this.increaseCooldown = targetUser.includes(',')
        this.targetUser = this.increaseCooldown ? targetUser.replace(',', '') : targetUser
    }

    checkLocked(username) {
        let verbs = ['pummeling', 'thrashing', 'mauling', 'battering', 'drubbing', 'lashing', 'bludgeoning', 'savaging', 'clobbering', 'annihilating']
        let randomVerb = verbs[Math.floor(Math.random() * verbs.length)]
        if(username == this.username) {
            speak(`Wait, I'm ${randomVerb} you}`)
        } else {
            speak(`Wait, I'm ${randomVerb} ${this.username}`)
        }
    }
    
    reset(doKill) {
        if(doKill)
            kill()
        lock = null
        if(this.username == '_Nether_Chicken') {
            log('boop!!!!')
            return
        }
        if(this.increaseCooldown) {
            speak(`< Bonk! No grief kits here. ${this.username} is getting a 24-hour timeout.`)
            KitCommand.cooldown[this.username] = moment().add(24, 'hours')
        }
    }

    async getSword() {
        let swordChestBlock = bot.blockAt(BED_POS.offset(2, 1, -3))
        let chest = null
        try {
            critical = true
            chest = await bot.openContainer(swordChestBlock)
        } catch(error) {
            log(chest)
            log(error)
        }
        let swordSlots = chest.slots.filter(item => item?.type == 276).map(item=>item.slot)
        if(swordSlots.length == 0) {
            chest.close()
            critical = false
            return false
        }
        await bot.simpleClick.leftMouse(swordSlots[0]).catch(()=>{})
        await bot.waitForTicks(10)
        await bot.simpleClick.leftMouse(27).catch(()=>{})
        chest.close()
        critical = false
        await moveItemToHand(276)
        return true
    }

    async execute() {
        if(lock) {
            lock.checkLocked(this.username)
            return
        }
        lock = this
        let hasSword = await this.getSword()
        if(!hasSword) {
            this.reset()
            return
        }
        tpaTo(this.targetUser)
        await waitForPlayer(this.targetUser)
        const defaultMove = new Movements(bot)
        defaultMove.canDig = false
        defaultMove.maxDropDown = 100
        defaultMove.allowParkour = true
        defaultMove.allowSprinting = true
        bot.pathfinder.setMovements(defaultMove)
        while(lock) {
            const target = bot.players[this.targetUser] ? bot.players[this.targetUser].entity : null
            if(!target) {
                log('No target found, resetting')
                this.reset(true)
                return
            }
            bot.attack(target)
            await bot.waitForTicks(5)
            const p = target.position
            try {
                await bot.pathfinder.goto(new GoalNear(p.x, p.y, p.z, 1))
            } catch(error) {
                this.reset(true)
                return
            }
        }
    }
}

@registeredCommand("&map", "", "creates a map, saving you map creation charges")
class MapCommand extends Command {
    constructor(username) {
        super(username)
    }

    checkLocked(username) {
        speak(`Wait, I'm creating a map for ${this.username}`)
    }

    reset(doKill) {
        if(doKill)
            kill()
        lock = null
    }

    async execute() {
        if(!VVVIP.includes(this.username) && maintenance){
            speak('&map is out of order. Try again later')
            return
        }
        if(lock) {
            lock.checkLocked(this.username)
            return
        }
        lock = this
        log('Making a map for ' + this.username)
        tpaTo(this.username)
        await waitForPlayer(this.username)
        if(this.username != '_Nether_Chicken')
            speak(`${this.username}, drop me up a blank map, and I will spend a creation charge on this chunk for you`)
        let mapSlots = null
        let ticksStart = ticks
        while(!mapSlots || mapSlots.length == 0) {
             if(ticks - ticksStart > 600) {
                lock.reset(true)
                speak(`< ${username} took too long to give me the shulkers.`)
                return
             }
             mapSlots = bot.inventory.items().filter(item => item?.type == 395).map(item => item.slot)
             await bot.waitForTicks(2)
        }
        await moveItemToHand(395)
        const player = bot.players[this.username] ? bot.players[this.username].entity : null
        if(player != null) {
            await bot.lookAt(player.position)
            await bot.waitForTicks(5)
            bot.activateItem()
        }
        log(`Done creating a map for ${this.username}`)
        this.reset(true)
    }
}
/* END OF COMMAND DECLARATIONS */


/* START OF BOT MECHANICS */
async function speak(message) {
    if(message == lastMessage)
        return
    if(!message)
        return
    let tpy_match = message.match(/\/tpy\s+(\S+)\s*/)
    let some_other_command_match = message.match(/^\/(.*)\s+/)
    if(tpy_match && tpy_match[1] != '_Nether_Chicken') {
        speak(`> ${tpy_match[1]} tried to pull a funny.`)
        return
    }
    if(some_other_command_match && !['nc', 'r'].some((cmd) => some_other_command_match[1].startsWith(cmd))) {
        log('Someone tried to send ' + message) 
        return
    }
    let treatedMessage = message.replaceAll(/[\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u000B\u000C\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\uFFFD]/g,'') // thanks Autiboy08!! 
    .replaceAll(/\{.*}/g, '[REDACTED]')
    .replaceAll('§', '')
    .replaceAll(/(.)\1{10,99}/g, '$1')
    .trim()
    if(treatedMessage)
        speakQueue.push(treatedMessage)
}

function createBot() {
    log('Logging in')
    try {
        bot = Mineflayer.createBot({
            host: 'hamhung.0b0t.org',
            username: '_Robot_Chicken',
            auth: 'microsoft',
            version: '1.12.2',
            hideErrors: true
        })
        bot.loadPlugin(pathfinder)
        log('Logged in')
        registerBotListeners()
    } catch(error) {
        log('Error logging in:')
        log(error)
    }
}

function areBooksSpread(chest) {
    return chest.containerItems().filter(item => item.count != 1).length == 0
}

function getStackedBooksSlot(chest) {
    const stackedBooks = chest.containerItems().filter(item => item.count != 1)
    if(!stackedBooks.length)
        return -1
    return [stackedBooks[0].slot, stackedBooks[0].count]
}

function getEmptySlotsInventory() {
    const inventorySlots = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]
    return inventorySlots.filter((element) => !bot.inventory.items().map(item=>item.slot).includes(element))
}

function getEmptySlots(chest) {
    if(chest?.slots == null) {
        speak('chest.slots is null what the fuck how the fuck why the fuck')
        speak(`I'm stealing your stuff`)
        lock.reset(true)
        return
    }
    return chest.slots.reduce((acc, val, index) => val === null ? [...acc, index] : acc, []).filter((slot) => slot < 27)
}

function getBookSlotsFromChest(chest) {
    return chest.slots.filter(item => item?.type == 387).map(item=>item.slot)
}

function getShulkerSlotsFromChest(chest) {
    return chest.slots.filter(item => item?.name.includes('shulker')).map(item=>item.slot)
}

function getShulkerSlots() {
    return bot.inventory.items().filter(item => item?.name.includes('shulker')).map(item => item.slot)
}

async function spreadBooks() {
    log('Spreading books')
    while(!bot) {
        log('Waiting for bot to come back online to spread books')
        await sleeps(1)
    }
    let chestBlock = bot.blockAt(BED_POS.offset(3, 0, 0))
    critical = true
    let chest = await bot.openContainer(chestBlock)
    while(!areBooksSpread(chest)) {
        let [slot, count] = getStackedBooksSlot(chest)
        if(slot == -1)
            log('Oooopsie')
        await bot.waitForTicks(2)
        await bot.simpleClick.leftMouse(slot)
        const nullSlots = getEmptySlots(chest)
        for(const slot of nullSlots) {
            if(count > 0) {
                await bot.simpleClick.rightMouse(slot)
            }
            count--
        }
    }
    chest.close()
    critical = false
    log('Done spreading books')
}

async function sleeps(seconds) {
    return sleep(seconds*1000)
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function kill() {
    log('Killing')
    intentionalDeath = true
    if(bot)
        bot.chat('/kill')
    else {
        log('Retrying kill')
        sleeps(2)
        kill()
    }
}

function tpaTo(username) {
    log('tping to ' + username)
    tpingTo = username
    try {
        bot.chat('/tpa ' + username)
    } catch(error) {
        if(error.toString().includes('is not a function')) {
            log('Error while trying to tpa:')
            log(error)
            if(lock)
                lock.reset(true)
            bot.quit()
            bot = null
            createBot()
        }
    }
}

async function moveItemToHand(itemId) {
    let itemSlot = bot.inventory.items().filter(item => item?.type == itemId).map(item => item.slot)
    if(itemSlot == -1)
        return
    await bot.moveSlotItem(itemSlot, 36)
    bot.setQuickBarSlot(0)
}

function hasEnderchest() {
    let enderchestSlots = bot.inventory.items().filter(item => item?.type == 130).map(item => item.slot)
    return enderchestSlots.length > 0
}

function getReferenceBlock() {
    let validPositions = []
    for(let x = -3; x < 3; x++) {
        for(let y = 0; y < 3; y++) {
            for(let z = -3; z < 3; z++) {
                let targetPos = bot.entity.position.offset(x,y,z)
                let isAir = bot.blockAt(targetPos).type == 0
                let blockUnder = bot.blockAt(targetPos.offset(0,-1,0))
                if(isAir && blockUnder.type != 0) {
                    validPositions.push(blockUnder)
                }
            }
        }
    }
    if(validPositions.length == 0)
        return null
    validPositions.sort((block) => bot.entity.position.distanceTo(block.position))
    return validPositions[0]
}

async function forEnderchest(username) {
    if(!lock)
        return
    log('Waiting inventory to fill')
    let enderchestBlock = null
    log('Waiting for enderchest')
    let ticksStart = ticks
    while(lock && !lock.gaveItems) {
        if(ticks - ticksStart > 600) {
            lock.reset(true)
            speak(`< ${username} took too long to give me the shulkers.`)
            return
        }
        await sleeps(1)
    }
    if(!lock)
        return
    await sleeps(1)
    lock.itemCount = bot.inventory.items().length
    log('Item count: ' + lock.itemCount)
    if(lock.itemCount == 0) {
        lock.reset(true)
        return
    }
    ticksStart = ticks
    while(!bot.findBlock({ matching: [130], maxDistance: 5 })) {
        if(hasEnderchest()) {
            await moveItemToHand(130)
            let referenceBlock = getReferenceBlock()
            let faceVector = new Vec3(0, 1, 0)
            await bot.placeBlock(referenceBlock, faceVector)
            await bot.waitForTicks(10)
            continue
        }
        if(!lock)
            return
        if(ticks - ticksStart > 600) {
            speak(`< ${username} took too long to give me an enderchest.`)
            lock.reset(true)
            return
        }
        await bot.waitForTicks(10)
    }
    log('Found enderchest')
}

async function waitForPlayer(username) {
    log(`Waiting for ${username}`)
    while(Object.values(bot.entities).filter(entity=>entity.type=='player' && entity.username == username).length == 0) {
        if(!lock)
            return
        await bot.waitForTicks(20)
    }
    log(`Found ${username}`)
}

async function massWithdrawEnderchest() {
    log('Withdrawing from enderchest')
    let chestBlock = bot.blockAt(BED_POS.offset(2, 0, 0))
    let chest = null
    try {
        critical = true
        chest = await bot.openContainer(chestBlock)
    } catch(error) {
        log(chest)
        log(error)
    }
    let shulkerSlots = getShulkerSlotsFromChest(chest)
    let invSlot = 0
    for(let i = 0; i < shulkerSlots.length; i++) {
        let from_ = shulkerSlots[i]
        let to = invSlot+27
        await bot.simpleClick.leftMouse(from_).catch(()=>{})
        await bot.waitForTicks(10)
        await bot.simpleClick.leftMouse(to).catch(()=>{})
        invSlot++
    }
    chest.close()
    critical = false
    log('Done withdrawing from enderchest')
}

async function quickRelog() {
    log('Quick relog in 15s')
    bot.quit()
    bot = null
    await sleeps(15)
    createBot()
}

async function relogDuringMassWithdrawChest() {
    log('I have to relog after waitForChunksToLoad timeout')
    log('Quitting')
    bot.quit()
    log('Quit')
    bot = null
    log('Waiting 5s')
    await sleeps(5)
    log('Creating bot')
    createBot()
    while(bot == null)
        await sleeps(1)
}

function safelyWaitForChunksToLoad() {
  const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
          log('bot.waitForChunksToLoad timed out')
          reject(new Error('bot.waitForChunksToLoad timed out'))
      }, 5000)
  })
  return Promise.race([bot.waitForChunksToLoad, timeoutPromise])
}

async function massWithdrawChest() {
    if(!lock)
        return
    log('Withdrawing from chest') 
    while(recentlyDisconnected)
        await sleeps(1)
    let chestBlock = null
    let chest = null
    while(!chestBlock && !chest) {
        try {
            chestBlock = bot.blockAt(BED_POS.offset(3, 0, 0))
            chest = await bot.openContainer(chestBlock)
        } catch(error) {
            await sleeps(5)
            log('Killing to try and reload world')
            kill()
            await sleeps(2)
        }
    }
    chest.requiresConfirmation = false
    log('Opened chest')
    let shulkerSlots = getShulkerSlotsFromChest(chest).filter(slot => slot < 27)
    log('Getting empty slots')
    let emptySlots = getEmptySlotsInventory()
    log('emptySlots.length > shulkerSlots.length:' + (emptySlots.length > shulkerSlots.length))
    for(let i = 0; i < shulkerSlots.length; i++) {
        if(!lock)
            return
        let from_ = shulkerSlots[i]
        let to = emptySlots[i]+18
        await bot.simpleClick.leftMouse(from_).catch(()=>{})
        await bot.waitForTicks(10)
        await bot.simpleClick.leftMouse(to).catch(()=>{})
        log(`Moving from ${from_} to ${to}`)
    }
    chest.close()
    critical = false
    log('Done withdrawing from chest')
}

async function massDepositChest() {
    log('Depositing to chest')
    let chestBlock = bot.blockAt(BED_POS.offset(3, 0, 0))
    critical = true
    let chest = await bot.openContainer(chestBlock)
    let emptySlots = getEmptySlots(chest)
    let shulkerSlots = getShulkerSlots()
    if(shulkerSlots.length == 0)
        return
    let max = Math.min(shulkerSlots.length, emptySlots.length)
    for(let i = 0; i < max; i++) {
        let from_ = shulkerSlots[i] + 18
        let to = emptySlots[i]
        await bot.simpleClick.leftMouse(from_).catch(()=>{})
        await bot.waitForTicks(1)
        await bot.simpleClick.leftMouse(to).catch(()=>{})
    }
    await bot.waitForTicks(2)
    chest.close()
    critical = false
    log('Done depositing to chest')
}

async function massDepositEnderchest() {
    log('Depositing to enderchest')
    let chestBlock = await bot.findBlock({ matching: [130], maxDistance: 5 })
    critical = true
    let chest = await bot.openContainer(chestBlock, new Vec3(0, -1, 0))
    let emptySlots = getEmptySlots(chest)
    let shulkerSlots = getShulkerSlots()
    if(shulkerSlots.length == 0) {
        log(`Shulker slots was zero, this shouldn't happen`)
        lock.reset(true)
        return
    }
    let max = Math.min(shulkerSlots.length, 18)
    for(let i = 0; i < max; i++) {
        if(!lock)
            return
        let from_ = shulkerSlots[i] + 18
        let to = emptySlots[i]
        await bot.simpleClick.leftMouse(from_).catch(()=>{})
        await bot.waitForTicks(10)
        await bot.simpleClick.leftMouse(to).catch(()=>{})
    }
    chest.close()
    critical = false
    log('Done depositing to enderchest')
}

async function walkTo(pos) {
    if(!bot)
        return
    const defaultMove = new Movements(bot)
    defaultMove.canDig = false
    defaultMove.allowSprint = false
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 0.5))
    while(bot.entity.position.distanceTo(pos) > 1)
        await bot.waitForTicks(2)
}

async function walkALittle() {
    if(isWalking)
        return
    try {
        log('Walking a little')
        if(critical) {
            log('Not walking since im critical')
            await sleeps(1)
        }
        isWalking = true
        bot.setControlState('left', true)
        await sleeps(1)
        bot.setControlState('left', false)
        bot.setControlState('right', true)
        await sleeps(1)
        bot.setControlState('right', false)
    } catch(error) {
        log('Error trying to walkALittle:')
        log(error)
        if(bot) {
            bot.setControlState('right', false)
            bot.setControlState('left', false)
        }
    }
    isWalking = false
}

async function anonimize(message) {
    if(isSpam(message))
        return
    if(message.match(/discord.gg\/\w+/))
        return
    if(lastAnonimizedMessageTicks && ticks - lastAnonimizedMessageTicks < 90)
        return
    lastAnonimizedMessageTicks = ticks
    let block = message.substring(0,120)
    block = block
            .replaceAll(/child/ig, 'grown man')
            .replaceAll(/kid/ig, 'grown man')
            .replaceAll(/infant/ig, 'grown man')
            .replaceAll(/\bboy\b/ig, ' grown man ')
            .replaceAll(/minor/ig, 'grown man')
            .replaceAll(/sex/ig, 'love')
            .replaceAll(/rape/ig, 'help')
            .replaceAll(/nigger/ig, 'digger')
            .replaceAll(/nigga/ig, 'digga')
            .replaceAll(/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, '0b0t.org')
            .replaceAll(/<@&?[0-9]+>/g, '[REDACTED]')
    let verbs = ['murmured', 'muttered', 'hushed', 'sighed', 'mumbled', 'sibilated', 'uttered quietly', 'susurrated']
    let randomVerb = verbs[Math.floor(Math.random() * verbs.length)]
    if(block)
        speak(`Someone ${randomVerb}: ${block}`)
}

async function dropAll() {
    const items = bot.inventory.items()
    for(const item of items) 
        await bot.tossStack(item)
}

async function relogGracefully() {
    while(lock)
        await sleeps(1)
    bot.quit()
    await sleeps(120)
    bot = null
    createBot()
}

function registerBotListeners() {
    bot.on('end', async (reason) => { 
        log(`Disconnected for reason: ${reason}`)
        if(reason == 'disconnect.quitting')
            return
        if(DupeCommand.dupingFor && (reason != 'encryptionLoginError' || reason != 'keepAliveError'))
            return
        log('Auto-Reconnecting')
        if(bot)
            bot.quit()
        await sleeps(20)
        createBot()
    })
    bot.on('kicked', async (reason) => {
        log(`Kicked for reason: ${reason}`)
        let defaultKickMessages = [
            'ReadTimeoutException',
            'Not authenticated with',
            'Error occurred while contacting login servers, are they down?',
            'Proxy lost connection to server'
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
                if(lock)
                    lock.reset()
                bot.quit()
                bot = null
                createBot()
            }
        }
    })
    bot.once('spawn', async () => {
        bot.on('playerJoined', async (player) => {
            log(`${player.username} joined the game`, true)
            updatePlayerTabImg()
            if(blacklist.includes(player.username))
                return
            if(player.username == 'Synio' && Math.random() < 0.2)
                speak('praise Synio')
            if(bridgeChannel)
                forwardDiscordBridge(player.username, `${player.username} joined the game`, true)
            if(player.username == 'bluejay173') {
                if(Math.random() > 0.2)
                    return
                await sleeps(5)
                speak('blue jay')
            }
        })
        bot.on('playerLeft', async (player) => {
            log(`${player.username} left the game`, true)
            updatePlayerTabImg()
            if(blacklist.includes(player.username))
                return
            if(AfkCommand.afkPlayers.hasOwnProperty(player.username))
                delete AfkCommand.afkPlayers[player.username]
            if(bridgeChannel)
                forwardDiscordBridge(player.username, `${player.username} left the game`, true)
        })
    })
    bot.on('chat', (username, message, translate, jsonMsg, matches) => {
        chatCache.push([...[username,message]])
        if(chatCache.length > 200)
            chatCache.shift()
        checkAfk(username, message)
        if(blacklist.includes(username))
            return
        if(message == VerifyCommand.verification) {
            database.verification[VerifyCommand.verificationUsername] = username
            bot.chat(`/w ${VerifyCommand.verificationUsername} you are now verified`)
            saveDatabase()
        }
        if(message == 'ping')
            speak(`pong`)
        if(message == 'hi' && Math.random() <= 0.01)
            copypasta()
        if(message.toLowerCase().includes('fag'))
            incrementFagCounter(username, message.toLowerCase())
        commandHandler.handle(username, message)
    })
    bot.on('message', async (message, position, jsonMsg, sender, verified) => {
        /**
         * thanks dehumanizing / Cody4687 !!
         **/
        let userMessageMatch = message.toMotd().match(/^<(.+?)> (.+)$/)
        if(userMessageMatch) {
            let [_, rawIgn, msg] = userMessageMatch
            let possibleColorCode = rawIgn.substring(0,2)
            let color = HEX_CONVERSION_CODES[possibleColorCode] ?? null
            let ign = rawIgn.replaceAll(/§./g, '')
            if(Object.values(database.verification).includes(ign))
                updateIgnColorIfNeeded(rawIgn)
            if(blacklist.includes(ign))
                return
            msg = msg.replaceAll(/§./g, '')
            forwardDiscordBridge(ign, msg)
        }
    })
    bot.on('messagestr', async (message, position, jsonMsg, sender, verified) => {
        if(message.trim())
            log(message.trim(), true)
        const tooManyMessages = message.match(/^NCP: Too many messages, slow down...$/g)
        const slowDown = message.match(/^Slow down chat or you'll get kicked for spam.$/g)
        const serverRestarting = message.match(/^\[Server\] Server restarting or shutting down in ..? seconds...$/)
        const deathIsBusy = message.match(/^&cSorry, Death is too busy at the moment. Please try again later...&r$/)
        const playerNotFound = message.match(/^Player not found.$/)
        const teleportFailed = message.match(/^\s*Teleport failed!\s*$/)
        const matchesTimeout = message.match(/^Your teleport request to (.*) timed out.$/)
        const matchesTpRequest = message.match(/^(.*?) wants to teleport to you.$/)
        const matchesTpRequestDenied = message.match(/^Your request sent to (.*) was denied!$/)
        const walkABlock = message.match(/^Walk a block to speak in chat.$/)
        const serverCrashed = message.match(/^Exception Connecting:ReadTimeoutException : null$/)
        const serverCommandFailed = message.match(/^Please wait a bit before using this command again!$/)
        const tpaAccepted = message.match(/^Your request was accepted, teleporting to: .*$/)
        if(tpaAccepted) {
            if(tpingTo)
                tpingTo = null
            else
                log('what')
        }
        if(serverCommandFailed) {
            if(tpingTo) {
                await bot.waitForTicks(60)
                tpaTo(tpingTo)
            }
        }
        if(serverRestarting) {
            log('Server restart detected. Relogging soon')
            relogGracefully()
            return
        }
        if(tooManyMessages || slowDown)
            lastMessageTicks += 100
        if(serverCrashed) {
            log('Server crashed, reconnecting')
            lock.reset()
            bot.quit()
            createBot()
        }
        if(deathIsBusy) {
            await sleeps(10)
            kill()
        }
        if(matchesTpRequest) {
            const fromWho = matchesTpRequest[1]
            if(fromWho == '_Nether_Chicken')
                bot.chat('/tpy ' + fromWho)
            else   
                bot.chat('/tpn ' + fromWho)
        }
        if(teleportFailed) {
            speak(`Teleport  failed for ${lock.username}. I don't even know how that happens tbh`)
            lock.reset(true)
        }
        if(matchesTimeout) {
            const fromWho = matchesTimeout[1]
            if(DupeCommand.dupingFor == fromWho)
                speak(`< ${DupeCommand.dupingFor} forgot to accept my tp request`)
            if(MailCommand.mailingFor == fromWho)
                speak(`< ${MailCommand.mailingFor} forgot to accept my tp request to send some mail to ${MailCommand.mailingTo}`)
            if(MailCommand.mailingTo == fromWho)
                speak(`< ${MailCommand.mailingTo} forgot to accept my tp request to receive some mail from ${MailCommand.mailingFor}`)
            if(lock)
                lock.reset(true)
            tpingTo = null
        }
        if(matchesTpRequestDenied) {
            const fromWho = matchesTpRequestDenied[1]
            if(DupeCommand.dupingFor == fromWho) {
                if(!VIP.includes(fromWho))
                    DupeCommand.cooldown[fromWho] = moment()
                lastMessage = null
                lastMessageTicks = null
            }
            if(KitCommand.kitFor == fromWho) {
                if(!VIP.includes(fromWho))
                    KitCommand.cooldown[fromWho] = moment()
            }
            if(MailCommand.mailingTo == fromWho) {
                speak(`< ${MailCommand.mailingTo} denied my tp request to receive some mail from ${MailCommand.mailingFor}`)
            }
            lock.reset(true)
            tpingTo = null
        }
        if(playerNotFound) {
            log('Player not found to tp, resetting')
            if(lock)
                lock.reset(true)
        }
        if(walkABlock) {
            log('Should walk a block')
            speakQueue.unshift(lastMessage)
            walkALittle()
        }
    })
    bot.on('whisper', (username, message, translate, jsonMsg, matches) => {
        if(blacklist.includes(username))
            return
        if(username != '_Nether_Chicken') {
            anonimize(message)
            return
        }
        if(message.match(/gpt .*/)) {
            new AskGPTCommand('_Nether_Chicken', message.substring(4)).execute()
        }
        if(message.match(/say .*/))
            speak(message.substring(4))
        if(message.match(/ignore .*/))
            bot.chat('/ignore ' + message.substring(7))
        if(message.match(/^ban .*/)) {
            let banned = message.substring(4)
            ban(banned)
            bot.chat(`/r blacklist is now ${blacklist.length} long`)
        }
        if(message.match(/unban .*/)) {
            let unbanned = message.substring(6)
            unban(unbanned)
            bot.chat(`/r blacklist is now ${blacklist.length} long`)
        }
        if(message == 'godsword')
            new GwCommand('_Nether_Chicken').execute()
        if(message == 'come')
            tpaTo('/tpa _Nether_Chicken')
        if(message == 'drop')
            dropAll()
        if(message == 'afk')
            AfkCommand.afkPlayers['_Nether_Chicken'] = [moment(), null]
        if(message.match(/attack.*/)) {
            new AttackCommand(null, message.substring(6).trim()).execute()
        }
        if(message.match(/kit.*/)) {
            let kitId = message.substring(4).trim()
            new KitCommand('_Nether_Chicken', kitId).execute()
        }
        if(message == 'copypasta')
            copypasta()
        if(message == 'kill')
            kill()
        if(message == 'walkALittle')
            walkALittle()
        if(message.match('mail .*')) {
            let mailingTo = message.substring(5)
            new MailCommand('_Nether_Chicken', mailingTo).execute()
        }
        if(message == 'bed')
            log(process.env.BED)
        if (message.match(/goto (\S+) (\S+) (\S+)/)) {
            let [, x, y, z] = message.match(/goto (\S+) (\S+) (\S+)/).map(Number)
            walkTo(x, y, z)
        }        
        if(message == 'map') {
            new MapCommand('_Nether_Chicken').execute()
        }
        if(message == 'ooo') {
            maintenance = !maintenance
            bot.chat('/r maintenance state: ' + maintenance)
        }
        if(message == 'promote kit')
            speak(PROMOTION_MESSAGES[5])
        if(message == 'dupe') {
            if(lock)
                bot.chat('/r wait')
            else
                new DupeCommand('_Nether_Chicken').execute()
        }
        if(message == 'reset')
            lock.reset(true)
        if(message == 'source')
            new SourceCommand().execute()

    })
    bot.on('death', () => {
        if(lock && !intentionalDeath) {
            log('Unintentional death detected')
            lock.reset()
            critical = false
        }
        intentionalDeath = false
    })
    bot.on('entityHurt', (entity) => {
        if(!lock)
            return
        if(entity.type == 'player' && entity.username == '_Robot_Chicken')
            lock.gaveItems = true
    })
    bot.on('physicsTick', () => {
        ticks++
        speakRoutine()
        if(ticks % THIRTY_MINUTES != 0)
            return
        shamelessSelfPromotion()
    })
    bot.on('spawn', async () => {
        recentlyDisconnected = false
    })
}
/* END OF BOT MECHANICS */

clearUpdateLockFile()
initBlacklist()
initDatabase()
initDiscord()
createBot()

const config = require('../config')
const { cmd, commands } = require('../command')
const { runtime } = require('../lib/functions')

cmd({
    pattern: "menu",
    alias: ["allmenu","fullmenu"],
    desc: "Show all bot commands",
    category: "menu",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {

        // Group commands by category
        let categories = {}
        commands.forEach(cmd => {
            if (!cmd.category) return
            if (!categories[cmd.category]) categories[cmd.category] = []
            categories[cmd.category].push(cmd.pattern)
        })

        // Header
        let menu = `╭━━〔 *${config.BOT_NAME}* 〕━━┈⊷
┃ 👑 Owner : *${config.OWNER_NAME}*
┃ ⚙️ Prefix : *${config.PREFIX}*
┃ 🌐 Platform : *Heroku*
┃ ⏱️ Runtime : *${runtime(process.uptime())}*
╰━━━━━━━━━━━━━━━━━━━┈⊷
`

        // Build menu dynamically
        for (let category in categories) {
            menu += `
╭━━〔 📂 *${category.toUpperCase()} MENU* 〕━━┈⊷
┃◈╭─────────────────·๏
`
            categories[category].forEach(cmd => {
                menu += `┃◈┃• ${config.PREFIX}${cmd}\n`
            })

            menu += `┃◈╰─────────────────┈⊷
╰━━━━━━━━━━━━━━━━━━━┈⊷
`
        }

        menu += `\n> ${config.DESCRIPTION}`

        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/rqwypm.jpg' },
            caption: menu,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek })

    } catch (e) {
        console.log(e)
    }
})

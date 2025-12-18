const config = require('../config')
const { cmd, commands } = require('../command')
const { runtime } = require('../lib/functions')

cmd({
    pattern: "menu",
    alias: ["allmenu", "fullmenu"],
    desc: "Show all bot commands",
    category: "general",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {

        // Date & Time
        const now = new Date()
        const date = now.toLocaleDateString()
        const time = now.toLocaleTimeString()

        const usern = m.pushName || "User"

        // Regrouper les commandes par catégorie
        let categories = {}
        let totalCommands = 0

        commands.forEach(c => {
            if (!c.category || !c.pattern) return
            if (!categories[c.category]) categories[c.category] = []
            categories[c.category].push(c.pattern)
            totalCommands++
        })

        // ===== HEADER =====
        let menu = `
╭━━━━━━━━━━━━━━━┈⊷
┃✪┃ 𝙾𝚆𝙽𝙴𝚁: ${config.OWNER_NAME}
┃✪┃ 𝚄𝚂𝙴𝚁: ${usern}
┃✪┃ 𝙳𝙰𝚃𝙴: ${date}
┃✪┃ 𝚃𝙸𝙼𝙴: ${time}
┃✪┃ 𝙿𝙻𝚄𝙶𝙸𝙽𝚂: ${totalCommands}
┃✪┃ 𝙼𝙾𝙳𝙴: ${config.WORK_TYPE || "public"}
┃✪┃ 𝙷𝙰𝙽𝙳𝙻𝙴𝚁: ${config.PREFIX}
┃✪┃ 𝚅𝙴𝚁𝚂𝙸𝙾𝙽: ${require("../package.json").version}
╰━━━━━━━━━━━━━━━━┈⊷
`

        // ===== COMMAND LIST =====
        Object.keys(categories).sort().forEach(category => {
            menu += `
╭━━━━━━━━━━━━━┈⊷
┃⬢  *${category.toUpperCase()}*
╰━━━━━━━━━━━━━┈⊷
╭━━━━━━━━━━━━━┈⊷`
            categories[category].forEach(cmd => {
                menu += `\n│✧│   ${config.PREFIX}${cmd}`
            })
            menu += `
╰━━━━━━━━━━━━━┈⊷`
        })

        // ===== FOOTER =====
        menu += `
© ${config.BOT_NAME}
${config.DESCRIPTION || ""}
`

        // ===== SEND MENU =====
        await conn.sendMessage(from, {
            image: {
                url: config.MENU_IMAGE_URL || "https://files.catbox.moe/xoac4l.jpg"
            },
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

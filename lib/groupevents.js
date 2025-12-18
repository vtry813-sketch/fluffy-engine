const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363403408693274@newsletter',
            newsletterName: '𝚂𝙷𝙸𝙽𝙸𝙶𝙰𝙼𝙸 𝚅𝟸',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

const GroupEvents = async (conn, update) => {
    try {
        if (!isJidGroup(update.id)) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            /* ================= WELCOME ================= */
            if (update.action === "add" && config.WELCOME === "true") {

                const WelcomeText = `
╭━━━━━━━━━━━━━━━┈⊷
┃𖤐┃ *WELCOME*
╰━━━━━━━━━━━━━━━┈⊷

👋 Hello @${userName}

╭━━━━━━━━━━━━━━━┈⊷
┃𖤐┃ Group : ${metadata.subject}
┃𖤐┃ Member : @${userName}
┃𖤐┃ Total Members : ${groupMembersCount}
┃𖤐┃ Date : ${timestamp}
╰━━━━━━━━━━━━━━━┈⊷

📌 Group Description
${desc}

╭━━━━━━━━━━━━━━━┈⊷
┃𖤐┃ Please respect the rules
┃𖤐┃ Be active & friendly
┃𖤐┃ Enjoy your stay 🤍
╰━━━━━━━━━━━━━━━┈⊷

> Type *PAIR* to connect bot

🤖 Powered by ${config.BOT_NAME}
`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            /* ================= GOODBYE ================= */
            } else if (update.action === "remove" && config.WELCOME === "true") {

                const GoodbyeText = `
╭━━━━━━━━━━━━━━━┈⊷
┃𖤐┃ *GOODBYE*
╰━━━━━━━━━━━━━━━┈⊷

😔 @${userName} has left the group.

╭━━━━━━━━━━━━━━━┈⊷
┃𖤐┃ Group : ${metadata.subject}
┃𖤐┃ Members Now : ${groupMembersCount}
┃𖤐┃ Date : ${timestamp}
╰━━━━━━━━━━━━━━━┈⊷
`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            /* ================= ADMIN DEMOTE (NO DESIGN) ================= */
            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {

                const demoter = update.author.split("@")[0];

                await conn.sendMessage(update.id, {
                    text:
                        `Admin Event\n\n` +
                        `@${demoter} demoted @${userName} from admin.\n` +
                        `Time: ${timestamp}\n` +
                        `Group: ${metadata.subject}`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            /* ================= ADMIN PROMOTE (NO DESIGN) ================= */
            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {

                const promoter = update.author.split("@")[0];

                await conn.sendMessage(update.id, {
                    text:
                        `Admin Event\n\n` +
                        `@${promoter} promoted @${userName} to admin.\n` +
                        `Time: ${timestamp}\n` +
                        `Group: ${metadata.subject}`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }

    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;

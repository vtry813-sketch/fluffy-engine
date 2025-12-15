const { cmd } = require('../command');
const axios = require('axios');

// ===============================
// made in by inconnu boy 
// ===============================
cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get pairing code for inconnu XD bot",
    category: "download",
    use: ".pair +554XXXXXXXX",
    filename: __filename
}, async (conn, mek, m, { q, senderNumber, reply }) => {
    try {
        const phoneNumber = q ? q.trim() : senderNumber;

        if (!phoneNumber || !phoneNumber.match(/^\+?\d{10,15}$/)) {
            return await reply("❌ Please provide a valid phone number with country code\nExample: .pair +554XXXXXXXX");
        }

        // Remove + sign for API
        const cleanNumber = phoneNumber.replace(/\D/g, "");

        // Call API endpoint
        const res = await axios.get(`https://bilalmd-pair-602d1996abb2.herokuapp.com/code?number=${cleanNumber}`);
        const code = res.data?.code;

        if (!code) {
            return await reply("❌ Could not retrieve inconnu xd pairing code.");
        }

        const doneMessage = "> *MINI INCONNU PAIRING COMPLETED*";
        await reply(`${doneMessage}\n\n*Your pairing code is:* ${code}`);

        await new Promise(resolve => setTimeout(resolve, 2000));
        await reply(`${code}`);

    } catch (err) {
        console.error("Pair1 command error:", err);
        await reply("❌ Error while getting inconnu pairing code.");
    }
});

// ===============================
// Pair 2 (WHITESHADOW-MD)
// ===============================
cmd({
    pattern: "pair2",
    alias: ["getpair2", "clonebot2"],
    react: "✅",
    desc: "Get pairing code for inconnu xd bot",
    category: "download",
    use: ".pair2 +554XXXXXXXX",
    filename: __filename
}, async (conn, mek, m, { q, senderNumber, reply }) => {
    try {
        const phoneNumber = q ? q.trim() : senderNumber;

        if (!phoneNumber || !phoneNumber.match(/^\+?\d{10,15}$/)) {
            return await reply("❌ Please provide a valid phone number with country code\nExample: .pair2 +554XXXXXXXXX");
        }

        // Remove + sign for API
        const cleanNumber = phoneNumber.replace(/\D/g, "");

        // Call API endpoint
        const res = await axios.get(`https://ilmd-pair-602d1996abb2.herokuapp.com/code?number=${cleanNumber}`);
        const code = res.data?.code;

        if (!code) {
            return await reply("❌ Could not retrieve mini inconnu pairing code.");
        }

        const doneMessage = "> *MINI INCONNU PAIRING COMPLETED*";
        await reply(`${doneMessage}\n\n*Your pairing code is:* ${code}`);

        await new Promise(resolve => setTimeout(resolve, 2000));
        await reply(`${code}`);

    } catch (err) {
        console.error("Pair2 command error:", err);
        await reply("❌ Error while getting mini inconnu XD pairing code.");
    }
});
  

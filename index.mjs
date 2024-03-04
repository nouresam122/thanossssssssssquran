import inquirer from "inquirer";
import chalkAnimation from "chalk-animation";
import Discord from 'discord.js';
import { createAudioResource,createAudioPlayer, joinVoiceChannel} from '@discordjs/voice'; 
import { createSpinner } from "nanospinner";
import Database from "st.db";
import ms from 'ms';
import radio_choices from "./channels.mjs";
import replit from "quick.replit"
const config_db = new replit.Database(process.env["REPLIT_DB_URL"])
const config_delete_db = new Database({path:"./datas/config.yml"})
await getStarted()

async function getStarted(){
  if(await config_delete_db.has("delete_this_value_if_you_want_delete_config") != true || await config_delete_db.get("delete_this_value_if_you_want_delete_config") == true){
    await config_db.delete(`bot_config`)
  }
  if(await config_db.get(`bot_config`)) return await startBot()
  const rainbow = chalkAnimation.pulse('؟ﻡﻮﻴﻟﺍ ﻲﺒﻨﻟﺍ ﻲﻠﻋ ﺖﻴﻠﺻ ﻞﻫ');

  setTimeout(async()=> {
     rainbow.stop()
     console.log(`\u001b[40;1m ﻢﻳﺮﻜﻟﺍ ﻥﺍﺮﻘﻟﺍ ﻮﻳﺩﺍﺭ ﺕﻮﺑ\n\u001b[0m ﺔﻄﺳﺍﻮﺑ \u001b[47;1m\u001b[30;1mShuruhatik#2443\u001b[0m `)
     const ask1 = await inquirer.prompt({
       name:"token_bot",
       type:'password',
       message:`ﻚﺑ ﺹ ﺎﺨﻟﺍ ﺕﻮﺒﻟﺍ ﻦﻛﻮﺗ ﻊﺿﻮﺑ ﻢﻗ :`,
       mask:"*"
     })
     const ask2 = await inquirer.prompt({
       name:"status_bot",
       type:'input',
       message:`ﻩﺪﻳﺮﺗ ﻱﺬﻟﺍ ﺕﻮﺒﻟﺍ ﺔﻟﺎﺣ ﺐﺘﻛﺍ :`,
     })
     const ask3 = await inquirer.prompt({
       name:"status_type",
       type:'list',
       message:`ﺕﻮﺒﻟﺍ ﺔﻟﺎﺣ ﻉﻮﻧ ﺮﺘﺧﺍ :`,
       choices:[
         "Playing","Competing","Listening","Watching"
       ]
     })
    const ask4 = await inquirer.prompt({
       name:"voice_invitelink",
       type:'input',
       message:`ﻪﻠﺧﺍﺩ ﺔﻋﺍﺫﻻﺍ ﺚﺑ ﺪﻳﺮﺗ ﻱﺬﻟﺍ ﻡﻭﺮﻟ ﺓﻮﻋﺩ ﻂﺑﺍﺭ ﻊﺿﻮﺑ ﻡﻮﻗ :`
     })
    const ask5 = await inquirer.prompt({
       name:"radio_url",
       type:'list',
       message:`ﺎﻫﺪﻳﺮﺗ ﻲﺘﻟﺍ ﺔﻴﻋﺍﺫﻹﺍ ﺓﺎﻨﻘﻟﺍ ﻢﻳﺮﻜﻟﺍ ﻥﺁﺮﻘﻟﺍ ﻮﻳﺩﺍﺭ ﺭﺎﺘﺧﺍ :`,
       choices:radio_choices
     })
     await config_db.set(`bot_config`,{
         token_bot:ask1.token_bot.replaceAll("\\","").replaceAll("~",""),
         status_bot:ask2.status_bot.replaceAll("\\","").replaceAll("~",""),
         status_type:ask3.status_type
     })
    await config_delete_db.set(`voice_invite_link`,ask4.voice_invitelink.replaceAll("\\","").replaceAll("~",""))
    await config_delete_db.set(`radio_url`,ask5.radio_url)
     return await startBot()
  },1500)
} 


async function startBot(){
 console.clear()
  const spinner = createSpinner(`Processing..`).start()
  const client = new Discord.Client({
      intents:[Discord.GatewayIntentBits.Guilds,Discord.GatewayIntentBits.GuildIntegrations,Discord.GatewayIntentBits.GuildVoiceStates],
      partials: [Discord.Partials.GuildScheduledEvent,Discord.Partials.Channel, Discord.Partials.GuildPresences] 
  })
  const config = await config_db.get(`bot_config`)
  const voice_invite_link = await config_delete_db.get(`voice_invite_link`)
  client.login(config.token_bot).then(()=>{
    spinner.update({ text: 'Running the bot...' })
  }).catch(()=>{
    spinner.error({ text: 'Invalid Bot Token' })
  })

  // Event Ready
  client.once("ready",async()=>{
    client.user.setActivity(config.status_bot, { type:Discord.ActivityType[config.status_type] });
    spinner.success({ text: `Logged in as ${client.user.tag} (${client.user.id})`})
     console.log("\u001b[32m▣\u001b[0m \u001b[0mﺔﻄﺳﺍﻮﺑ ﺕﻮﺒﻟﺍ ﺔﺠﻣﺮﺑ ﻢﺗ \u001b[34;1mShuruhatik#2443\u001b[0m")
     console.log("\u001b[32m▣ \u001b[0m\u001b[0m\u001b[40;1m\u001b[34;1mhttps://api.shuruhatik.com/add/"+client.user.id+"\u001b[0m")
      client.fetchInvite(voice_invite_link).then(async invite => {
        let guild = await client.guilds.cache.get(invite.guild.id)
        if(guild){
          let voiceChannel = await guild.channels.cache.get(invite.channelId)
          let connection = joinVoiceChannel({
              channelId: voiceChannel.id,
              guildId: voiceChannel.guild.id,
              adapterCreator: voiceChannel.guild.voiceAdapterCreator,
              group:client.user.id
         })
          
         startPlayRadio(connection,guild,voiceChannel)
         setInterval(() => startPlayRadio(connection,guild,voiceChannel),150000)
        }
      })
   })
   function startPlayRadio(connection,guild,voiceChannel) {
     try{
      if(voiceChannel.type == 13){
       guild.me.voice.setSuppressed(true).catch(console.error)
       guild.me.voice.setSuppressed(false).catch(console.error)
      }
      let radio_url = config_delete_db.get(`radio_url`)
      let player = createAudioPlayer()
      let resource = createAudioResource(radio_url)
       connection.subscribe(player)
       player.play(resource)
      } catch(e){
         // في حال ظهور اي خطا احذف الشرطين من سطر اسفل هذه التعليق لمعرفة اين الخطا
        //console.error(e)
      }
  }
}
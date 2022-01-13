
const Command = require("../Structures/Command.js");

const { MessageEmbed} = require('discord.js');
const path = require('path');
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36"
TIMEOUT_MINS = 5
AXIE_CONTRACT = "0x32950db2a7164ae833121501c797d79e7b79d74c"
AXS_CONTRACT = "0x97a9107c1793bc407d6f527b77e7fff4d812bece"
SLP_CONTRACT = "0xa8754b9fa15fc18bb59458815510e40a12cd2014"
WETH_CONTRACT = "0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5"
RONIN_PROVIDER_FREE = "https://proxy.roninchain.com/free-gas-rpc"
RONIN_PROVIDER = "https://api.roninchain.com/rpc"



module.exports = new Command({
	name: "ingreso"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
        try{
            if(args[2].includes('"')){
                let completo=args.join(" ")
                let nombre=completo.split('"')[1]
                nombre=nombre.replaceAll('"','')
                console.log(nombre)
                let uno=args[1]
                let dos=nombre
                args=['ingreso',uno,dos]
            }
            console.log(args)
            if(args.length==3){
                
                //IDs
                let new_account=await utils.getUserByNum(args[1])
                let from_acc=new_account.accountAddress
                if(!utils.isSafe(from_acc))return message.channel.send(`La cuenta esta mal!`);

                let username=args[2].split('#')[0]
                let discriminator=args[2].split('#')[1]
                await message.guild.members.fetch()
                let ingreso=message.guild.members.cache.find(c => { return (c.user.username.toLowerCase() == username.toLowerCase() && c.user.discriminator == discriminator) || c.user.username.toLowerCase() == username.toLowerCase() });
                if(!ingreso)return message.channel.send(`Ese usuario no se encuentra en el Discord`);
                
                let discord_id=ingreso.id
                await utils.cambiarEstado(new_account.num,'entrevista',message)
                await utils.ingresar(new_account.num,username,discord_id)
                
                let embed = new MessageEmbed().setTitle('Nuevo Entrevista Asignada').setDescription("Felicitaciones <@"+discord_id+">\nYa puedes escribir !roni para empezar tu entrevista").setColor('GREEN').setTimestamp()
                let rCanal = message.guild.channels.cache.find(c => c.id == 909165024642203658);//canal ingresos
                rCanal.send({content: ` `,embeds: [embed]})
                
            }else{
                utils.log(`${args[0]} is not a valid command!`);
            }
        }catch(e){
            message.channel.send("ERROR: "+e.message);
        }
	}
});
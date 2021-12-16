/** @format */
const path = require('path');

var utils = require(path.resolve(__dirname, "../utils.js"));
const Command = require("../Structures/Command.js");
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "pago",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(!(utils.esJeissonPagos(message) || utils.esFabri(message)))return message.reply('No tienes permisos para correr este comando')

		let currentUser=args[1]?await utils.getUserByNum(args[1]):await utils.getUserByDiscord(message.author.id)
		if(!currentUser)return message.channel.send('Usuario invalido')

		let row=new MessageActionRow()
		row.addComponents(new MessageButton().setCustomId('cobros').setLabel('🤑 Cobrar').setStyle('SUCCESS'));
		
		let rSoporte = message.guild.roles.cache.find(r => r.name === "Soporte");
        let rCategoria = message.guild.channels.cache.find(c => c.id == (args[1]?921106145811263499:utils.esJugador(message)?866879155350143006:909634641030426674) && c.type=='GUILD_CATEGORY');
	
		let thread=await message.guild.channels.create('pago-'+currentUser.num, { 
            type: 'GUILD_TEXT',
			parent:rCategoria?rCategoria.id:null,
            permissionOverwrites: [
                {id: message.author.id,allow: ['VIEW_CHANNEL']},
                {id: rSoporte.id,allow: ['VIEW_CHANNEL']},
                {id: message.guild.roles.everyone.id,deny: ['VIEW_CHANNEL']},
            ]})
        .then(chan=>{return chan})
        let embed = new MessageEmbed().setTitle('Nuevo Ticket')
        .setDescription(`CLICK AQUI PARA CONTINUAR ----->>> <#${thread.id}>`).setColor('GREEN').setTimestamp()

        await message.reply({content: ` `, embeds: [embed]})

        embed = new MessageEmbed().setTitle('Ticket')
        .setDescription(`Hola ${message.author}, soy Roni. \nCon que deseas que te ayude?`).setColor('GREEN').setTimestamp()

        await thread.send({
            content: ` `,
            embeds: [embed],
            components: [row]
        })
		let lascomnd=''
		const mcollector = thread.createMessageCollector({filter:(m) => m.author.id === message.author.id,max:1/*,time:600000*/})
		mcollector.on('collect', async message => {
			if(lascomnd=='desasociar')return utils.desasociar(message)
			else if(lascomnd=='asociar')return utils.asociar(message)
		});

		const collector = thread.createMessageComponentCollector({ componentType: 'BUTTON'/*, time: 600000*/ });
		collector.on('collect',  async interaction => {
			await interaction.deferUpdate();
			let customId=interaction.customId
			lascomnd=interaction.customId
			let jsid=877625345996632095//jeisson
			if( customId=='ticket_soporte'){
				interaction.channel.send(`Hola! <@${jsid}>, necesito de tu ayuda`)
			}else if( customId=='asociar' || customId=='desasociar'){
				interaction.channel.send('Por favor ingresa tu contraseña. Tenes 60 segundos.')
			}else if( customId=='cobros'){
				interaction.channel.send('Aguarde un momento...') 
				let data=await utils.claimData(currentUser,interaction.message)
				if(data.unclaimed==0)return thread.send('Tu cuenta no tiene SLP para reclamar') 
				if( data.scholarPayoutAddress==null ||  data.scholarPayoutAddress==undefined)return thread.send('Tu cuenta no tiene wallet para depositar') 
				
				interaction.channel.send('\nReclamar? SI / NO').then(function (message) {
					const filter = m => m.author.id === message.author.id;
					const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ['time'] })
					collector.on('collect',async m => {
						if(m.author.id==908739379059626094)return //ronibot
						if (m.content.toLowerCase() == "si") {
							await utils.claim(data,message)
						} else if (m.content.toLowerCase() == "no") {
							message.reply('Este canal se cerrara en 3 segundos.')
							setTimeout(() => { message.channel.delete()}, 3000)
						} else{
							message.channel.send("error...")
						} 
					})
				})
			}else if( customId=='cerrar_ticket'){
				const thread = interaction.channel
				thread.delete();
			}
			return
		});


	}
});

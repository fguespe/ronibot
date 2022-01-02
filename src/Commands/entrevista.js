/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageEmbed} = require('discord.js');
const QuickChart = require('quickchart-js');
const { stat } = require('fs');
var utils = require(path.resolve(__dirname, "../utils.js"));
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));

module.exports = new Command({
	name: "entrevista"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		try{
			let db = await DbConnection.Get();
			let users = await db.collection('users').find().toArray()
			for(let ii in users){
				let eluser=users[ii]
				users[ii]['mmr_sum']=0
				users[ii]['slp_sum']=0
				users[ii]['slp_prom']=0
				users[ii]['mmr_prom']=0
				users[ii]['stat_count']=0
				let stats = await db.collection('stats').find({accountAddress:eluser.accountAddress},  { sort: { cache_last_updated: -1 } }).limit(args[1]?parseInt(args[1]):7).toArray();
				stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo && anteultimo.in_game_slp!=undefined && stat.in_game_slp!=undefined){
						if(stat.in_game_slp<anteultimo.in_game_slp)users[ii]['slp_sum']+=stat.in_game_slp
						else users[ii]['slp_sum']+=stat.in_game_slp-anteultimo.in_game_slp
						users[ii]['mmr_sum']+=stat['mmr']
						users[ii]['mmr']=stat['mmr']
						users[ii]['stat_count']+=1
					}
					
					if(users[ii]['stat_count']>=7)break
				}
				
				users[ii]['slp_prom']=Math.round(users[ii]['slp_sum']/users[ii]['stat_count'])
				users[ii]['mmr_prom']=Math.round(users[ii]['mmr_sum']/users[ii]['stat_count'])

			}
			//users=users.filter(u => u.slp_prom>0 && (u.nota == null || u.nota == undefined || u.nota == 'aprobada'))
			let top=users.sort(function(a, b) {return b.slp_prom - a.slp_prom})
		
			let aprobar=''
			let evaluar=''
			let retirar=''
			
			for(let ii in top){
				let user=top[ii]
				if(user.nota && user.nota.toLowerCase().includes('entrevist')){

					if(user.name)user.name=user.name.replaceAll('*','')
					let value='#'+user.num+" [***"+user.name+"***](https://marketplace.axieinfinity.com/profile/"+user.accountAddress+") "+user.slp_prom+'('+user.mmr+')\n'
	
					if(user.slp_prom>=130)aprobar+=value
					else if(user.slp_prom>=100 && user.slp_prom<130)aprobar+=value
					else if(user.slp_prom>=90 && user.slp_prom<100)aprobar+=value
					else if(user.slp_prom>=50 && user.slp_prom<80)evaluar+=value
					else if(user.slp_prom>=0 && user.slp_prom<50)retirar+=value
				}
				
			}
			
			let embed = new MessageEmbed().setTitle("Aprobar").setDescription(aprobar).setColor('GREEN')
			message.channel.send({content: ` `,embeds: [embed]})
			embed = new MessageEmbed().setTitle("Prorroga").setDescription(evaluar).setColor('RED')
			message.channel.send({content: ` `,embeds: [embed]})
			embed = new MessageEmbed().setTitle("Retirar").setDescription(retirar).setColor('BLACK')
			message.channel.send({content: ` `,embeds: [embed]})



		}catch(e){
			utils.log(e.message,message)
		}

	}
});
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
	name: "diario"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send("You don't have the propper rights to run this command.")
		try{
			let db = await DbConnection.Get();
			let limit_prom=args[1]?parseInt(args[1]):2
			let users = await db.collection('users').find({nota:'aprobado'}).toArray()
			for(let ii in users){
				let eluser=users[ii]
				users[ii]['mmr_sum']=0
				users[ii]['slp_sum']=0
				users[ii]['slp_prom']=0
				users[ii]['mmr_prom']=0
				users[ii]['stat_count']=0

				let stats = await db.collection('slp').find({accountAddress:eluser.accountAddress},  { sort: { timestamp: -1 } }).limit(limit_prom).toArray();
				stats=stats.sort(function(a, b) {return a.timestamp - b.timestamp});
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo && anteultimo.in_game_slp!=undefined && stat.in_game_slp!=undefined){
						if(stat.in_game_slp<anteultimo.in_game_slp)users[ii]['slp_sum']+=stat.in_game_slp
						else users[ii]['slp_sum']+=stat.in_game_slp-anteultimo.in_game_slp
						
						if(stat.in_game_slp<anteultimo.in_game_slp)users[ii]['slp']=stat.in_game_slp
						else users[ii]['slp']=stat.in_game_slp-anteultimo.in_game_slp
					
						users[ii]['mmr_sum']+=stat['mmr']
						users[ii]['mmr']=stat['mmr']
						if(users[ii]['slp']>0)users[ii]['stat_count']+=1
					}
				}

				
				users[ii]['slp_prom']=Math.round(users[ii]['slp_sum']/users[ii]['stat_count'])
				users[ii]['mmr_prom']=Math.round(users[ii]['mmr_sum']/users[ii]['stat_count'])
			}

			//Top 10 SLP
			let top=users.sort(function(a, b) {return b.slp - a.slp})/*.slice(0, 10);*/
			let help=''
			for(let ii in top){
				let user=top[ii]
				help+='#'+user.num+" ***"+(user.name?user.name.replaceAll('*',''):'')+'*** '+user.slp+(user.mmr==undefined?'':'('+user.mmr+')')+'\n'
			}	
			let embed = new MessageEmbed().setTitle("Ranking general").setDescription(help).setColor('#3C5D74').setTimestamp()
			message.channel.send({content: ` `,embeds: [embed]})
			
			
			//Top 10 Copas
			top=users.sort(function(a, b) {return b.mmr - a.mmr}).slice(0, 10);
			help=''
			for(let ii in top){
				let user=top[ii]
				help+='#'+user.num+" ***"+(user.name?user.name.replaceAll('*',''):'')+'*** '+user.slp+(user.mmr==undefined?'':'('+user.mmr+')')+'\n'
			}	
			embed = new MessageEmbed().setTitle("TOP 10 COPAS").setDescription(help).setColor('#3C5D74').setTimestamp()
			message.channel.send({content: ` `,embeds: [embed]})
			
			
			//Bottom 10 SLP
			top=users.sort(function(a, b) {return b.slp - a.slp}).slice(users.length-1-10, users.length);
			help=''
			for(let ii in top){
				let user=top[ii]
				help+='#'+user.num+" ***"+user.name+'*** '+user.slp+(user.mmr==undefined?'':'('+user.mmr+')')+'\n'
			}	
			embed = new MessageEmbed().setTitle("ULTIMOS 10 SLP").setDescription(help).setColor('#574760').setTimestamp()
			message.channel.send({content: ` `,embeds: [embed]})
			
			

		}catch(e){
			utils.log(e,message)
		}

	}
});
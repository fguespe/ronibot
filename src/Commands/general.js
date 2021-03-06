/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageEmbed} = require('discord.js');
const QuickChart = require('quickchart-js');
const { stat } = require('fs');
var utils = require(path.resolve(__dirname, "../utils.js"));
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
TABULADORES={uno:60,dos:45,tres:35,cuatro:25}

module.exports = new Command({
	name: "general"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send("You don't have the propper rights to run this command.")
		try{
			let db = await DbConnection.Get();
			let query={$or:[{nota:'aprobado'},{nota:'pro'},{nota:'fijo'}]}
			if(args[1])query={nota:args[1]}
			let users = await db.collection('users').find(query).toArray()
			let data_users=[]
			//let limit_prom=args[1]?parseInt(args[1]):30
			let count_users=0
			for(let ii in users){
				let eluser=users[ii]				
				let stats = await db.collection('slp').find({accountAddress:eluser.accountAddress},  { sort: { timestamp: -1 } })./*limit(limit_prom).*/toArray();
				stats=stats.sort(function(a, b) {return a.timestamp - b.timestamp});
				
				let data=[]
				//if(stats.length>=limit_prom)
				count_users++
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo && anteultimo.in_game_slp!=undefined && stat.in_game_slp!=undefined){//esto es importante para las starts
						if(stat.in_game_slp<anteultimo.in_game_slp)stat['slp']=stat.in_game_slp
						else stat['slp']=stat.in_game_slp-anteultimo.in_game_slp
						if(stat['mmr']!=1200 && (stat['slp']==0 || stat['slp']==null || stat['slp']==undefined))continue
						data.push({timestamp:stat.timestamp,date:utils.getDayName(stat.date, "es-ES"),slp:stat['slp'],mmr:stat['mmr']})//esto mete a todos
							
					}
				}
				//if(stats[stats.length-1] && stats[stats.length-2] && stats[stats.length-1].in_game_slp>0 && stats[stats.length-2].in_game_slp>0)count_users++
				data_users.push(data)
			}

			let data_por_dia=[]
			for(let i in data_users){
				let dias_del_user=data_users[i]
				for(let j in dias_del_user){
					let undia=dias_del_user[j]
					let fecha=undia.date
					if(!data_por_dia[fecha])data_por_dia[fecha]={date:undia.date,timestamp:undia.timestamp,slp:0,players:0,mmr:0,grupo1:0,grupo2:0,grupo3:0,grupo4:0,grupo5:0}
					data_por_dia[fecha]={date:undia.date,timestamp:undia.timestamp,players:data_por_dia[fecha].players+(undia.slp>0?1:0),slp:data_por_dia[fecha].slp+=undia.slp,mmr:data_por_dia[fecha].mmr+=undia.mmr,grupo1:data_por_dia[fecha].grupo1+(undia.slp>0 && undia.slp<=TABULADORES.cuatro?1:0),grupo2:data_por_dia[fecha].grupo2+(undia.slp<TABULADORES.tres && undia.slp>=TABULADORES.cuatro?1:0),grupo3:data_por_dia[fecha].grupo3+(undia.slp<TABULADORES.dos && undia.slp>=TABULADORES.tres?1:0),grupo4:data_por_dia[fecha].grupo4+(undia.slp<TABULADORES.uno && undia.slp>=TABULADORES.dos?1:0),grupo5:data_por_dia[fecha].grupo5+(undia.slp>=TABULADORES.uno?1:0)}
				}
			}
			data_por_dia=Object.values(data_por_dia)
			data_por_dia=data_por_dia.sort(function(a, b) {return a.timestamp - b.timestamp});

			let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
			let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
			
			let chart_data={days:[],slp:[],mmr:[],prom_slp:[],prom_mmr:[],usd:[],players:[],grupo1:[],grupo2:[],grupo3:[],grupo4:[],grupo5:[]}
			for(let i in data_por_dia){
				console.log(data_por_dia[i].slp)
				chart_data.days.push(data_por_dia[i].date)
				chart_data.players.push(data_por_dia[i].players)
				chart_data.grupo1.push(data_por_dia[i].grupo1)
				chart_data.grupo2.push(data_por_dia[i].grupo2)
				chart_data.grupo3.push(data_por_dia[i].grupo3)
				chart_data.grupo4.push(data_por_dia[i].grupo4)
				chart_data.grupo5.push(data_por_dia[i].grupo5)
				chart_data.slp.push(data_por_dia[i].slp)
				chart_data.mmr.push(data_por_dia[i].mmr)
				chart_data.usd.push(data_por_dia[i].slp*slp_price)
				chart_data.prom_slp.push(data_por_dia[i].slp/count_users)
				chart_data.prom_mmr.push(data_por_dia[i].mmr/count_users)
			}

			
			let chart = ''
			
			chart=new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[
						{type: 'bar',"yAxisID": "y1",label: '0 > < 25', data: chart_data.grupo1,"fill": false,backgroundColor: 'black'},
						{type: 'bar',"yAxisID": "y1",label: '25 > < 35', data: chart_data.grupo2,"fill": false,backgroundColor: '#D55040'},
						{type: 'bar',"yAxisID": "y1",label: '35 > < 45', data: chart_data.grupo3,"fill": false,backgroundColor: '#F8D978'},
						{type: 'bar',"yAxisID": "y1",label: '45 > < 60', data: chart_data.grupo4,"fill": false,backgroundColor: 'ORANGE'},
						{type: 'bar',"yAxisID": "y1",label: '60 > < ...', data: chart_data.grupo5,"fill": false,backgroundColor: '#9EC284'}
					] 
				},
				"options": {"scales": {"xAxes": [{"stacked": true}],"yAxes": [	{"id": "y1","display": true,"position": "left","stacked": true}]}
				}
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
			
			
			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'usd-day', data: chart_data.usd,backgroundColor: '#9EC284'}] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
		
			
			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'slp-day', data: chart_data.slp,backgroundColor: '#F8D978'}] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);

			
			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'slp-prom', data: chart_data.prom_slp,backgroundColor: '#5E9DF8'}] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);

			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'copas-prom', data: chart_data.prom_mmr,backgroundColor: '#5E9DF8'}] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
	

		}catch(e){
			utils.log(e,message)
		}

	}
});

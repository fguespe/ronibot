/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageEmbed} = require('discord.js');
const QuickChart = require('quickchart-js');
const { stat } = require('fs');
const { type } = require('os');
var utils = require(path.resolve(__dirname, "../utils.js"));
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));

module.exports = new Command({
	name: "log"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		let db = await DbConnection.Get();
			
		if(args[1]=='pagos'){
			let query=args[2]?{type:args[2]}:{$or:[{type:'slp_jugador'},{type:'slp_ronimate'}]}
			let stats = await db.collection('log').find(query,  { sort: { timestamp: -1 } }).toArray();
			let data_por_dia=[]
			
			let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
			let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});

			for(let i in stats){
				let undia=stats[i]
				let fecha=utils.getPaymentName(undia.date)
				if(!data_por_dia[fecha])data_por_dia[fecha]={}
				if(!data_por_dia[fecha][undia.type])data_por_dia[fecha][undia.type]={date:fecha,slp:0,cant:0}
				data_por_dia[fecha][undia.type]={type:undia.type,date:fecha,slp:data_por_dia[fecha][undia.type].slp+=undia.slp,cant:data_por_dia[fecha][undia.type].cant+=1}
			}
			let texto=''
			for(let i in data_por_dia){
				for(let j in data_por_dia[i]){
					let data=data_por_dia[i][j]
					texto+='El pago '+data.date+' se realizaron '+data.cant+' pagos por un total de '+data.slp+' SLP a '+data.type +'\n'
				}
			}

			let embed = new MessageEmbed().setTitle('Reporte').setDescription(texto).setColor('GREEN').setTimestamp()
			message.channel.send({content: ` `,embeds: [embed]})
			texto=''
			for(let i in data_por_dia){
				for(let j in data_por_dia[i]){
					let data=data_por_dia[i][j]
					if(data.type=='slp_jugador'){
						texto+=''+data.date+': !pagar '+Math.round(data.slp*0.06)+' amaloa ('+Math.round(data.slp*0.06*slp_price)+'USD)\n'
						texto+=''+data.date+': !pagar '+Math.round(data.slp*0.02)+' pablo ('+Math.round(data.slp*0.02*slp_price)+'USD)\n'
					}
				}
			}
			/*
			//PAGOS RONIMATE
pslp==0.028  = 0.028
pvis=0.086 = 0.086

cuenta1=1089 = 1 089
cuenta2=529 = 529
axie=(cuenta1 + cuenta2)*pslp = 45.304
vis=924*pvis  = 79.464
ronimate=556*pslp  = 15.568
pablo=150-vis-ronimate-axie  = 9.664


cuenta=350*pslp = 9.8
ronimate=1697*pslp = 47.516
vis=500*pvis = 43
amaloa=150-vis-ronimate-axie  = 14.18

*/
			
			embed = new MessageEmbed().setTitle('Managment').setDescription(texto).setColor('GREEN').setTimestamp()
			message.channel.send({content: ` `,embeds: [embed]})

			texto='!pagar '+Math.round(80/slp_price)+' jeisson\n'
			embed = new MessageEmbed().setTitle('Jeisson').setDescription(texto).setColor('GREEN').setTimestamp()
			message.channel.send({content: ` `,embeds: [embed]})
			
			

		}else if(args[1]=='estados'){
			let query={type:'status_change'}
			let stats = await db.collection('log').find(query,  { sort: { timestamp: 1 } }).toArray();
		
			let data_por_dia=[]
			for(let i in stats){
				let undia=stats[i]
				let fecha=undia.date
				if(!data_por_dia[fecha])data_por_dia[fecha]={fecha:fecha,aprobado:0,aspirante:0,entrevista:0,retiro:0}
				if(undia.status=='aprobado')data_por_dia[fecha]={fecha:fecha,aprobado:data_por_dia[fecha].aprobado+=1,entrevista:data_por_dia[fecha].entrevista,retiro:data_por_dia[fecha].retiro,aspirante:data_por_dia[fecha].aspirante,}
				if(undia.status=='retiro')data_por_dia[fecha]={fecha:fecha,retiro:data_por_dia[fecha].retiro+=1,entrevista:data_por_dia[fecha].entrevista,aprobado:data_por_dia[fecha].aprobado,aspirante:data_por_dia[fecha].aspirante,}
				if(undia.status=='entrevista')data_por_dia[fecha]={fecha:fecha,entrevista:data_por_dia[fecha].entrevista+=1,aprobado:data_por_dia[fecha].aprobado,retiro:data_por_dia[fecha].retiro,aspirante:data_por_dia[fecha].aspirante,}
				if(undia.status=='aspirante')data_por_dia[fecha]={fecha:fecha,aspirante:data_por_dia[fecha].aspirante+=1,aprobado:data_por_dia[fecha].aprobado,retiro:data_por_dia[fecha].retiro,entrevista:data_por_dia[fecha].entrevista,}
			}
			
			let chart_data={days:[],aprobado:[],entrevista:[],retiro:[],aspirante:[]}
			for(let i in data_por_dia){
				let data=data_por_dia[i]

				chart_data.days.push(data.fecha)
				chart_data.aprobado.push(data.aprobado)
				chart_data.entrevista.push(data.entrevista)
				chart_data.aspirante.push(data.aspirante)
				chart_data.retiro.push(data.retiro)
			}

			let chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[
						{label: 'Aspirante',backgroundColor:'#6F9CF1',  data: chart_data.aspirante},
						{label: 'Entrevista', backgroundColor: '#F8D978', data: chart_data.entrevista},
						{label: 'Aprobado', backgroundColor: '#9EC284', data: chart_data.aprobado},
						{label: 'Retiro',backgroundColor: 'black', data: chart_data.retiro},
					] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
		
		}else if(args[1]=='aspirante'){
			await utils.cambiarEstado(null,null,'aspirante',message)
            let rCanal = message.guild.channels.cache.find(c => c.id == 903282885971300362);//canal chat managers
            rCanal.send("Se agrego un nuevo ***aspirante***")
			
			let ingreso=await utils.getUserIDByUsername(args[2],message)

			rCanal = message.guild.channels.cache.find(c => c.id == 909165024642203658);//canal entrevistas
			let embed = new MessageEmbed().setTitle('Nuevo Aspirante!').setDescription("<@"+ingreso.id+"> confirmar que estas presente para recibir una beca.").setColor('GREEN').setTimestamp()
			rCanal.send({content: ` `,embeds: [embed]})
		}

	}
});

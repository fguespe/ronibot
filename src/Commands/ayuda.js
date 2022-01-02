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
	name: "ayuda"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		let help=""
		help+="!roni para poder validarte y realizar cobros\n\n"
		if(utils.esManager(message)){
			help+="!reporte XX para ver info del jugador\n\n"
			help+="!cambio AXIE_ID DESDE_XX HASTA_XX para transferir axies\n\n"
			help+="!update XX FIELD VALUE para actualizar (nota,wallet,name)\n\n"
			help+="!ranking para traer los 10 mejores\n\n"
			help+="!pablo para un reporte completo\n\n"
			help+="!general para ver el estado de la academia\n\n"
		}else if(utils.esFabri(message)){
			help+="!retiro DESDE_XX HASTA_XX para transferir todos los axies\n\n"
			help+="!aprobar XX para aprobar una entrevista\n\n"
			help+="!claim ID,ID claimea multiples cuentas\n\n"
			help+="!flush ID,ID retira slp multiples cuentas\n\n"
			help+="!pagar SLP DE HASTA para hacer un pago normal\n\n"
		}
		let embed = new MessageEmbed().setTitle('Comandos').setDescription(help).setColor('GREEN').setTimestamp()
		return message.channel.send({content: ` `,embeds: [embed]})
		
	}
});

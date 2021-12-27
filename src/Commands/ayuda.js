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
	name: "ayuda",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		let help=""
		if(utils.esManager(message))help+="!reporte XX para ver info del jugador\n\n"
		if(utils.esManager(message))help+="!cambio AXIE_ID DESDE_XX HASTA_XX para transferir axies\n\n"
		if(utils.esFabri(message))help+="!retiro DESDE_XX HASTA_XX para transferir todos los axies\n\n"
		if(utils.esFabri(message))help+="!aprobar XX NAME para aprobar una entrevista\n\n"
		if(utils.esFabri(message))help+="!ranking para traer los 10 mejores\n\n"
		if(utils.esFabri(message))help+="!recupero para traer los 10 peores\n\n"
		if(utils.esFabri(message))help+="!general para ver el estado de la academia\n\n"
		if(utils.esFabri(message))help+="!flush ID,ID para retirar cuentas y su slp\n\n"
		if(utils.esFabri(message))help+="!update XX FIELD VALUE para actualizar (nota,ScholarPayoutAddress)\n\n"
		help+="!roni para poder validarte y realizar cobros\n\n"
		let embed = new MessageEmbed().setTitle('Comandos').setDescription(help).setColor('GREEN').setTimestamp()
		return message.channel.send({content: ` `,embeds: [embed]})
		
	}
});

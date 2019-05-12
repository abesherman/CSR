const discord = require('discord.js');
class CSRSystem {
	/**
	 *
	 * @param {discord.Client} client
	 */
	constructor(client) {
		this.client = client;
	}
	/**
	 *
	 * @readonly
	 * @returns {Map<string,discord.TextChannel}
	 */
	get channels() {
		const chs = new Map();
		this.client.guilds.forEach(guild => {
			const channel = guild.channels.find(
				x => x.type == 'text' && x.name == 'irc'
			);
			if (channel) {
				chs.set(guild.id, channel);
			}
		});
		return chs;
	}
	/**
	 *
	 * @readonly
	 * @returns {Map<string,discord.TextChannel}
	 */
	get privateChannels() {
		const channels = new Map();
		this.client.guilds.forEach(guild => {
			const pch = guild.channels.find(
				x => x.type == 'text' && x.name == 'privateirc'
			);
			if (pch) {
				channels.set(guild.id, pch);
			}
		});
		return channels;
	}
	/**
	 *
	 * @param {discord.Guild} guild
	 * @returns {discord.TextChannel}
	 */
	getChannel(guild) {
		const channels = this.channels;
		return channels.get(guild.id);
	}
	/**
	 *
	 * @param {discord.Guild} guild
	 * @returns {discord.TextChannel}
	 */
	getPrivateChannel(guild) {
		const channels = this.privateChannels;
		return channels.get(guild.id);
	}
	/**
	 *
	 * @param {string|discord.RichEmbed} message
	 * @param {{ignoreGuilds:string[]}} param1
	 */
	sendAll(message, { ignoreGuilds = [] } = { ignoreGuilds:[] }) {
		const channels = this.channels;
		channels.forEach(ch => {
			if (ignoreGuilds.length && ignoreGuilds.includes(ch.guild.id)) {
				return;
			}
			ch.send(message).catch(e => {
				console.log('error sending message in sendAll:\n' + e);
			});
		});
	}
	/**
	 * @param {string|discord.RichEmbed} message
	 */
	sendAllPrivate(message) {
		const channels = this.privateChannels;
		channels.forEach(ch => {
			ch.send(message).catch(e => {
				console.log('error sending message in sendAll:\n' + e);
			});
		});
	}
	/**
	 *
	 * @param {discord.Guild} guild
	 * @returns {Map<string,discord.TextChannel}
	 */
	getMatchingPrivate(guild) {
		const channels = new Map();
		const channel = this.getPrivateChannel(guild);
		if (!channel || !channel.topic || channel.topic == '') {
			return;
		}
		const channelsToMatch = this.privateChannels;
		channelsToMatch.forEach((ch, chGuild) => {
			if (!ch || !ch.topic || ch.topic === '') {
				return;
			}
			if (ch.topic === channel.topic) {
				channels.set(chGuild, ch);
			}
		});
		return channels;
	}
	/**
	 *
	 * @param {string|discord.RichEmbed} message
	 * @param {discord.guild} guild
	 */
	sendPrivate(message, guild) {
		const channel = this.getPrivateChannel(guild);
		if (!channel || !channel.topic || channel.topic === '') {
			return;
		}
		const channels = this.getMatchingPrivate(guild);
		channels.forEach(ch => {
			ch.send(message).catch(e => {
				console.log(e);
				if (e.message == 'Unknown Channel') {
					// cachePrivateChannels();
				}
			});
		});
	}
}

module.exports = CSRSystem;

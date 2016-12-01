'use strict';

const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;
const TelegramBaseInlineQueryController = Telegram.TelegramBaseInlineQueryController;
const config = require(__dirname + '/config.json');
const tg = new Telegram.Telegram(config.apiKey);

class StartController extends TelegramBaseController {
	get routes()
	{
		return {
			'start': 'startHandler'
		}
	}

	startHandler(scope)
	{
		console.log('handle start');
		scope.sendMessage('PizzaBot activated');
	}
}

class PizzaController extends TelegramBaseController {
	get routes()
	{
		return {
			'pizza': 'pizzaHandler'
		}
	}

	pizzaHandler(scope)
	{
		var today = new Date();
		var date = today.getDate() + "." + (today.getMonth() + 1) + "." + today.getFullYear();

		if (scope.chatSession[date] !== undefined)
		{
			if (scope.chatSession[date].questionMessage !== undefined)
			{
				scope.sendMessage("Für heute gibts schon eine Pizza-Umfrage", {
					reply_to_message_id: scope.chatSession[date].questionMessage.messageId
				});
			}
			else
			{
				scope.sendMessage("Für heute gibts schon eine Pizza-Umfrage");
			}
			return;
		}

		scope.chatSession[date] = {
			votes: [
				scope.message.from
			]
		};
		scope.runInlineMenu({
			layout: 2,
			method: 'sendMessage',
			params: [scope.message.from.firstName + ' will Pizza, wer will noch?'],
			menu: [
				{
					text: 'Ich will auch',
					callback: (callbackQuery, message) =>
					{
						var user = callbackQuery.from;
						scope.chatSession[date].questionMessage = message;
						if (scope.chatSession[date].votes.find(function (elem)
							{
								return user.id == elem.id;
							})
						)
						{
							return;
						}
						scope.chatSession[date].votes.push(callbackQuery.from);

						if (scope.chatSession[date].message !== undefined)
						{
							var params = {
								chat_id: scope.chatSession[date].message.chat.id,
								message_id: scope.chatSession[date].message.messageId
							};
							scope._api.editMessageText('Folgende Personen wollen Pizza:\n' + scope.chatSession[date].votes.map(user=>
								{
									return user.firstName
								}).join(', '), params);
						}
						else
						{
							scope.sendMessage("Folgende Personen wollen Pizza:\n" + scope.chatSession[date].votes.map(user=>
								{
									return user.firstName
								}).join(', ')).then(function (message)
							{
								scope.chatSession[date].message = message;
							});
						}
					}
				}
			]
		});
	}
}

tg.router
	.when(['start'], new StartController())
	.when(['pizza'], new PizzaController())
;

console.log('Started Telegram Bot');
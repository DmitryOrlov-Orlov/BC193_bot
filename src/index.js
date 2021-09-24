const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const helper = require('./helper');
const debug = require('./debug');

helper.logStart();
const bot = new TelegramBot(config.TOKEN, {
  polling: true
});

const inline_keyboard = [
  [
    {
      text: 'Заявка Секретарю',
      callback_data: 'Secretary'
    },
    {
      text: 'Заявка Директору',
      callback_data: 'Director'
    }
  ]
]

const messagePrivetstvie = 'Добрый день! Кому Вы хотите отправить заявку?';
const messageObratnSvajz = 'Теперь напишите и отправьте свое обращение (для обратной связи не забудьте указать номер офиса, ФИО и контактный номер телефона).';
let flagDirector = false;
let flagSecretary = false;

bot.onText(/\/start/, msg => {
  console.log('команда start');
  flagDirector = false;
  flagSecretary = false;
  bot.sendMessage(msg.chat.id, messagePrivetstvie, {
    reply_markup: {
      inline_keyboard
    }
  });
})

bot.on('callback_query', query => {
  //bot.sendMessage(query.message.chat.id, query.data);
  flagDirector = true ? query.data === 'Director' : false;
  flagSecretary = true ? query.data === 'Secretary' : false;
  if (flagDirector || flagSecretary) {
    bot.sendMessage(query.message.chat.id, messageObratnSvajz);
  }
})

bot.on('message', msg => {
  if (msg.text === '/start') {
    return false;
  }

  if (flagDirector) {
    bot.sendMessage(config.DIRECTOR, `#заявка\nВам прислал(а) сообщение - "${msg.from.first_name}" (имя взято из настроек пользователя). \n\n***\n${msg.text}\n***`);
    bot.sendMessage(msg.chat.id, 'Отлично, Ваше обращение отправлено директору.');
    flagDirector = false;
  }
  else if (flagSecretary) {
    bot.sendMessage(config.SECRETARY, `#заявка\nВам прислал(а) сообщение - "${msg.from.first_name}" (имя взято из настроек пользователя). \n\n***\n${msg.text}\n***`);
    bot.sendMessage(msg.chat.id, 'Отлично, Ваше обращение отправлено секретарю.');
    flagSecretary = false;
  }
  else {
    const randomMessage = () => {
      bot.sendMessage(msg.chat.id, messagePrivetstvie, {
        reply_markup: {
          inline_keyboard
        }
      });
    }
    msg.text === '/start' ? false : randomMessage();
  }
})

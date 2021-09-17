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
      text: 'Заявка, Секретарю',
      callback_data: 'Secretary'
    },
    {
      text: 'Заявка, Директору',
      callback_data: 'Director'
    }
  ]
]

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, 'Привет, кому Вы хотите отправить заявку?', {
    reply_markup: {
      inline_keyboard
    }
  });
})

let flagDirector = false;
let flagSecretary = false;

bot.on('callback_query', query => {
  //bot.sendMessage(query.message.chat.id, query.data);
  flagDirector = true ? query.data === 'Director' : false;
  flagSecretary = true ? query.data === 'Secretary' : false;
  if (flagDirector || flagSecretary) {
    bot.sendMessage(query.message.chat.id, "Ок, теперь напишите и отправьте свое обращение. (Для обратной связи не забудьте указать своё ФИО и номер телефона)");
  }
  console.log(debug(query));
})

bot.on('message', msg => {
  if (flagDirector) {
    bot.sendMessage(config.DIRECTOR, msg.text);
    bot.sendMessage(msg.chat.id, 'Отлично, Ваше обращение отправлено директору.');
    flagDirector = false;
  }
  else if (flagSecretary) {
    bot.sendMessage(config.RUS, msg.text);
    bot.sendMessage(msg.chat.id, 'Отлично, Ваше обращение отправлено секретарю.');
    flagSecretary = false;
  }
  else {
    const randomMessage = () => {
      bot.sendMessage(msg.chat.id, 'Привет, кому Вы хотите отправить заявку? (Для обратной связи не забудьте указать своё ФИО и номер телефона) (если в тупую присылают сообщения)', {
        reply_markup: {
          inline_keyboard
        }
      });
    }
    msg.text === '/start' ? false : randomMessage();
  }
})

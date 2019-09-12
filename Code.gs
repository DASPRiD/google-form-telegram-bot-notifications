/**
 * @OnlyCurrentDoc
 */

// [START apps_script_forms_telegram_bot_notifications]

function onOpen(e) {
  FormApp.getUi()
      .createAddonMenu()
      .addItem('Configure notifications', 'showSidebar')
      .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('Telegram Bot Notifications');
  FormApp.getUi().showSidebar(ui);
}

function saveSettings(settings) {
  PropertiesService.getDocumentProperties().setProperties(settings);
  adjustFormSubmitTrigger();
}

function getSettings() {
  return PropertiesService.getDocumentProperties().getProperties();
}

function adjustFormSubmitTrigger() {
  var form = FormApp.getActiveForm();
  var triggers = ScriptApp.getUserTriggers(form);

  var existingTrigger = null;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getEventType() == ScriptApp.EventType.ON_FORM_SUBMIT) {
      existingTrigger = triggers[i];
      break;
    }
  }
  if (!existingTrigger) {
    var trigger = ScriptApp.newTrigger('respondToFormSubmit')
        .forForm(form)
        .onFormSubmit()
        .create();
  }
}

function respondToFormSubmit(e) {
  var settings = PropertiesService.getDocumentProperties();
  var form = FormApp.getActiveForm();
  var responses = e.response.getItemResponses();
  var message = settings.getProperty('message');
  var botApiToken = settings.getProperty('botApiToken');
  var chatId = settings.getProperty('chatId');
  
  if (botApiToken === '' || chatId === '') {
    return;
  }
  
  for (var i = 0; i < responses.length; i++) {
    var response = responses[i];
    var name = response.getItem().getTitle();
    var value = response.getResponse();
    var search = ('{' + name + '}').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    message = message.replace(new RegExp(search, 'g'), value);
  }
  
  var url = 'https://api.telegram.org/bot' + botApiToken
    + '/sendMessage?chat_id=' + chatId
    + '&text=' + encodeURIComponent(message)
  UrlFetchApp.fetch(url);
}

// [END apps_script_forms_telegram_bot_notifications]


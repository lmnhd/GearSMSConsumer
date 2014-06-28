//class="alum"
var REMOTE_DETACHED = true;

var TRYING_TO_SEND = false;
var CONTACTS;
var INBOX;
var CURRENT_CONTACT = {};
var CURRENT_NUMBER = 0;
var MESSAGE_MODE = false;
var NEW_MESSAGES = new Array();
var IS_REPLY = true;
var CURRENT_DIGIT = 0;
var LAST_DIGIT = -1;
var LETTER_CIPHER = 0;
var FLAG_GET_PHONE_NUMBER_MODE = false;

var MESSAGE = "";
var FINAL_MESSAGE = "";
var CHAR_ARRAY = new Array();
var CHAR_NUM = 0;

var last_click_time = 0;
var this_click_time = 0;
var CURSOR_POSITION = 0;
var LAST_CHAR_EMPTY = false;

var AUTO_SCROLLING = false;

var last_time_check = 0;
var timer = 0;
var AUTO_ADVANCED = false;
var LAST_PRESS_WAS_POUND = false;
var TEMP_DISABLE_KEYS = false;
var CHARACTER_MODE = 1;
var LOCK_NUMBERS = false;
var FLAG_START_AUTOSCROLL = false;
var MESSAGE_END_POSITION = 0;

var KEYS_CLASS = '.keys2';
var DISPLAY_CLASS = '.display2';
var caps_switched = false;
var LONGPRESS = false;
var reset = false;
var downstamp = 0;
//0:no caps
//1:capnexttletter
//2:lockcaps
var CAPS = 0;

var message_ready = false;

var popup_open = false;

var toast_timeout = 0;
function toastAlert(msg,secondsToClose) {
	clearTimeout(toast_timeout);
	$('#popupToastMsg').empty();
	$('#popupToastMsg').append(msg);
	gear.ui.openPopup($('#popupToast'));
	$('#popupToast').show();
	console.log(msg);
	popup_open = true;
	
	if(secondsToClose){
		if(secondsToClose > 0){
			toast_timeout = setTimeout(function(){
				closePopup();
			}, secondsToClose*1000)
		}
	}
	
}
function initialize() {
	sapInit(sapinitsuccesscb, function(err) {
		console.log(err.name);
		if (err.name == "PEER_DISCONNECTED") {
			toastAlert(err.message,5);
			REMOTE_DETACHED = true;
			//alert(err.message);
			backToList();
			
		} else {
			toastAlert('Failed to connect to service',5);
			REMOTE_DETACHED = true;
			//alert(err.message);
			backToList();
		}
		
	},onNewMessageRecieved,onSentMessageResult);
}
function resetMessage(functionCalling){
	var calling = ""
	if(functionCalling){
		calling = functionCalling
	}
	closePopup();
	CHAR_ARRAY = new Array();
	CHAR_NUM = 0;
	last_click_time = 0;
	last_time_check = 0;
	message_ready = false;
	SwitchCharacterMode(1);
	MESSAGE_MODE = false;
	TRYING_TO_SEND = false;
	if(!calling == "showKepad"){
		TEMP_DISABLE_KEYS = false;
	}
	
	//CURRENT_NUMBER = 0;
	//CURRENT_CONTACT = {};
	CURRENT_DIGIT = 0;
	LAST_DIGIT = -1;
	LETTER_CIPHER = 0;
	AUTO_ADVANCED = false;
	clearTimeout(SCROLL_TIMER);
	AUTO_SCROLLING = false;
	LAST_PRESS_WAS_POUND = false;
	FLAG_GET_PHONE_NUMBER_MODE = false;
	MESSAGE = "";
	FINAL_MESSAGE = "";
	CURSOR_POSITION = 0;
	LAST_CHAR_EMPTY = false;
	LONGPRESS = false;
	IS_REPLY = false;
	LOCK_NUMBERS = false;
	$(DISPLAY_CLASS).text('');
	$(DISPLAY_CLASS).css('margin-left',0);
	//appendCharacterToMessage(getCurrentPressedChar('pound'));

}
function backToList(toastMessage,reset){
	MESSAGE_MODE = false;
	TEMP_DISABLE_KEYS = false;
	$(DISPLAY_CLASS).css('margin-left',0);
	$('#keypad').hide();
	$('#confirm').hide();
	$('#contacts').hide()
	$('#contacts-page').hide();
	$('#new-messages').hide();
	$('#new-message').hide();
	$('#main').show();
	
	$('div').removeClass('ui-page-active');
	
	
	$('#main').addClass('ui-page-active');
	resetDisplayMargin();
	CHARACTER_MODE = 1;
	CURRENT_NUMBER = 0;
	CURRENT_CONTACT = null;
	
	if(reset){
		resetMessage();
	}
	
	if(toastMessage){
		toastAlert(toastMessage,5);
	}
	
	updateNewMessageLI();
}
function resetDisplayMargin(){
	clearTimeout(SCROLL_TIMER);
	AUTO_SCROLLING = false;
	var margin = $(DISPLAY_CLASS).css('margin-left');
	margin = S(margin).replaceAll('px','');
	var ml = Number(margin);
	if(!isNaN(ml)) {
		if(ml != 0){
			$(DISPLAY_CLASS).css('margin-left',0);
			
		}
		return true;
	}
	return false;
	
}
function showKepad(keyMode){
	MESSAGE_MODE = true;
	closePopup();
	if(!CONTACTS && keyMode == 1){
		toastAlert("No Contacts Found.",5)
		backToList();
		return;
	}
	if(resetDisplayMargin()){
		
		$(DISPLAY_CLASS).css('margin-left',0);
		$('#main').hide();
		$('#contacts-page').hide();
		$('#confirm').hide();
		$('#new-messages').hide();
		$('#new-message').hide();
		$('#keypad').show();
		$('.ui-page').removeClass('ui-page-active');
		$('#keypad').addClass('ui-page-active');
		if(keyMode){
			if(keyMode == 3){
				resetMessage();
				//$(DISPLAY_CLASS).css('margin-left',0);
				
				FLAG_GET_PHONE_NUMBER_MODE = true;
				IS_REPLY = false;
			}else if(keyMode == 1){
				var reply = IS_REPLY;
				resetMessage("showKepad");
				IS_REPLY = reply;
				//$(DISPLAY_CLASS).css('margin-left',0);
//				if(!FLAG_GET_PHONE_NUMBER_MODE == true){
//					IS_REPLY = false;
//				}
				FLAG_GET_PHONE_NUMBER_MODE = false;
				
			}
			//resetDisplayMargin();
			SwitchCharacterMode(keyMode,keyMode == 3);
			
		}else{
			FLAG_GET_PHONE_NUMBER_MODE = false;
			SwitchCharacterMode(1, false);
		}
	}
	
	
}

function showContacts(get){
	MESSAGE_MODE = false;
	if(!CONTACTS){
		if(get){
			
			getContacts(true);
			
		
		}
		
		return;
	}
	TEMP_DISABLE_KEYS = true;
	
	resetDisplayMargin();
	$('#main').hide();
	$('#keypad').hide();
	$('#confirm').hide();
	$('#new-messages').hide();
	$('#new-message').hide();
	$('#contacts-page').show();
	$('#contacts').show();
	$('.ui-page').removeClass('ui-page-active');
	$('#contacts-page').addClass('ui-page-active');
}

function showConfirmationPage(){
	MESSAGE_MODE = false;
	if(!CONTACTS && !FLAG_GET_PHONE_NUMBER_MODE){
		alert("No Contacts Found.")
		backToList();
	}
	resetDisplayMargin();
	$('#main').hide();
	$('#keypad').hide();
	$('#contacts-page').hide();
	
	$('#new-messages').hide();
	$('#new-message').hide();
	
	$('#confirm').show();
	$('.ui-page').removeClass('ui-page-active');
	$('#confirm').addClass('ui-page-active');
}

function showNewMessage(message,nextindex){
	if(NEW_MESSAGES.length < 2){
		$('#next-message').hide();
	}else{
		$('#next-message').show();
	}
	if(isNaN(message.address)){
		$('#reply').hide();
	}else{
		$('#reply').show();
	}
	var header = message.date + " - " + message.address;
//	if(message.name != ""){
//		header = message.address + " - " + message.date;
//	}
	$('#from-header span').text(header);
	if(message.photo != ""){
		$('#new-message-img').attr('src','data:image/jpeg;base64,' + message.photo )
	}else{
		$('#new-message-img').attr('src="/Images/no-photo.jpg"')
	}
	
	$('#new-message-address').attr('data-address', message.address);
	$('#new-message-body').text(message.body);
	$('#new-message').attr('data-next',nextindex)
	$('#new-message-h2').text('From:' + message.name != "" ? message.name : message.address);
	
	
	
	$('#main').hide();
	$('#keypad').hide();
	$('#contacts-page').hide();
	$('#confirm').hide();
	$('#new-messages').hide();
	$('#new-message').show();
	
	$('.ui-page').removeClass('ui-page-active');
	$('#new-message').addClass('ui-page-active');
	resetDisplayMargin();
	
}
function updateMessageRead(index){
	NEW_MESSAGES[index].read = "true";
	var msg = NEW_MESSAGES[index];
	var reqData = {
			'msgId' : "update_message_read",
			'body' : msg.body,
			'address' : msg.address,
			'timestamp' : msg.timestamp,
			'subject' : msg.subject,
			'threadID' : msg.threadID,
			'seen' : 'true',
			'photo' : msg.photo,
			'name' : msg.name,
			'date' : msg.date,
			'type' : ''
	}
	
	sapRequest(reqData, function(respData) {
		
	}, function(error){
		//toastAlert("Socket error...",10);
	})
}
$('#next-message').click(function(e) {
	var index = Number($(this).parent().parent().attr('data-next'));
	if(!isNaN(index)){
		updateMessageRead(index);
		var message = NEW_MESSAGES[index];
		var newindex = index+1;
		if(newindex == NEW_MESSAGES.length){
			newindex = 0;
		}
		showNewMessage(message, newindex )
	}
})
$('#reply').click(function(e){
	var number = Number($('#new-message-address').attr('data-address'));
	if(!isNaN(number)){
		resetMessage();
		CURRENT_NUMBER = number;
		CURRENT_CONTACT = null;
		IS_REPLY = true;
		showKepad(1);
	}
})
function showNewMessages(){
	if(NEW_MESSAGES){
		if(NEW_MESSAGES.length == 1){
			updateMessageRead(0);
			showNewMessage(NEW_MESSAGES [0],0);
			return;
		}
		
		if(NEW_MESSAGES.length > 1){
			
			
			
			$('#new-message-list').empty();
			for(var i = 0; i < NEW_MESSAGES.length; i++){
				var image = NEW_MESSAGES[i].photo;
				var photoEl = '<img class="new-message-image" src="/Images/no-photo.jpg" width="50" height="50" />';
				if(image != ""){
					var photoEl = '<img class="new-message-image" src="data:image/jpeg;base64,' + image + '" width="50" height="50"/>'
				}
					
				
				
				
				
				var message = NEW_MESSAGES[i];
				
				
				var cls = 'class="message-item titanium"';
				if(message.read == "false"){
					cls = 'class="message-item not-read"'
				}
				
				var li = '<li ' + cls + ' id="new-message' + i +
				 '" data-index="' + i +  '" data-address="' + message.address + '">' +
				 photoEl +
				 '<h4>' + message.date + '</h4>'+
				'<h2><span>' + message.name + '</span> : ' + message.address + '</h2>' +
				
				'<p>' + message.body + '</p></li>' ;
				$(li).data('index', i);
				$('#new-message-list').append(li);
				
				
				
//				$(li).click(function(e) {
//					e.preventDefault();
//					e.stopImmediatePropagation();
//					showNewMessage(message,i == NEW_MESSAGES.length - 1 ? 0 : i + 1);
//				})
			}
			$('#new-message-list').children().each(function(){
				$(this).click(function(e){
					e.preventDefault();
					e.stopImmediatePropagation();
					var index = Number($(this).attr('data-index'));
					updateMessageRead(index);
					var message = NEW_MESSAGES[index];
					var newindex = index+1;
					if(newindex == NEW_MESSAGES.length){
						newindex = 0;
					}
					showNewMessage(message, newindex);
				})
			})
			
			$('#main').hide();
			$('#keypad').hide();
			$('#contacts-page').hide();
			$('#confirm').hide();
			$('#new-messages').show();
			$('#new-message').hide();
			
			$('.ui-page').removeClass('ui-page-active');
			$('#new-messages').addClass('ui-page-active');
		}
	}
	
	
	
	
}

function getMessageSpansLength(){
	var messageLength = 0;
	var displaySpans = $('#display').children('span');
	var displayLength = displaySpans.length;
	for(var i = 0; i < displayLength; i++){
		var span = displaySpans[i];
		var spanWidth = $(span).width();
	    messageLength = messageLength + spanWidth;
	}
	return messageLength;
}
var SCROLL_TIMER = 0;

function checkScroll(){
	
	var docWidth = $(document).width();
	var messageLength = getMessageSpansLength();
	
	if(messageLength > docWidth){
		
		clearTimeout(SCROLL_TIMER);
		var diff = messageLength - docWidth;
		//$(DISPLAY_CLASS).css('margin-left',-diff + -10);
		$(DISPLAY_CLASS).animate({'margin-left': -diff + -10}, 100, null, null);
		
		FLAG_START_AUTOSCROLL = true;
		SCROLL_TIMER = setTimeout(function(){autoScroll(true)}, 4000);
	}
}
var FLAG_AUTOSCROLL_WAIT = false;
var AUTO_SCROLL_TIMER = 0;
function autoScroll(start){
	//clearTimeout(SCROLL_TIMER);
	var just_started = false;
	if(FLAG_START_AUTOSCROLL && start == true){
		AUTO_SCROLLING = true;
		FLAG_START_AUTOSCROLL = false;
		$(DISPLAY_CLASS).animate({'margin-left':0}, 500, null, null);
		just_started = true;
	}else if(FLAG_START_AUTOSCROLL && FLAG_AUTOSCROLL_WAIT){
		AUTO_SCROLLING = true;
		FLAG_START_AUTOSCROLL = false;
		FLAG_AUTOSCROLL_WAIT = false;
		$(DISPLAY_CLASS).css('margin-left',$(document).width() + 2);
	}
	
	
	
	
	if(AUTO_SCROLLING){
		var ml = $(DISPLAY_CLASS).css('margin-left');
		var pos = Number(S(ml).replaceAll('px', ''));
		pos = pos - 5;
		
		var messageLength = getMessageSpansLength();
		if(pos < (MESSAGE_END_POSITION - 10) || just_started){
			//pos = 0;
			
			FLAG_START_AUTOSCROLL = true;
			FLAG_AUTOSCROLL_WAIT = true;
			AUTO_SCROLLING = false;
			AUTO_SCROLL_TIMER = setTimeout(autoScroll,3000);
			//$(DISPLAY_CLASS).css('margin-left',0);
			//$(DISPLAY_CLASS).animate({'margin-left': pos}, 200, null, null);
			return;
		}
		
		$(DISPLAY_CLASS).css('margin-left',pos);
		requestAnimationFrame(autoScroll);
	}else{
		return;
	}
	
}
var PHONE_NUMBER_INDEX = 0;
$('#change-number').click(function(e) {
	var myNumbers = CURRENT_CONTACT.numbers;
	
	if(myNumbers.length > 1){
		PHONE_NUMBER_INDEX++;
		
		if(PHONE_NUMBER_INDEX > myNumbers.length - 1){
			PHONE_NUMBER_INDEX = 0;
		}
		CURRENT_NUMBER = myNumbers[PHONE_NUMBER_INDEX];
		$('#recip-num').text(myNumbers[PHONE_NUMBER_INDEX]);
	}
})
function confirmMessage(){
	
	if(!FINAL_MESSAGE || FINAL_MESSAGE == '' || FINAL_MESSAGE == ' '){
		alert("Message is empty... Returning to main screen.")
		backToList();
		return;
	}
	message_ready = true;
	
	if(CURRENT_NUMBER == 0){
		alert("Choose a contact")
		showContacts();
		return;
		
	}
	$('#change-number').hide();
	if(!FLAG_GET_PHONE_NUMBER_MODE){
		if(CURRENT_CONTACT){
			if(CURRENT_CONTACT.numbers.length > 1){
				$('#change-number').show();
			}else{
				//$('#change-number').hide();
			}
		}
		
	}
	
	$('#final-message').text(FINAL_MESSAGE);
	if(CURRENT_CONTACT){
		$('#recipient').html(CURRENT_CONTACT.name + '<br/><span id="recip-num">' + CURRENT_CONTACT.numbers[0] + '<span>');
	}else if(CURRENT_NUMBER){
		if(IS_REPLY){
			$('#recipient').html('Reply to <br/><span id="recip-num" >' + CURRENT_NUMBER + '</span>');
		}else{
			$('#recipient').html('?<br/><span id="recip-num" >' + CURRENT_NUMBER + '</span>');
		}
		
	}
	
	showConfirmationPage();
	
}
function onSentMessageResult(resultResponse){
	if(resultResponse.result){
		toastAlert(resultResponse.result, 5);
	}
	
}
function onNewMessageRecieved(newMessageResponse,request){
	if(newMessageResponse.messages){
		var b4refreshed = new Array();
		for(var z = 0; z < NEW_MESSAGES.length; z++){
			b4refreshed.push(NEW_MESSAGES[z]);
		}
		
		NEW_MESSAGES = new Array();
		if(newMessageResponse.messages.length > 0){
			
			var messages = newMessageResponse.messages;
			for(var i = 0; i < messages.length; i++){
				
				var isthere = false;
				var om = messages[i];
				for(var j = 0; j < NEW_MESSAGES.length; j++){
					var nm = NEW_MESSAGES[j];
					
					if(nm.address == om.address){
						if(nm.body == om.body && nm.date == om.date){
							isthere = true;
							break;
						}
						
					}
				}
				if(isthere){
					continue;
				}
				
				//messages[i].read = false;
				for(var y = 0; y < b4refreshed.length; y++){
					var oldmsg = b4refreshed[y];
					if(oldmsg.body == messages[i].body && oldmsg.date == messages[i].date && oldmsg.address == messages[i].address){
						messages[i].read = oldmsg.read;
					}
				}
				
				NEW_MESSAGES.push(messages[i]);
			}
			
			if(!request){
				//showNewMessages();
			}
			updateNewMessageLI();
			
			$('#li-new-messages').show();
			
		}else{
			$('#li-new-messages').hide();
		}
	}
}
function updateNewMessageLI(){
	var messcount = getUnreadMessageCount();
	$('#new-message-banner').text(messcount);
	if(messcount == 0){
		$('#new-message-banner').hide();
	}else{
		$('#new-message-banner').show();
	}
}

function getUnreadMessageCount(){
	var result = 0;
	var count = NEW_MESSAGES.length;
	for(var i=0;i<count;i++){
		if(NEW_MESSAGES[i].read == "false"){
			result++;
		}
	}
	return result;
}
function sendFinalMessage() {
	var reqData = {
			'msgId' : "sms-client-req",
			'message' : FINAL_MESSAGE,
			'number' : CURRENT_NUMBER,
			'reply'  : IS_REPLY
	}
	
	sapRequest(reqData, function(respData) {
		toastAlert(respData.result,5);
	}, function(error){
		toastAlert("Socket error...",10);
	})
	
	backToList(null,true);
}
function exit(){

	tizen.application.getCurrentApplicaton().exit();
}
function getInbox(){
	var reqData = {
			'msgId' : "inbox-request"
	}
	sapRequest(reqData,function(respData){
		
		if(respData.messages){
			INBOX = respData.messages;
			for(var i = 0; i < INBOX.length; i++){
				
				var message = INBOX[i];
				
				
			}
		}
	}, function(){
		//alert("");
	})
}
function closePopup(){
	//gear.ui.closePopup($('#popupToast'))
	$('#popupToast').hide();
	popup_open = false;
}
function getContacts(show) {
	var reqData = {
			'msgId' : "contacts-request",
			
	}
	if(MESSAGE_MODE == true){
		show = false;
	}
	if(!CONTACTS){
		toastAlert("Sending for contacts...",5);
		sapRequest(reqData, function(respData) {
			
			if(respData.contacts){
				if(popup_open){
					gear.ui.closePopup('#popupToast')
					popup_open = false;
				}
				CONTACTS = respData.contacts;
				for(var i = 0; i < respData.contacts.length; i++){
					
					var contact = respData.contacts[i];
					var image = contact.photo;
					var numberCountText = contact.numbers.length > 1 ? '<sub>' + contact.numbers.length + ' numbers</sub>' : '';
					var photoEl = '<img src="/Images/no-photo.jpg" width="50" height="50" />';
					if(image != ""){
						var photoEl = '<img src="data:image/jpeg;base64,' + image + '" width="50" height="50"/>'
					}
						
					
					var el = '<li class="contact-item main-list-item" data-index="' + i + '" data-id="' + contact.id 
					//+ '" onclick="showKepad()"'
					
					+ '"><p class="contact-name">' + contact.name + '</p>'
					+ photoEl
					+ '<p class="contact-number double-titanium">' + contact.numbers[0] + '</p>' + numberCountText;
					
					
					$('#contacts').append(el);
					
					if(show == true){
						showContacts()
					}else{
//						if(MESSAGE_MODE == false){
//							backToList();
//						}
						
					}
					
					
				}
				
			}else{
				toastAlert("Error getting contacts...");
				//resetMessage();
				backToList("Error getting contacts...",true);
			}
			$$('#contacts li').tap(function(e) {
				var index = $(this).attr('data-index');
				var indexNum = Number(index);
				if(!isNaN(indexNum)){
					CURRENT_CONTACT = CONTACTS[indexNum];
					CURRENT_NUMBER = CURRENT_CONTACT.numbers[0];
					closePopup();
					$('.ui-page').hide();
					if(message_ready){
						confirmMessage();
					}else{
						setTimeout(function(){
							TEMP_DISABLE_KEYS = false;
						}, 1000)
						LOCK_NUMBERS = false;
						showKepad(1);
					}
					
				}
			})
			
			
		}, function(error){
			
			backToList(error.message,true);
		})
	}else{
		if(show == true){
			showContacts()
		}else{
			
			if(MESSAGE_MODE == false){
				backToList(null,true);
			}
			
			
		}
	}
	
	
}
var sapinitsuccesscb = {
	onsuccess : function() {
		console.log('Succeed to connect');
		backToList();
		REMOTE_DETACHED = false;
		getContacts()
	},
	ondevicestatus : function(status) {
		closePopup();
		if (status == "DETACHED") {
			//toastAlert();
			REMOTE_DETACHED = true;
			backToList('Detached remote peer device',MESSAGE_MODE == true);
		} else if (status == "ATTACHED") {
			//reconnect();
			REMOTE_DETACHED = false;
			getContacts();
			if(TRYING_TO_SEND){
				TRYING_TO_SEND = false;
				confirmMessage();
			}else{
			
				
				backToList('Attached to remote', true);
				initialize();
				
				//toastAlert('Attached to remote',5);
				
				
				
				
			}
			
			
		}
	}
};


$('.num').hide();
$('.letters').hide();

//mode 1: alpha
//mode 2: alpha-numeric
//mode 3: numeric
//mode 4: symbols

function SwitchCharacterMode(mode,lock){
	gear.ui.closePopup('#popupToast')
	
	if(LOCK_NUMBERS ){
		if(!lock){
			return;
		}
		
	}
	if(!mode){
		mode = CHARACTER_MODE + 1;
		if(mode > 4){
			mode = 1
		}
	}
	CHARACTER_MODE = mode;
	var numbers = $('.num');
	var letters= $('.letters');
	var symbols = $('.sym');
	switch(mode){
	
	case 1:
		numbers.hide();
		symbols.hide();
		letters.show();
		$('.alpha').show();
		$('.alpha-numeric').hide();
		break;
		
	case 3:
		symbols.hide();
		letters.hide();
		numbers.show();
		$('.alpha').hide();
		$('.alpha-numeric').show();
		LAST_CHAR_EMPTY = true;
		AUTO_ADVANCED = true;
		
		if(lock){
			LOCK_NUMBERS = true;
		}
		
		break;
		
	case 2:
		symbols.hide();
		letters.show();
		numbers.show();
		$('.alpha').show();
		$('.alpha-numeric').show();
		break;
		
	case 4:
		letters.hide();
		numbers.hide();
		symbols.show();
		$('.alpha').hide();
		$('.alpha-numeric').hide();
		
	}
	
}
setInterval(function() {
	if(reset || CHAR_ARRAY.length < 1){
		return;
	}
	if(LAST_PRESS_WAS_POUND){
		return;
	}
	if(last_time_check == 0){
		return;
	}
	var tt = new Date().getTime();
	
	if(tt - last_time_check > 1000 && (CHARACTER_MODE < 3)){
		last_time_check = 0;
		appendCharacterToMessage(getCurrentPressedChar('pound'));
		//CHAR_NUM++;
		AUTO_ADVANCED = true;
		//CURRENT_DIGIT = 0;
	}
}, 1000)

SwitchCharacterMode(CHARACTER_MODE);

function getCurrentPressedChar(digitID){
	
	if(LONGPRESS){
		LONGPRESS = false;
		return;
	}

	var thisDig = 0;
	switch(digitID){
	

	case "star":
		
		thisDig = 10;
		
		
		if(CHAR_NUM > 0){
			CHAR_ARRAY.pop();
			
			
			CHAR_NUM--;
			CURSOR_POSITION = CHAR_NUM;
			if(CHAR_ARRAY[CURSOR_POSITION - 1] == ' '){
				CURSOR_POSITION++;
			}
			
		}
		
		break;
	case "0":
		thisDig = 11;
		break;
	case "pound":
		LAST_PRESS_WAS_POUND = true;
		thisDig = 12;
		if(CHAR_NUM == CHAR_ARRAY.length - 1){
			if(thisDig == CURRENT_DIGIT && CHARACTER_MODE < 3 ){
				
				LETTER_CIPHER++;
				CHAR_ARRAY.push(' ');
				CHAR_NUM = CHAR_ARRAY.length - 1;
				
			}else{
				
				LETTER_CIPHER=0;
				//CHAR_ARRAY.push(' ');
				CHAR_NUM = CHAR_ARRAY.length - 1;
			}
			
		}else{
			LETTER_CIPHER=0;
			//CHAR_ARRAY.push(' ');
			CHAR_NUM = CHAR_ARRAY.length - 1;
		}
		break;
		
    default:
    	
    var dig = Number(digitID);
    if(!isNaN(dig)){
    	thisDig = dig;
    }
    
    break;
	
	
	}
	//cipher 0: number
	//cipher 1: 1st letter
	//cipher 2: 2nd letter
	//cipher 3: 3rd letter
	//...only 7 and 9...
	//cipher 4: 4th letter
	LAST_DIGIT = CURRENT_DIGIT;
	
	//if less than a sec
	if(hasBeenMoreThanASecond()){
		CURRENT_DIGIT = thisDig;
		
		LETTER_CIPHER = 0;
	}else{
		
		if(thisDig == CURRENT_DIGIT){
			
			
			LETTER_CIPHER++;
			
			if(CHARACTER_MODE == 2){
				if(thisDig > 1 && thisDig < 10){
					return getActualCharFromDigit(thisDig,LETTER_CIPHER);
				}
			}
			
			if(LETTER_CIPHER > 2){
				if(CURRENT_DIGIT == 7 || CURRENT_DIGIT == 9){
					if(LETTER_CIPHER < 4){
						
					}else{
						LETTER_CIPHER = 0;
					}
				}else{
					LETTER_CIPHER = 0;
				}
				
			}else{
				
			}
		}else{
			
			CURRENT_DIGIT = thisDig;
			LETTER_CIPHER = 0;
		}
	}
	
	
	return getActualCharFromDigit(CURRENT_DIGIT,LETTER_CIPHER);
}

function hasBeenMoreThanASecond(){
//	if(CHARACTER_MODE > 2){
//		return true;
//	}
	var _time = this_click_time - last_click_time;
	
	var result = _time > 1;
	
	return result;
}
function switchCaps(mode,li){
	CAPS = mode;
	
	if(false){
		var letters = $(li).text();
		if(mode == 0){
			letters = letters.toLowerCase();
		}else{
			letters = letters.toUpperCase();
		}
		$(li).text(letters);
	}else{
		$('.letters').each(function(i) {
			var letters = $(this).text();
			
			if(mode == 0){
				letters = letters.toLowerCase();
			}else{
				letters = letters.toUpperCase();
			}
			$(this).text(letters);
		})
	}
	
	
}

//alpha only
//alpha-numeric
//numeric only
//symbols
$(KEYS_CLASS + ' li').mouseup(function(e){
	e.stopImmediatePropagation();
	e.preventDefault();
	
	AUTO_SCROLLING = false;
	clearTimeout(AUTO_SCROLL_TIMER);
	last_click_time = this_click_time;
	this_click_time = e.timeStamp;
	
	last_time_check = new Date().getTime();
	
	if(TEMP_DISABLE_KEYS){
		TEMP_DISABLE_KEYS = false;
		return;
	}
	if(CHARACTER_MODE < 3){
		AUTO_ADVANCED = false;
	}
	//
	if(LONGPRESS){
		LONGPRESS = false;
		return;
	}
//	if($(this).attr('id') == '0'){
//		LONGPRESS = false;
//		return;
//	}

	LAST_PRESS_WAS_POUND = false;
	
	
	
	
	
	if(last_click_time == 0){
		last_click_time = this_click_time;
	}
	var id = $(this).attr('id');
	if(id == '1'){
		
	}
	if(id == '0'){
		
		//return;
	}else{
		reset = false;
	}
	var char = getCurrentPressedChar(id);
	
	if(char){
		appendCharacterToMessage(char);
	}
	
	
	
	
	
});



$(DISPLAY_CLASS).click(function(e) {
	
	
		
	
	
	
	
})
$$('#0').hold(function(e){
	//CHAR_ARRAY = new Array();
	
	reset = true;
	resetMessage();
	LONGPRESS = true;
//	$('#display').text('');
//	
//	CHAR_NUM = 0;
//	
//	CURRENT_DIGIT = 0;
//	LAST_DIGIT = 0;
//	this_click_time = 0;
//	last_time_check = 0;
//	last_click_time = 0;
//	appendCharacterToMessage(getCurrentPressedChar('pound'));
  
})

$$('#0').tap(function(e) {
	
	
})

$$('#1').hold(function(e){
	if(LOCK_NUMBERS){
		return;
	}
	LONGPRESS = true;
	CHARACTER_MODE++;
		if(CHARACTER_MODE > 4){
			CHARACTER_MODE = 1;
		}
		SwitchCharacterMode(CHARACTER_MODE);
		return;
  
})
$$('#star').hold(function(e){
	if(CHARACTER_MODE < 3 || CAPS == 2){
		if(CAPS == 2){
			switchCaps(0);
			
		}else{
			switchCaps(2);
		}
		
		
		
		
		
		LONGPRESS = true;
		
		
	}
	
	
	
})

$$('#1').tap(function(e){
	
	
	if(CHARACTER_MODE == 1 || CHARACTER_MODE == 2  ){
		if(LETTER_CIPHER > 1){
			LETTER_CIPHER = 0;
		}
		LONGPRESS = true;
		if(CHARACTER_MODE == 1){
			switchCaps(1,this);
			caps_switched = true;
			LETTER_CIPHER = 0;
		}
		
		if(LETTER_CIPHER == 1) {
			switchCaps(0,this);
			caps_switched = false;
			appendCharacterToMessage('1');
			
			LETTER_CIPHER = 0;
		
			return;
		}else {
			switchCaps(1,this);
			caps_switched = true;
			LETTER_CIPHER++;
			
		}
		
		
		
	}
	
	
})

$$('#pound').hold(function(e){
	resetDisplayMargin();
	if(CHARACTER_MODE == 3 && LOCK_NUMBERS){
		
		var mess = S(FINAL_MESSAGE).replaceAll(' ','').s;
		if(isNaN(mess) || mess == 0){
			//FLAG_GET_PHONE_NUMBER_MODE = false;
			LOCK_NUMBERS = false;
			resetMessage();
			backToList();
			return;
			
		}
		
		CURRENT_NUMBER = Number(mess);
		if(!isNaN(CURRENT_NUMBER)){
			LOCK_NUMBERS = false;
			//FLAG_GET_PHONE_NUMBER_MODE = false;
			resetMessage();
			SwitchCharacterMode(1, false);
		}
		return;
	}
	
	LONGPRESS = true;
	confirmMessage();
})

$$('#edit-message').tap(function(e) {
	showKepad();
	checkScroll();
	
})
function sendMessage(){
	if(!REMOTE_DETACHED){
		TRYING_TO_SEND = false;
		sendFinalMessage();
	}else{
		TRYING_TO_SEND = true;
		toastAlert("Remote device not connected...",5);
		return;
	}
}
$$('#send').tap(function(e) {
	
	sendMessage();
})
$$('#cancel').tap(function(e){
	backToList('Message cancelled.',true);
})
//define(["dojo/on", "dojox/gesture/tap"], function(on, tap){
//  on(dojo.byId('0'), tap.hold, function(e){
//	  
//	  
//	  
//  });
//  on(dojo.byId('1'), tap.hold, function(e){
//	  LONGPRESS = true;
//		CHARACTER_MODE++;
//			if(CHARACTER_MODE > 4){
//				CHARACTER_MODE = 1;
//			}
//			SwitchCharacterMode(CHARACTER_MODE);
//			return;
//  });
////  on(node, tap.doubletap, function(e){});
//})




function appendCharacterToMessage(char){
	
	if(CAPS > 0 && char == '&nbsp'){
		//caps_switched = false;
		if(char == '&nbsp'){
			return;
		}
		
	}
	if (CHARACTER_MODE < 3) {
		if (isNaN(char)) {
			if (CAPS > 0) {
				if(caps_switched){
					char = char.toUpperCase();
					caps_switched = false;
				}else{
					if(LAST_DIGIT != CURRENT_DIGIT && CAPS == 1){
						switchCaps(0);
					}
					
					if (CAPS == 1 ) {
						if(hasBeenMoreThanASecond() || AUTO_ADVANCED){
							switchCaps(0);
							
						}
						
						char = char.toUpperCase();
					}
					if(CAPS == 2){
						char = char.toUpperCase();
					}
					
				}
				

				

			}
		}
	}
	if(!char){
		return;
	}
	
	if(hasBeenMoreThanASecond() || ( LAST_DIGIT != CURRENT_DIGIT && LAST_DIGIT > 0) || CURRENT_DIGIT > 10 || (CHARACTER_MODE > 2 && CURRENT_DIGIT != 10)){
		if(char != '' && char != ' ' && !LAST_CHAR_EMPTY || CHARACTER_MODE > 2){
			
			if(CHARACTER_MODE > 2 || (!AUTO_ADVANCED && (isNaN(char)  ))){
				
				if( LAST_DIGIT != 10 )
					CHAR_NUM++;
				
				
			}else{
				
			}
			
		}
		
	}
	if(CHARACTER_MODE == 2 && (char == '0' || char == '1')){
		if(!AUTO_ADVANCED){
			CHAR_NUM++;
		}
		
	}
	if(char == '12'){
		//alert('');
	}
	
	if(char != ''){
		if(CHAR_ARRAY.length == 0 && CHAR_NUM > 0){
			CHAR_NUM = 0;
		}
		CHAR_ARRAY[CHAR_NUM] = char;
	}
	CURSOR_POSITION = CHAR_NUM;
	if(char == " "){
		CURSOR_POSITION++;
	}
	
	if(char == '' || char == ' ' || char == '&nbsp'){
		LAST_CHAR_EMPTY = true;
	}else{
		LAST_CHAR_EMPTY = false;
	}
	MESSAGE = '';
	FINAL_MESSAGE = '';
	for(var i=0; i < CHAR_ARRAY.length; i++){
		var c = CHAR_ARRAY[i];
		
		if(!c){
			throw new Exception();
			continue;
		}
		if(i==0){
			if(c == '' || c == ' ' || c == '&nbsp'){
				//throw new Exception();
				CHAR_ARRAY.slice(0, 1)
				continue;
			}
			c = c.toUpperCase();
		}
		if(!c){
			continue;
		}
		if(c == " "){
			c = "&nbsp"
		}
		if(i == CURSOR_POSITION){
			MESSAGE += '<span class="ch-active">' + c + '</span>';
		}else{
			MESSAGE += '<span>' + c + '</span>';
		}
		var finalChar = CHAR_ARRAY[i];
		if(finalChar == '&nbsp'){
			finalChar = ' ';
		}
		if(i == 0){
			finalChar = finalChar.toUpperCase();
		}
		FINAL_MESSAGE+= finalChar;
		
	}
	
	
	//MESSAGE = CHAR_ARRAY.join("")
	

	$(DISPLAY_CLASS).html(MESSAGE);
	MESSAGE_END_POSITION = Number( S($('#display').css('margin-left')).replaceAll('px','') );
	
	checkScroll();
	
	
	
	FINAL_MESSAGE = FINAL_MESSAGE.replace('&nbsp', ' ');
	
	console.log(FINAL_MESSAGE);
}
//3 * (digit-1)

//(letter+21 or <kp8> : 3 * (digit) -2
var CHARS = new Array(
		'','','',//0,1,2
		'a','b','c',//3,4,5
		'd','e','f',//6,7,8
		'g','h','i',//9,10,11
		'j','k','l',//12,13,14
		'm','n','o',//15,16,17
		'p','q','r','s',//18,19,20,21
		't','u','v',//22,23,24
		'w','x','y','z'//25,26,27,28
		);

//'.','?','!','@','#','$','%','&','*','(',')'
var SYMBOLS = new Array(
		'.','?','!',
		'@','#','$',
		'&','*','(',')'

);
function getActualCharFromDigit(digit,timesPressed){
	var char = '';
	
	
	
	if(AUTO_ADVANCED){
		AUTO_ADVANCED = false;
		CHAR_NUM--;
	}
	
	
	
	if(CHARACTER_MODE < 3 || digit > 9){
		
		if(digit == 1 && CHARACTER_MODE > 1 && CHARACTER_MODE < 4){
			
			return '1' ;
			
				
			
		}else if(digit < 10){
			
			if(timesPressed == 3 ){
				if(digit == 7 || digit == 9){
					
				}else{
					return digit.toString();
				}
				
			}else if(timesPressed == 4){
				if(digit == 7 || digit == 9){
					timesPressed = 0;
					LETTER_CIPHER = 0;
					return digit.toString();
				}
					timesPressed = 0;
					LETTER_CIPHER = 0;
				
				
			}
			
			return((digit < 7) ? CHARS[3* (digit-1) + timesPressed] : CHARS[3 * digit - (digit==8 ? 2 : (digit==7 ? 3 : 2)) + timesPressed])
			
		}else{
			if(digit == 11){
				
				if(CHARACTER_MODE > 1 && CHARACTER_MODE < 4){
					
					
					
					return '0';
				}else if(CHARACTER_MODE == -1){
					
					if(LETTER_CIPHER == SYMBOLS.length){
						LETTER_CIPHER = 0;
					}
				
						return SYMBOLS[LETTER_CIPHER++];
						
				}
				if(CHARACTER_MODE == 4){
					
					
					return '\''
				}
			}
			
			return '&nbsp';
			
		}
	}else if(CHARACTER_MODE == 4){
		return $('#' + CURRENT_DIGIT).find('.sym').text();
	}else{
		if(CURRENT_DIGIT < 10){
			return CURRENT_DIGIT.toString();
		}
		
	}
	
	
	
}

( function () {
	/*var buttonPressedBGColor = 'rgba(255, 0, 0, 0.8)';
	var originalBGColor = $('ol.keys li').first().css('background-color');
	$('ol.keys li').mouseenter(function(e){
		$(this).css('background-color',buttonPressedBGColor);
	}).mouseleave(function(){
		$(this).css('background-color',originalBGColor);
	})*/
	window.addEventListener( 'tizenhwkey', function( ev ) {
		if(MESSAGE_MODE && ev.keyName == "menu"){
			SwitchCharacterMode();
		}
		if( ev.keyName == "back" ) {
			var page = document.getElementsByClassName( 'ui-page-active' )[0],
				pageid = page ? page.id : "";
			if( pageid === "main" ) {
				tizen.application.getCurrentApplication().exit();
			} else {
				LOCK_NUMBERS = false;
				SwitchCharacterMode(1);
				resetMessage();
				resetDisplayMargin();
				backToList();
				//window.history.back();
			}
			
		}
		
	} );
	
	window.addEventListener('load', function(ev) {
		$('.ui-page').hide();
		$('#confirm').hide();
		initialize();
		//backToList();
	});
	
} () );


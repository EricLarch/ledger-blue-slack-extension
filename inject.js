initSlackBridge();

function initSlackBridge() {
  $("#message-input").off("keydown");
  $("#message-input").on("keydown", function(event) {
    if (event.which == 13) { 
      onMessageSubmit(); 
    } 
  });
  $("#message-form").attr('onsubmit', "onMessageSubmit(); return false;");
}
function onMessageSubmit() {
  message = $("#message-input").val();
  message = message.rot13();
  $("#message-input").val(message)
  TS.view.submit();
  $("#message-input").val(undefined)
}
function unscramble() {
  $.each($(".message_body"), function(index,e) { 
    text = $(e).text();
    $(e).text(text.rot13());
  });
}

String.prototype.rot13 = function(){
  return this.replace(/[a-zA-Z]/g, function(c){
    return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
  });
};


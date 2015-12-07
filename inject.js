var SlackBridge = {

  _MAGIC: "mSB00",

  init: function() {
    $("#message-input").off("keydown");
    $("#message-input").on("keydown", function(event) {
      if (event.which == 13) { 
        SlackBridge.onMessageSubmit(); 
      } 
    });
    $("#message-form").attr('onsubmit', "onMessageSubmit(); return false;");  
  },

  onMessageSubmit: function() {
    user_id = TS.model.user.id;
    channel_id = TS.model.active_channel_id;
    group_id = TS.model.active_group_id;
    if (channel_id != undefined) {
      members = TS.channels.getChannelById(channel_id).members
    } else if (group_id != undefined) {
      members = TS.groups.getGroupById(group_id).members
    }
    message = $("#message-input").val();
    message = SlackBridge.encryptMessage(message, members);
    $("#message-input").val(message)
    TS.view.submit();
    setTimeout(function() {
      $("#message-input").val("");
      $("#message-input").val(undefined);
      SlackBridge.unscramble();
    }, 200);
  },

  encryptMessage: function(message, members) {
    payload = {};
    payload.keys = {};
    $.each(members, function(index, member) {
      payload.keys[member] = index;
    });
    payload.messages = {};
    $.each(members, function(index, member) {
      payload.messages[member] = message.rot13();
    });
    return SlackBridge._MAGIC + Base64.encode(JSON.stringify(payload));
  },

  decryptMessage: function(message) {
    payload = JSON.parse(Base64.decode(message));
    user_id = TS.model.user.id;
    index = payload.keys[user_id];
    if (index == undefined) {
      return null;
    }
    return payload.messages[user_id].rot13();
  },

  unscramble: function() {
    $.each($(".message_body"), function(index,e) { 
      text = $(e).text();
      if (text.indexOf(SlackBridge._MAGIC) == 0) {
        message = text.substring(SlackBridge._MAGIC.length);
        $(e).text(SlackBridge.decryptMessage(message));
      }
    });
  }
}

var Base64 = {

    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },


    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}

String.prototype.rot13 = function(){
  return this.replace(/[a-zA-Z]/g, function(c){
    return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
  });
};

SlackBridge.init();
SlackBridge.unscramble();



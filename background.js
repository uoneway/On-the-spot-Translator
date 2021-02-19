
// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//       console.log(sender.tab ?
//                   "from a content script:" + sender.tab.url :
//                   "from the extension");
//       if (request.greeting == "hello")
//         sendResponse({farewell: "goodbye"});
//     });

// function gotMessage(message, sender, sendResponse){
//     console.log(message.target_lang)
//     aaa(sender)
// }

// function aaa(tab){
//     let msg = {txt: "hellow"}
//     chrome.tabs.sendMessage(tab.id, msg)
// }


function getTranslateResult(request, sender, sendResponse){
    // var lang = request.target_lang
    // var text = request.source_text

    var client_id = "PwtsQmgHn5h50GCthwtj";
    var client_secret = "zNWtEXWpt_";
    var url = "https://openapi.naver.com/v1/papago/n2mt";
    var header = {
        // "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Type': 'application/json',
        "X-Naver-Client-Id":client_id,
        "X-Naver-Client-Secret":client_secret
    };

    // var data = {'text' : text,
    //         'source' : 'ko',
    //         'target': lang};
    console.log("aaaaaaa");

    // const userAction = async () => {
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         data: JSON.stringify(data), // string or object
    //         headers: header
    //         }
    //     );
    //     const myJson = await response.json(); //extract JSON from the http response
    //     console.log(myJson)
    //     console.log("bbbbbbb")
    // }


    fetch(url, {
        method: "POST",
        headers: header,
        body: JSON.stringify({
            'text' : "우리나라는 좋은나라다",
            'source' : 'ko',
            'target': "en"
        }), 
        
    }).then(response => console.log(response))
    .catch(error => console.error(error));
        //.then(responseText => sendResponse(responseText))
    
    //const myJson = response.json(); //extract JSON from the http response
    //console.log(response);
    console.log("bbbbbbb");
    return true;
    
}


// const axios = require('axios');
// const qs = require('querystring');


class Translator {
    static url = "https://openapi.naver.com/v1/papago/n2mt";

    constructor(client_config) {
        this.config = {
            headers: {
                'content-type': 'application/json; charset=UTF-8',
                'x-naver-client-id': client_config.NAVER_CLIENT_ID,
                'x-naver-client-secret': client_config.NAVER_CLIENT_SECRET,
        }};
    }
    
    async translate(source_text, source_lang, target_lang) {
        if (this.config == null) {
            throw new Error('Papago instance should be initialized with config first');
        } if (source_text == null) {
            throw new Error('Search source_text should be provided as lookup arguments');
        }

        const params = JSON.stringify({
            source: source_lang,
            target: target_lang,
            text: source_text,
        });

        const response = await axios.post(Translator.url, params, this.config);
        return response.data.message.result.translatedText;
    }
}

// NOTE: populate with your own Client id/secret from https://developers.naver.com/apps
const translator = new Translator({
    NAVER_CLIENT_ID: "PwtsQmgHn5h50GCthwtj",
    NAVER_CLIENT_SECRET: "zNWtEXWpt_",

});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    translator.translate(request.source_text, "en", request.target_lang)
    .then(function(response){
        sendResponse({"translated_text": response});
    }).catch(function(error) {
        // console.log(error)
        // console.log(error.name)
        // console.log(error.stack)
        //console.error(error.message);
        console.log(error.message);
        sendResponse({"error": "❗ You exceeded daily translation limit. This translator use naver papago API which available to 10,000 characters per day."});
    });
    return true;
});

// async function main {
//     let translated_text = await translator.translate(request.source_text, "en", request.target_lang);
//     console.log(translated_text);

//     sendResponse({"translated_text": translated_text});
//     // return true;
// }
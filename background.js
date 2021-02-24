
let naver_api_client_id;
let naver_api_client_secret;
updateNaverApiInfo();
let translator;

chrome.storage.onChanged.addListener(function(changes, areaName){
    if(areaName == "sync"){
        updateNaverApiInfo();
    }
})

function updateNaverApiInfo(){
    chrome.storage.sync.get({  // 이 함수 자체가 async하게 작동함. 그래서 여기 안에 Translator을 넣어놔야 api key 없데이트 된 값이 들어감
        naver_api_client_id: '',
        naver_api_client_secret: '',
    }, function(items) {
        naver_api_client_id = items.naver_api_client_id;
        naver_api_client_secret = items.naver_api_client_secret;
        // console.log(naver_api_client_id)
        // console.log(naver_api_client_secret)
        
        if(translator == undefined) {
            // console.log("undefined")
            translator = new Translator({
                api_client_id: naver_api_client_id,
                api_client_secret: naver_api_client_secret,
            });
        }else{
            // console.log("defined")
            translator.updateApiClinetInfo(naver_api_client_id, naver_api_client_secret);
        }
        });
};

//// 네이버로 직접 요청
// function getTranslateResult(request, sender, sendResponse){
//     // var lang = request.target_lang
//     // var text = request.source_text

//     var client_id = naver_api_client_id;
//     var client_secret = naver_api_client_secret;
//     var url = "https://openapi.naver.com/v1/papago/n2mt";
//     var header = {
//         // "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
//         'Content-Type': 'application/json',
//         "X-Naver-Client-Id":client_id,
//         "X-Naver-Client-Secret":client_secret
//     };

//     // var data = {'text' : text,
//     //         'source' : 'ko',
//     //         'target': lang};
//     console.log("aaaaaaa");

//     // const userAction = async () => {
//     //     const response = await fetch(url, {
//     //         method: 'POST',
//     //         data: JSON.stringify(data), // string or object
//     //         headers: header
//     //         }
//     //     );
//     //     const myJson = await response.json(); //extract JSON from the http response
//     //     console.log(myJson)
//     //     console.log("bbbbbbb")
//     // }


//     fetch(url, {
//         method: "POST",
//         headers: header,
//         body: JSON.stringify({
//             'text' : "우리나라는 좋은나라다",
//             'source' : 'ko',
//             'target': "en"
//         }), 
        
//     }).then(response => console.log(response))
//     .catch(error => console.error(error));
//         //.then(responseText => sendResponse(responseText))
    
//     //const myJson = response.json(); //extract JSON from the http response
//     //console.log(response);
//     console.log("bbbbbbb");
//     return true;
    
// }


class Translator {
    static url = "https://on-the-spot-translator.herokuapp.com/translate";
    // static url = "http://127.0.0.1:5000/translate";

    constructor(params) {
        this.config = {
            headers: {
                'content-type': 'application/json; charset=UTF-8',
                // 'x-naver-client-id': params.NAVER_CLIENT_ID,
                // 'x-naver-client-secret': params.NAVER_CLIENT_SECRET,
        }};
        this.api_client_id = params.api_client_id
        this.api_client_secret = params.api_client_secret
    }

    updateApiClinetInfo(api_client_id, api_client_secret){
        this.api_client_id = api_client_id
        this.api_client_secret = api_client_secret
    }

    async translate(source_text, target_lang) {
        if (this.config == '') {
            throw new Error('Papago instance should be initialized with config first');
        } if (source_text == null) {
            throw new Error('Search source_text should be provided as lookup arguments');
        }

        const params = JSON.stringify({
            "data": {
                "source_text": source_text
                //"target_lang": target_lang
            },
            "api_client_info": {
                "id": this.api_client_id,
                "secret": this.api_client_secret
            }
        });

        const response = await axios.post(Translator.url, params, this.config);

        return {'translatedText': response.data.message.result.translatedText,
                 'api_rescode': response.data.message.result.api_rescode}
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    translator.translate(request.source_text, request.target_lang)
    .then(function(response){
        // console.log("aaaa", response)
        sendResponse({"translated_text": response.translatedText,
                        "api_rescode": response.api_rescode,});
    }).catch(function(error) {
        // console.log(error)
        // console.log(error.name)
        // console.log(error.stack)
        //console.error(error.message);

        let error_msg = error.message
        console.log(error_msg);
        
        // papago에 바로 요청할 때
        // let n = error_msg.split(" ")
        // let error_code = n[n.length - 1];
        // console.log(error_code);
        // if (error_code == '401'){
        //     sendResponse({"error": "❗ Authentication failed: Please check if the 'Naver Papago API application info' is correct"});
        // }else if (error_code == '403'){
        //     sendResponse({"error": "❗ Please check if 'Papago Translation' API is added in the 'API setting' tab at Naver Developer Center website(https://developers.naver.com/apps)."});
        // }else if (error_code == '429'){
        //     sendResponse({"error": "❗ Used up all your daily data: This translator use Naver Papago API which provide only 10,000 characters translation per a day."});
        // }else{
        //     sendResponse({"error": "❗ Error: Some problem occured at Naver Papago API application. Please try again"});
        // }
        sendResponse({"error": "❗ Error:"});

    });
    return true;
});

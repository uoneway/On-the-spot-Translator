// Set a meta key from icon popup
let metaKey;
updateMetaKey();

chrome.storage.onChanged.addListener(function(changes, areaName){
    if(areaName == "sync"){
        updateMetaKey();
    }
})

function updateMetaKey(){
    chrome.storage.sync.get({
        metaKey: 'Alt',
        // naver_api_client_id: '',
        // naver_api_client_secret: '',
    }, function(items) {
        metaKey = items.metaKey;
        // naver_api_client_id = items.naver_api_client_id;
        // naver_api_client_secret = items.naver_api_client_secret;
    });
};


// Display a source text box when mouse over
document.addEventListener("mouseover", function(event){
    if((event.altKey && metaKey == "Alt")
        || (event.ctrlKey && metaKey == "Ctrl")
        || (event.shiftKey && metaKey == "Shift")) { 
        drawSourceBox(event.target);
        event.preventDefault();
    }
}, false);

function drawSourceBox(overedElement){
    // Remove before sourceBox
    $(".sourceBox").remove();
    
    let rect = overedElement.getBoundingClientRect();
    let sourceBox = document.createElement("div");
    sourceBox.className = "sourceBox";
    sourceBox.style.position = "absolute";
    sourceBox.style.top = (rect.top + window.scrollY) + "px";
    sourceBox.style.left = (rect.left + window.scrollX) + "px";
    sourceBox.style.width = (rect.width - 4) + "px";
    sourceBox.style.height = (rect.height - 4) + "px";
    sourceBox.style.border = "solid 2px royalblue";
    sourceBox.style.borderRadius = "5px";
    // sourceBox.style.fontSize = "smaller";
    sourceBox.style.zIndex = "99999";
    sourceBox.style.pointerEvents = "none";
    document.body.appendChild(sourceBox);
    
    $(sourceBox).fadeIn(300, "swing").delay(600).fadeOut(500, "swing");
    // console.log(text.trim());
}


// Display a trasnlated text when click the source text
document.addEventListener("click", function(event){
    if((event.altKey && metaKey == "Alt")
        || (event.ctrlKey && metaKey == "Ctrl")
        || (event.shiftKey && metaKey == "Shift")) { 
        insertTranslateBox(event.target);
        event.preventDefault();  //클릭 시 보통 발생하는 링크 이동 등을 막아주기 위해
    }
}, false);

function insertTranslateBox(clickedElement){

    let translateBox = document.createElement("div");
    translateBox.className = "translateBox";
    
    let text = getText(clickedElement.firstChild, "\n").trim();  // "\r\n"
    // console.log("text1", text)
    
    translateBox.style.border = "solid 2px white";
    translateBox.style.borderRadius = "5px";
    translateBox.style.padding = "5px";
    translateBox.style.zIndex = "99999";
    translateBox.style.pointerEvents = "none";
    translateBox.style.backgroundColor = "#252424";
    translateBox.style.color = "white";

    try{
        clickedElement.appendChild(translateBox);
        // getTranslateResult(text, 'en');
        // main();
        // chrome.runtime.onMessage.addListener(gotMessage)
        let max_len = 1500
        if(text.length > max_len){
            let error_text = "Only can translate up to " + max_len + " characters at once."
            // console.error(error_text)
            $(translateBox).text(error_text);
            return false
        }      
        // console.log("text2", text)
        chrome.runtime.sendMessage({//goes to bg_page.js. 크롬 익스텐션에서는 그냥 sendMessage 보내면 backgroud.js로 보내는걸로 정해져 있는듯함
                source_text: text,
                target_lang: "ko"
            },
            function(response) {
                // papago에 바로 요청할 때
                // if (response.translated_text != undefined){
                //     console.log(response.api_rescode)
                //     $(translateBox).text("✔ " + response.translated_text);
                // }else{
                //     console.log(response.error);
                //     $(translateBox).text(response.error);
                // }


                if (response.translated_text != undefined){  // ok
                    $(translateBox).text("✔ " + response.translated_text);

                }else{
                    if (response.api_rescode != undefined){  // heroku는 괜찮은데 papago 문제일 때
                        console.log(response.api_rescode);
                        error_msg = convert_papago_error_to_msg(response.api_rescode); //, "❗ ")
                        $(translateBox).text(error_msg);
                    }else{
                        console.log(response.error);
                        $(translateBox).text(response.error);
                    }
                }
                    
                // console.log(response);  
        }); 
        
    }finally{
        $(".borderBox").remove();
        // console.log(translateBox);
    }
}


function convert_papago_error_to_msg(error_code, prefix=''){
    if (error_code == '401'){
        error_msg = "🔎 Authentication failed: Please check your 'Naver API application info(Client ID and Client Secret)' in the option popup";
    }else if (error_code == '403'){
        error_msg = "🔎 Don't have the 'Papago Translation API' permission: Please access the Naver Developer Center website(https://developers.naver.com/apps), and check 'Papago Translation' is added in the 'API setting' tab.";
    }else if (error_code == '429'){
        error_msg = "⏳ Used up all your daily usage: This translator use Naver Papago API which provide only 10,000 characters translation per a day.";
    }else{
        error_msg = "❗ Error: Some problem occured at Naver Papago API application. Please try it again later";
    };
    return prefix + error_msg
}

function getText(node, lineSeparator){
    let text = "";
    while(node != null){
        if(node.nodeType == Node.TEXT_NODE){
            text += removeLineSeparator(node.nodeValue) // node.nodeValue.trim();
        }else if(node.nodeType == Node.ELEMENT_NODE){
            if($(node).is(':visible')){
                let childText = ""; 
                if(node.firstChild != null){
                    if(node.parentNode.nodeName == "SELECT" && node.nodeName == "OPTION"){
                        // Get selected option text only
                        if(node.parentNode[node.parentNode.selectedIndex] == node){
                            childText = getText(node.firstChild, lineSeparator);
                        }
                    }else{
                        childText = getText(node.firstChild, lineSeparator);
                    }
                }

                if(childText != ""){
                    text += removeLineSeparator(childText);
                }

                if(node.nodeName == "BR" || window.getComputedStyle(node, null).display.indexOf("inline") === -1){
                    text += lineSeparator;
                }
            }
        }

        node = node.nextSibling;
    }

    return text.trim();
}

function removeLineSeparator(text){
    return text.replace(/\n/g, ' ');
}

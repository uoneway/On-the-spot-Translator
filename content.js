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
    sourceBox.style.border = "solid 2px gold";
    sourceBox.style.borderRadius = "5px";
    // sourceBox.style.fontSize = "smaller";
    sourceBox.style.zIndex = "99999";
    sourceBox.style.pointerEvents = "none";
    document.body.appendChild(sourceBox);
    
    //$(borderBox).fadeIn(300, "swing").delay(500).fadeOut(500, "swing");
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

    let text = getText(clickedElement.firstChild, "\r\n").trim();  
    
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
        if(text.length > 1000){
            let error_text = "Only can translate up to 1,000 characters at once."
            // console.error(error_text)
            $(translateBox).text(error_text);
            return false
        }      

        chrome.runtime.sendMessage({//goes to bg_page.js. 크롬 익스텐션에서는 그냥 보내면 backgroud.js로 보내는걸로 정해져 있는듯함
                source_text: text,
                target_lang: "ko"
            },
            function(response) {
                if (response.translated_text != undefined){
                    $(translateBox).text(response.translated_text);
                }else{
                    console.log(response.error);
                    $(translateBox).text(response.error);
                }
                    
                // console.log(response);  
        }); 
        
    }finally{
        $(".borderBox").remove();
        // console.log(translateBox);
    }
}

function getText(node, lineSeparator){
    let text = "";
    while(node != null){
        if(node.nodeType == Node.TEXT_NODE){
            text += node.nodeValue.trim();
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
                    text += childText;
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

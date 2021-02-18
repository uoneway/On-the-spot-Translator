(function(){
    var metaKey;
    
    updateMetaKey();
    
    chrome.storage.onChanged.addListener(function(changes, areaName){
        if(areaName == "sync"){
            updateMetaKey();
        }
    })

    document.addEventListener("mouseover", function(event){
        if((event.altKey && metaKey == "Alt")
            || (event.ctrlKey && metaKey == "Ctrl")
            || (event.shiftKey && metaKey == "Shift")) { 
            drawSourceBox(event.target);
            event.preventDefault();
        }
    }, false);

    function updateMetaKey(){
        chrome.storage.sync.get({
            metaKey: 'Alt',
        }, function(items) {
            metaKey = items.metaKey;
        });
    };

    function drawSourceBox(overedElement){
        // Remove before sourceBox
        $(".sourceBox").remove();
        
        var rect = overedElement.getBoundingClientRect();
        var sourceBox = document.createElement("div");
        sourceBox.className = "sourceBox";
        sourceBox.style.position = "absolute";
        sourceBox.style.top = (rect.top + window.scrollY) + "px";
        sourceBox.style.left = (rect.left + window.scrollX) + "px";
        sourceBox.style.width = (rect.width - 4) + "px";
        sourceBox.style.height = (rect.height - 4) + "px";
        sourceBox.style.border = "solid 2px gold";
        sourceBox.style.borderRadius = "5px";
        sourceBox.style.zIndex = "99999";
        sourceBox.style.pointerEvents = "none";
        document.body.appendChild(sourceBox);
        
        //$(borderBox).fadeIn(300, "swing").delay(500).fadeOut(500, "swing");
        // console.log(text.trim());
    }

})();

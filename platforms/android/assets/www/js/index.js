//Customizaed functions used for loading the HTML DOM
function refreshCnt(cnt){
    $("#Counter1").text(String(cnt));
    $("#Counter2").text(String(cnt));
    $("#Counter3").text(String(cnt));
    $("#Counter4").text(String(cnt));
    $("#Counter5").text(String(cnt));
    $("#Counter6").text(String(cnt));
}

function flyTocart(imgPath,event){
    var offset = $("#end").offset();
    var flyer = $('<img class="u-flyer" width="25%" src="'+imgPath+'" >'); 
        flyer.fly({ 
            start: { 
                left: event.pageX-30, //start to fly at X position(clicking position) 
                top: event.pageY-30 //start to fly at Y position(clicking position) 
            }, 
            end: { 
                left: offset.left-20, //end position X 
                top: offset.top+20, //end position Y 
                width: 15, //the ending width of picture
                height: 15 //the ending height of picture 
            }, 
            onEnd: function(){ //at the end 
                this.destory(); //destory the flyer 
            } 
        }); 

} 

function refreshCart(){
    $("#cartDIV").html("");
    console.log("in refreshCart.");  

    $(".proPic.selected").each(function(){
        // console.log("data-product-selected.");
        var parentDiv=$(this).parent().parent();
        var newDiv=parentDiv.clone(true);

        console.log(parentDiv);

        newDiv.attr("style","float:left; display:inline")

        var newSpan=newDiv.find("span");  //findall span elements
        newSpan.removeAttr("class");
        newSpan.unbind("click");
        // newSpan.attr("style","display:none"); //hide the span

        var newimg=newDiv.find("img");
        newimg.removeAttr("class");
        newimg.attr("width","55%");
        newimg.unbind("click");
        // var newspan=newDiv.find("span")[0];
        // newspan.unbind("click");
        $("#cartDIV").append(newDiv);

    });

}


function CreatOpenDB(){
    appDB = openDatabase('appDB', '1.0', 'Local_App_DB', 2 * 1024 * 1024);

}

function initiateDB(){
    appDB.transaction(function (tx) {  
       tx.executeSql('CREATE TABLE IF NOT EXISTS FLYERS(id unique, log)');
       tx.executeSql('INSERT INTO LOGS (id,log) VALUES (?, ?'), [e_id, e_log];
    });

}



//Application original framework, used for further application after loading cordova device libraries
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        //adding code here, initiating user functions...

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();



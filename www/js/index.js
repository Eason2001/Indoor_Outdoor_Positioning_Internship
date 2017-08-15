//----------------------for global setting/variables---------------------------
var count = 0;
var appDB;
//use default location when it is not allowed to access user's location
var currentLocation={lat: 42.304672, lng: -83.062009}; 
var map;
var service;
var placeFound=[];  //used to store the suitable places after filtering the original searching results
var placeCount=0;
// the placeFound and placeFound_Detail are different: placeFound is a list of places, 
var flyerNUM=3;  //it has to be matched with the number of flyers in #NBList page, means to get 3 places detail info 
var detailPlaces=[]; //used to store the detail info for these 3 places mentioned above
var detailPlacesCnt=0; //used to count the detailPlaces
var flyerClick=0; //used to record the index of a place that user clicked, default set to 0

//----------------------for integrating google map API---------------------------

//fixing the bug: for the first time loading map, it only display partially
// before refresh the map, need to check if the map has already been created
function refreshMap() {
    if (map) {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center); 

    }

}

// preparing the map size to device-heights to adapt to different devices
function resizeMap() {
    // eq() index selector 

    var canvasHeight = window.innerHeight *0.50;
    var styleStr = "height:" + canvasHeight + "px;width:100%";

    $("#map_canvas").attr("style",styleStr);

}


// filling the flyers with n places: one place for one flyer, m pictures within one place for one flyer
function fillFlyers(places, n, m) {
    console.log("The count for found places is:" + placeCount);
    console.log("The count for places that have detail info is:" + detailPlaces.length);
    var htmlStr;
    var phoUrl;
    var idStr;
    for (var i = 0; i < n; i++) {
        //到此。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。

        htmlStr='<h6>' + places[i].name+'</h6>';
        idStr='#flyer'+ String(i+1)+'-name';
        $(idStr).html(htmlStr);                    
        console.log(htmlStr);
        // console.log(places[i].place_id);
        var photos=places[i].photos;
        // console.log("The length of photos array for the place NO:" + String(i)+ " is: "+ photos.length);
        for (var j = 0; j < m; j++) {
            //only a detail place returned by getDetails() could have up to 10 photos, textSearch, searchNearby only return 1 photo
            phoUrl=photos[j].getUrl({'maxWidth': 60, 'maxHeight': 60});
            htmlStr='<img id="flyer'+ String(i+1)+'-Pic'+String(j+1)+'" class="coverPic" src="'+ phoUrl + '"/>';
            idStr='#flyer'+ String(i+1)+'-Div'+ String(j+1);
            $(idStr).html(htmlStr);
            console.log("Setting the URL for an IMG: " + htmlStr);
            // <img id="flyer1-Pic1"  width="80%" />
        };
        idStr='#flyer'+ String(i+1)+'-a';
        // can not treated a jQuery object like a DOM element. jQuery objects don't have a getAttribute method. You can either use .attr or .data instead. $(idStr) is to create an jQuery object based on the DOM element.
        $(idStr).on('click',(function(i){
                    return function (){
                        flyerClick=i;
                        console.log("flyerClick is set to be: " + flyerClick);

                    }
        
            })(i));

     


    };
    // <span id="flyerxx-name">xx</span><a href="#proDetail" >
    //   <img id="flyerxx-coverPicxx" class="coverPic" src="xx"/>...
    //   <img id="flyerxx-coverPicxx" class="coverPic" src="xx"/>
    //  </a>
    //  
        //  marker.addListener('click', (function(marker, i) {
        //     return function() {
        //         $("#map_debug").html("<h3>Debugs: clicking marker: </h3>" + String(i) + " " + places[i].name); 
        //         infowindow.setContent(places[i].name);
        //         infowindow.open(map, marker);
        //     }
        // //to remember each click for i
        // })(marker, i));

}


// filling the product list with recorded flyerClick. flyerClick: record the place index that user click on page #NBList, m pictures within this place
function fillProList(places, flyerClick, m) {
    console.log("filling the product list with the index:" + String(flyerClick));
    var htmlStr;
    var phoUrl;
    var idStr;

    htmlStr='<h4>' + places[flyerClick].name+'</h4>';
    idStr='#provider-name';
    $(idStr).html(htmlStr);                    
    console.log(htmlStr);
    var photos=places[flyerClick].photos;
    // console.log("The length of photos array for the place NO:" + String(i)+ " is: "+ photos.length);
    for (var j = 0; j < m; j++) {

        phoUrl=photos[j].getUrl({'maxWidth': 100, 'maxHeight': 100});
        // htmlStr='<img id="flyer'+ String(i+1)+'-Pic'+String(j+1)+'" class="coverPic" src="'+ phoUrl + '"/>';
        idStr='#proPic'+ String(j+1);
        $(idStr).attr("src",phoUrl);
        console.log("Setting the src for an IMG: " + phoUrl);
        // <img id="flyer1-Pic1"  width="80%" />
    };
    

}

// looking for num places that at least have 6 photos in places list, then call fillFlyers() to filling flyers
function getPlacesDetail(places, num, callbackFunc) {
    var service = new google.maps.places.PlacesService(map);
    for (var i = 0; i < places.length; i++) {
        pID=places[i].place_id;
        // if (places.length!=i+1) {
        service.getDetails({ placeId: pID }, function(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var photos=place.photos;
                if (photos.length<6) {
                    // console.log("This place does not have 6 photos, return directly.");                                
                    return;  //this place does not have 6 photos, return directly
                } else if (detailPlacesCnt>=num) {
                    // console.log("Already found num places, program will return directly.");
                    return;
                } else {
                    // adding a newly found place into detailPlaces[]
                    detailPlaces[detailPlacesCnt]=place;
                    detailPlacesCnt=detailPlacesCnt+1;
                    // console.log("get a place that has at least 6 photos, place_id is: " + place.place_id );

                    //call callbackFunc at once when it found num places that meets the requirement
                    if (detailPlacesCnt==num)
                    {// console.log("Already found num places, program will call fillFlyers() and return.");
                        callbackFunc(detailPlaces, 3, 6);   };

                }

            }

        }); 

    };
    //after obtaining the detail info for certain places, call the fillFlyers() to fill the flyers 
    
}


function createMarkers(places) {
    $("#map_debug").html("<h3>Debugs: initiating the createMarker...</h3>");  
    //firstly create the only one marker for the user's location:                
    var usermarker = new google.maps.Marker({
        map: map,
        position: currentLocation,
    });
    var userinfowindow = new google.maps.InfoWindow();
    usermarker.addListener('click', function() {
        $("#map_debug").html("<h3>Debugs: clicking usermarker: </h3>"); 
        userinfowindow.setContent("Your Location:");
        userinfowindow.open(map, this);
    });                    

    // var placeLoc = place.geometry.location;

    for (var i = 0; i < places.length; i++) {
        var marker = new google.maps.Marker({
          map: map,
          position: places[i].geometry.location,
          title: places[i].name,
          icon: places[i].photos[0].getUrl({'maxWidth': 35, 'maxHeight': 35})
        });
        var infowindow = new google.maps.InfoWindow();
        $("#map_debug").html("<h3>Debugs: initiating the clicking event for marker: </h3>" + String(i) + " " + places[i].name);
        // google.maps.event.addListener(marker, 'click', function() {
        //     infowindow.setContent(place.name);
        //     infowindow.open(map, this);
        //     $("#map_debug").html("<h3>Debugs: finishing the clicking event...</h3>"); 
        // });
        //very important for distinguish the different marker
        marker.addListener('click', (function(marker, i) {
            return function() {
                $("#map_debug").html("<h3>Debugs: clicking marker: </h3>" + String(i) + " " + places[i].name); 
                infowindow.setContent(places[i].name);
                infowindow.open(map, marker);
            }
        //to remember each click for i
        })(marker, i));

    };

}

//filtering and the original searching results
function filterPlaces(places) {
    var photos;
    for (var i = 0; i < places.length; i++) {
        //filtering condition: only a place that has at least one photo would be stored for futrue use,
        //or else continue and process next place
        photos = places[i].photos;

        if (!photos) {
            continue;
        } else {
            // storing the found places for futrue use, like obtaining its detail info and storing into database
            placeFound[placeCount]=places[i];   
            // placeCount plus 1;
            placeCount=placeCount+1;                       
            // console.log("In filterPlaces func, the length for place NO: " + String(i) + " is: "+photos.length);

        }

    };
    
}


function searchCallback(results, status) {

    $("#map_debug").html("<h3>Debugs: initiating the callback...</h3>");    
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        $("#map_debug").html("<h3>Debugs: Places Service Status OK...</h3>"); 
        //passing the original searching results to storePlaces
        filterPlaces(results);
        createMarkers(placeFound);
        // looking for flyerNUM=3 places that at least have 6 photos in placeFound list, then call fillFlyers() to filling flyers                    
        getPlacesDetail(placeFound, flyerNUM, fillFlyers);

    }; 
    if (status == google.maps.places.PlacesServiceStatus.ERROR) {
        $("#map_debug").html("<h3>Debugs: Places Service Status: ERROR...</h3>"); 

    };
    if (status == google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
        $("#map_debug").html("<h3>Debugs: Places Service Status:  INVALID_REQUEST...</h3>"); 
    };
    if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
        $("#map_debug").html("<h3>Debugs: Places Service Status: OVER_QUERY_LIMIT...</h3>"); 
    };

    if (status == google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
        $("#map_debug").html("<h3>Debugs: Places Service Status:  REQUEST_DENIED...</h3>"); 
    };

    if (status == google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR) {
        $("#map_debug").html("<h3>Debugs: Places Service Status:  UNKNOWN_ERROR...</h3>"); 
    }; 
    
    if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        $("#map_debug").html("<h3>Debugs: Places Service Status:  ZERO_RESULTS...</h3>"); 
    };  

}





function initMap() {
    //default location Innovation Center: {lat: 42.304672, lng: -83.062009}
    $("#map_debug").html("<h3>Debugs: initiating the map...</h3>"); 
    map = new google.maps.Map(document.getElementById('map_canvas'), {
      center: currentLocation,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    //refreshMap can not have the "()" or else it can not be run properly
    google.maps.event.addDomListener(window, "resize", refreshMap);
    // infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    var request = {
        location: currentLocation,
        radius: '500',
        query: 'restaurant'
    };

    service.textSearch(request, searchCallback);                

}


function getCurrentLocation(callbackFunc) {

    if (navigator.geolocation) {
        $("#map_debug").html("<h3>Debugs: start to get the currentLocation.</h3>");

        navigator.geolocation.getCurrentPosition(function(position) {
            currentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            // $("#map_debug").html("Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude );
            $("#map_debug").html("Latitude: " + currentLocation.lat + "<br>Longitude: " + currentLocation.lng );
            //when obtaining the currentLocation successfully, callback to initMap()
            callbackFunc();

        }, function(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                $("#map_debug").html("User denied the request for Geolocation, use default location.");
                //when fail to get the currentLocation, callback to initMap() using default location
                callbackFunc();                         
                break;
            case error.POSITION_UNAVAILABLE:
                $("#map_debug").html("Location information is unavailable, use default location.");
                callbackFunc();
                break;
            case error.TIMEOUT:
                $("#map_debug").html("The request to get user location timed out, use default location.");
                callbackFunc();
                break;
            case error.UNKNOWN_ERROR:
                $("#map_debug").html("An unknown error occurred, use default location.");
                callbackFunc();
                break;
        }                    
        // handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
      // Browser doesn't support Geolocation, use the default location
      $("#map_debug").html("<h3>Error: Your browser/device doesn\'t support geolocation.</h3>"); 
      callbackFunc();

    }

}

//-----------------------------for picture processing----------------------------------
//for futre use, do not remove:
// function fadeIn(obj){
//     $(obj)
//         .css('opacity', 0)
//         .show()
//         .animate({
//             opacity: 1
//         }, 2000);
// }

//for futre use, do not remove:
// function thumbPics(picClass,width,height) {
//     if (!width||!height) {
//         width='35px';
//         height='35px';
//     };
//     // eg. img.coverPic
//     $(picClass).jqthumb({
//         classname  : 'jqthumb',          // class name. DEFUALT IS jqthumb
//         width      : width,             // new image width after cropping. DEFAULT IS 100px.
//         height     : height,             // new image height after cropping. DEFAULT IS 100px.
//         position   : {
//             x : '50%',                   // x position of the image. DEFAULT is 50%. 50% also means centerize the image.
//             y : '50%'                    // y position of the image. DEFAULT is 50%. 50% also means centerize the image.
//         },
//         source     : 'src',              // to specify the image source attribute. DEFAULT IS src.
//         show       : TRUE,              // TRUE = show immediately after processing. FALSE = do not show it. DEFAULT IS TRUE.
//         responsive : 20,                 // used by older browsers only. 0 to disable. DEFAULT IS 20
//         zoom       : 1,                  // zoom the output, 2 would double of the actual image size. DEFAULT IS 1
//         method     : 'auto',             // 3 methods available: "auto", "modern" and "native". DEFAULT IS auto
//         before     : function(oriImage){ // callback before each image starts processing.
//             console.log("I'm about to start processing now...");
//         },
//         after      : function(imgObj){   // callback when each image is cropped.
//             console.log(imgObj);
//         },
//         done       : function(imgArray){ // callback when all images are cropped.
//             for(i in imgArray){
//                 $(imgArray[i]).fadeIn();
//             }
//         }
//     });
// 
// 
// }


//-----------------------------for shopping cart----------------------------------
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

        //unbind the checkbox event
        var newSpan=newDiv.find("span");  //findall span elements
        newSpan.removeAttr("class");
        newSpan.unbind("click");
        // newSpan.attr("style","display:none"); //hide the span

        //unbind the .img.proPic click event(adding to cart, refreshCnt, flyTocart,refreshCart etc ...)
        var newimg=newDiv.find("img");
        newimg.removeAttr("class");
        newimg.attr("width","95%");
        newimg.unbind("click");
        // var newspan=newDiv.find("span")[0];
        // newspan.unbind("click");
        $("#cartDIV").append(newDiv);

    });

}

//-----------------------------for local database----------------------------------
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



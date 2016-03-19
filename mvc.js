var model = (function(){
  // getting a model, but it doesn't seem to have the characteristics? need to better understand this problem/
})();

var view = (function(){


  function init(){
    cacheDom();
  }

  events.on("refreshTimer", refreshLeaderboard);

  function cacheDom(){
    this.$el = $(".container");
    this.$workout_header = this.$el.find("#workout_header");
    this.$workout_title = this.$workout_header.find('h1');
    this.$date_box = this.$workout_header.find('#date_box');
    this.$reporting_box = this.$workout_header.find('#reporting_box');
  }

  function refreshLeaderboard(model){
    logSuccess();
    drawHeader(model);
  }

  function logSuccess(){
    console.log("success");
  }

  function drawHeader(model){
    this.$workout_title.html(model["workoutTitle"] + " LEADERS");
    this.$date_box.html("Date: " + model.date);
    this.$reporting_box.html("Reporting: " + model.results.length);
  }

  init();

  // listen for model updates
  // listen for updateViews calls
  
})();

var controller = (function( model, view, events ){
  
   // tells controller about the model and view modules, which need to be included in this page
  this.model = model;
  this.view = view;
  this.events = events;
 
  // initialize the leaderboard
  function init(){
    // get the model for the first time and assign the model that info
    initializeModel();
    initializeTimers();
  }

  function initializeModel(){
    var aj = $.ajax({
      url: "https://apis.trainheroic.com/public/leaderboard/468425",
      type: 'GET',
      dataType: "json", 
      error: function( xhr, status, errorThrown ){
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
      },
      success: function(data){
        setModel(data);

      },
      complete: function( xhr, status ) {
        console.log( "The ajax request is complete!" );
      },
      timeout: 5000
    });
  }

  // sets model (should this be within the model module though?)
  function setModel(rawData){
    model = rawData;
    console.log(model);
    console.dir(model);
  }

  // intialize timers (for refreshing board and for updating the model)
  function initializeTimers(){
    var refreshBoardTimer = setInterval(emitRefresh, 10000); // every 10 seconds going to refresh the board
    //var modelUpdateTimer = setInterval(, (10*60*1000)); // every 10 minutes, get the workout data again and update the workout model
  };

  // send a refresh event
  function emitRefresh(){
    console.log("In emit refresh, the model is:" + model);
    events.emit("refreshTimer", model);
  }

  function updateModel(workoutData){
    model = workoutData;
    console.log(model);
  };


  function refreshLeaderBoard(){
    events.emit("refresh", getNext10);
  }

  function getNext10(){
    // get the next 10 in the model
    return '{"userFirstName":"Jaxon","userFirstInitial":"J","userLastName":"Hughes","userLastInitial":"H","username":"hugjax19","profileImg":"https:\/\/s3-us-west-2.amazonaws.com\/trainheroic-prod\/images\/defaults\/1.png","profileUrl":"https:\/\/athlete.trainheroic.com\/#\/profile\/hugjax19","userId":14326,"saved_workout_date":null,"rating":false,"rank":2,"avgRank":2,"tests":["80 (RX)"],"ranks":[2],"initials":"JH"}'
  }

  init();

})(model, view, events);
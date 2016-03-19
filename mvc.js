var model = (function(){
  // getting a model, but it doesn't seem to have the characteristics? need to better understand this problem/
})();

var view = (function(){

  // initialize view, cache common DOM elements, and subscribe to the refresh page event
  function init(){
    cacheDom();
    events.on("refreshModel", drawHeader);
    events.on("refreshRankings", drawRankings);
  }

  // store commonly used DOM elements 
  function cacheDom(){
    // header elements
    this.$el = $(".container");
    this.$workout_header = this.$el.find("#workout_header");
    this.$workout_title = this.$workout_header.find('h1');
    this.$date_box = this.$workout_header.find('#date_box');
    this.$reporting_box = this.$workout_header.find('#reporting_box');
    this.$displaying = this.$workout_header.find("#displaying");

    // table elements
    this.$leaderboard = this.$el.find("#leaderboard");
    this.$tbody = this.$leaderboard.find("tbody");

  }

  function clearRankings(){
    $tbody.html('');
  }

  function drawRankings(results){
    clearRankings();
    logSuccess();

    for(var index = 0; index < results.length; index ++){
      var user = results[index];
      $tbody.append('<tr><td>'+(user.rank)+'</td><td><img class="responsive-img circle" src="' + user.profileImg + '"></td><td>'+ user.userFirstName +' ' + user.userLastInitial + '</td><td>' + user.tests[0] +'</td></tr>');
    }
    // intresting, because really the controller should specify which chunk of the results to include... 
    // maybe break it up as follows:
      // only update the header when the model is updated
      // when refreshing the rankings, only send the results that are relevant
      // this allows you to do 2 different pubsub events
  }

  // for debugging
  function logSuccess(){
    console.log("success");
  }

  // draw the header box
  function drawHeader(model){
    this.$workout_title.html(model["workoutTitle"] + " LEADERS");
    this.$date_box.html("Date: " + model.date);
    this.$reporting_box.html("Reporting: " + model.results.length);
    this.$displaying.html("<em>(displaying x of y)</em>");
  }

  init();
  
})();

var controller = (function( model, view, events ){
  
  // initialize the leaderboard
  function init(){
      // tells controller about the model and view modules, which need to be included in this page
      this.model = model;
      this.view = view;
      this.events = events;
      this.pagesToCycleThrough = 0; // state variable with the 0-indexed # of pages to cycle through
      this.currentPage = 0; // state variable with the current page
      this.listingsPerPage = 10; // state var with listings per page, if you choose to change the design
    // get the model for the first time and assign the model that info
    updateModel();
    initializeTimers();
  }

  function updateModel(){
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
    initializeCounter(model.results.length);
    events.emit("refreshModel", model);
  }


  function initializeCounter(numEntries){
    pagesToCycleThrough = Math.round(numEntries / listingsPerPage);
    if( numEntries % listingsPerPage == 0){
      pagesToCycleThrough -= 1;
    }
    console.log("pagesToCycleThrough = " + pagesToCycleThrough);
  }

  // intialize timers (for refreshing board and for updating the model, header)
  function initializeTimers(){
    var refreshBoardTimer = setInterval(rotateRankings, 3000); // every 10 seconds going to refresh the board
    var modelUpdateTimer = setInterval(updateModel, (10*60*1000)); // every 10 minutes, get the workout data again and update the workout model
  };

  function rotateRankings(){
    // have number of chunks
    var results = model.results
    var firstElementIndex = currentPage*listingsPerPage;
    var lastElementIndex = firstElementIndex + listingsPerPage - 1;
    var rankings = results.slice(firstElementIndex, lastElementIndex);
    console.log("firstElementIndex: " + firstElementIndex);
    console.log("lastElementIndex: "+ lastElementIndex);
    console.log("rankings: " + rankings);
    // rotate through the chunks
    // return them to the rankings vairable
    advanceCurrentPageCounter();
    emitRefresh(rankings);
  }

  function advanceCurrentPageCounter(){
    currentPage += 1;
    if(currentPage > pagesToCycleThrough){
      currentPage = 0;
    }
  }

  // send a refresh event
  function emitRefresh(rankings){
    events.emit("refreshRankings", rankings);
  }

  init();

})(model, view, events);
var model = (function(){
 // do I even need this?
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
      // may want to replace this ugly string with Mustache
    }
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
      this.refreshInterval = 5000; // config variable to set the interval at which you switch pages
      this.updateModelInterval = (10*60*1000); // config variable to set the interval at which you refresh the ajax call
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
    var refreshBoardTimer = setInterval(rotateRankings, refreshInterval); 
    var modelUpdateTimer = setInterval(updateModel, updateModelInterval); 
  };

  function rotateRankings(){
    // have number of chunks
    var firstElementIndex = currentPage*listingsPerPage;
    var lastElementIndex = firstElementIndex + listingsPerPage - 1;
    var rankings = model.results.slice(firstElementIndex, lastElementIndex);
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
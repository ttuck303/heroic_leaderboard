var model = (function(){
 // do I even need this?
})();

var view = (function(){

  // initialize view, cache common DOM elements, and subscribe to the refresh page event
  function init(){
    cacheDom();
    events.on("refreshModel", drawHeader);
    events.on("refreshRankings", drawRankings);
    events.on("refreshModel", intializeTicker);
    events.on("updateTicker", updateTicker);
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

    // preloader
    this.$preloader = this.$el.find(".loading");

    // ticker
    this.$ticker = this.$el.find("#ticker");
    this.$ticker_contents = this.$ticker.find(".ticker_contents");
  }


  // rankings-related methods
  function clearRankings(){
    $tbody.html('');
  }

  function drawRankings(results){
    $preloader.remove();
    clearRankings();
    for(var index = 0; index < results.length; index ++){
      var user = results[index];
      $tbody.append('<tr><td>'+(user.rank)+'</td><td><img class="responsive-img circle" src="' + user.profileImg + '"></td><td>'+ user.userFirstName +' ' + user.userLastInitial + '</td><td>' + user.tests[0] +'</td></tr>');
      // may want to replace this ugly string with Mustache
    }
  }

  // draw the header box
  function drawHeader(model){
    this.$workout_title.html(model["workoutTitle"] + " LEADERS");
  }

  // ticker-related methods
  function intializeTicker(model){
    clearTicker();
    $ticker_contents.append('<span class="ticker_info_unit">DATE: ' + model.date + '</span>');
    $ticker_contents.append('<span class="ticker_info_unit">ATHLETES REPORTING: ' + model.results.length + '</span>');
  }

  function clearTicker(){
    $ticker_contents.html('');
  }

  function updateTicker(){
    $ticker_contents.css({ "left": "-=.15vw" });
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

    // state variables 
    this.pagesToCycleThrough = 0; // state variable with the 0-indexed # of pages to cycle through
    this.currentPage = 0; // state variable with the current page
    this.listingsPerPage = 5; // state var with listings per page, if you choose to change the design
    this.refreshInterval = 5000; // config variable to set the interval at which you switch pages
    this.updateModelInterval = (10*60*1000); // config variable to set the interval at which you refresh the ajax call
    this.tickerSpeed = 16; // pace at which ticker update is called, about 60hz which is tv refresh rate
    
    // gets the model data for the first time and starts the timers
    updateModel();
    initializeTimers();
  }

  // ajax call to backend for json workout data
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

  // sets model (should this be within the model module?)
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
  }

  // intialize timers (for refreshing board and for updating the model, header)
  function initializeTimers(){
    var refreshBoardTimer = setInterval(rotateRankings, refreshInterval); 
    var modelUpdateTimer = setInterval(updateModel, updateModelInterval);
    var tickerTimer = setInterval(updateTicker, tickerSpeed); 
  };

  function updateTicker(){
    events.emit("updateTicker", model);
  }

  function rotateRankings(){
    var firstElementIndex = currentPage*listingsPerPage;
    var lastElementIndex = firstElementIndex + listingsPerPage;
    var rankings = model.results.slice(firstElementIndex, lastElementIndex);
    advanceCurrentPageCounter();
    emitRankingRefresh(rankings);
  }

  function advanceCurrentPageCounter(){
    currentPage += 1;
    if(currentPage >= pagesToCycleThrough){
      currentPage = 0;
    }
  }

  // send a ranking refresh event
  function emitRankingRefresh(rankings){
    events.emit("refreshRankings", rankings);
  }

  init();

})(model, view, events);
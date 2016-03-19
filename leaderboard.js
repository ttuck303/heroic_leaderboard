$(function(){
  console.log("jquery ready");  
  getWorkoutData();
});

function getWorkoutData(){
  $.ajax({
    url: "https://apis.trainheroic.com/public/leaderboard/468425",
    type: 'GET',
    dataType: "json", 
    success: function(response){
      parseWorkoutData(response);
    },
    error: function( xhr, status, errorThrown ){
      alert( "Sorry, there was a problem!" );
      console.log( "Error: " + errorThrown );
      console.log( "Status: " + status );
      console.dir( xhr );
    },
    complete: function( xhr, status ) {
      alert( "The request is complete!" );
    },
    timeout: 5000
  });
}

var leaderboard = (function(){
  var controller = {
    model: Model,
    view: View

    initialize: function(){
      // start a timer
      // get workout data - >get workout data (and assign it to model)
      // draw it in a view
      // every X minutes, get the data again
      // every Y seconds, rotate the leaderboard being shown
    },

    getWorkout: function(){
      $.ajax({
        url: "https://apis.trainheroic.com/public/leaderboard/468425",
        type: 'GET',
        dataType: "json", 
        success: function(response){
          parseWorkoutData(response);
        },
        error: function( xhr, status, errorThrown ){
          alert( "Sorry, there was a problem!" );
          console.log( "Error: " + errorThrown );
          console.log( "Status: " + status );
          console.dir( xhr );
        },
        complete: function( xhr, status ) {
          alert( "The request is complete!" );
        },
        timeout: 5000
      });
    }
  };
  var view = {

    setupTable: function(){

    }
  };
  var model = {};
  return {
    intialize: function() {
      controller().intialize();
    } // only method accessible outside
  }

});


// Initialize 
leaderboard().initialize();




function parseWorkoutData(workoutData){
  $("#workout_header h1").append(workoutData.workoutTitle + " LEADERS");
  $("#date_box").append("Date: " + workoutData.date);
  $("#reporting_box").append("Reporting: " + workoutData.results.length);
  for(var index = 0; index < workoutData.results.length; index ++){
    var user = workoutData.results[index];
    $("tbody").append('<tr><td>'+(index+1)+'</td><td><img class="responsive-img circle" src="' + user.profileImg + '"></td><td>'+ user.userFirstName +' ' + user.userLastInitial + '</td><td>' + user.tests[0] +'</td></tr>');
    //$("tbody").append(user.rank + " " + user.userFirstName + " " + user.userLastInitial + "<br>");
  };
}
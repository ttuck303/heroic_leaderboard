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


function parseWorkoutData(workoutData){
  for(var index = 0; index < workoutData.results.length; index ++){
    console.log(workoutData.results[index]);
    $("body").append(workoutData.results[index].userFirstName + "<br>");
  };
}
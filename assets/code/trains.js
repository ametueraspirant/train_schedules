// set up initial variables to be set to input classes and bring in the firebase.
var database = firebase.database();
var train_name = "";
var train_destination = "";
var train_time_first = 0;
var train_time_interval = 0;
// this is set to true when I want to reload the trains list. the script down at the bottom checks for true once a second. I also didn't want to be impolite so I asked please.
var please_reload = true;
// this activates when the register button is clicked or enter is pressed.
$("#register-train").on("click", function(event)
{
	// prevent default, very important I hear. Not sure exactly why.
	event.preventDefault();
	// check to see if any of the boxes haven't been filled in before executing.
	if ($("#train-name").val() !== '' && $("#train-destination").val() !== '' && $("#first-train").val() !== '' && $("#frequency").val() !== '')
	{
		// pull the values to variables to be used later.
		train_name = $("#train-name").val().trim();
		train_destination = $("#train-destination").val().trim();
		train_time_first = $("#first-train").val().trim();
		train_time_interval = $("#frequency").val().trim();

		// clear the values for neatness
		$("#train-name").val('');
		$("#train-destination").val('');
		$("#first-train").val('');
		$("#frequency").val('');

		// and push all that junk to the database.
		database.ref().push({
			name: train_name,
			destination: train_destination,
			first_time: train_time_first,
			interval: train_time_interval,
			add_date: firebase.database.ServerValue.TIMESTAMP
		});
	}
	else
	{
		// not so fast punk, you gotta do this right.
		alert("Hey you gotta fill out all the boxes.");
	}
});

// the meat and potatoes function. Everything else hinges on this working.
function render_trains(snapshot)
{

	// get the basic snapshots that don't need to be edited.
	var get_time = snapshot.val().first_time;
	var get_interval = snapshot.val().interval;

	// check if the first train time is in the past or in the future. doesn't account for dates.
	if (moment(get_time, "HH:mm").diff(moment(), "minutes") >= 0)
	{
		// var minutes_away = moment(get_time, "HH:mm").diff(moment(), "minutes");
		var minutes_away = moment(get_time, "HH:mm").diff(moment().subtract(1, "m"), "minutes");
	}
	else
	{
		var minutes_away = get_interval - (moment().diff(moment(get_time, "HH:mm"), "minutes") % get_interval);
	}

	// storing the variable for minutes to next arrival. This one didn't even break and I don't exactly know why, it just stores the minutes rather than formatting it to HH:mm.
	var next_arrival = moment().add(minutes_away, "minutes").format("HH:mm");

	// This mainly prettifies the code I originally had but here's a rundown
	var minute_td = $("<td>");
	// if the minutes exceeds an hour break down the time into hours and minutes, accounting for single hours or minutes
	if (minutes_away >= 60) {
		if (minutes_away < 120) {
			minute_td.text("1 hour");
		}
		else {
			minute_td.text(Math.floor(minutes_away / 60) + " hours");
		}
		
		if(minutes_away % 60 === 1)
		{
			minute_td.append(" & 1 minute");
		}
		else if(minutes_away % 60 === 0)
		{
			// filler space for prettiness because nothing happens here
		}
		else
		{
			minute_td.append(" & " + minutes_away % 60 + " minutes");
		}
	}
	// and if they don't just post the minutes, accounting for just one minute
	else
	{
		if(minutes_away % 60 === 1)
		{
			minute_td.text("1 minute");
		}
		else
		{
			minute_td.text(minutes_away + " minutes");
		}
	}
	//finally append all that stuff to a row including the fancy minutes td
	var new_tr = $("<tr>").append(
		$("<td>").text(snapshot.val().name),
		$("<td>").text(snapshot.val().destination),
		$("<td>").text(snapshot.val().interval),
		$("<td>").text(next_arrival),
		minute_td
	);
	//and send it off to the grid
	$("#train-schedules > tbody").append(new_tr);
}

// this replaces that other function and activates on page load or database update. the main logic is relegated tooooooooooo
// this for some reason needs to be either a .on and .off pair or a .once or the code will double post.
// the code inside the .on never seems to run except on page load because that's the only time it will print "this is true now".
// however if the .on or the .off is missing it will double post. TOTALLY IGNORING THE FACT THAT.
database.ref().on("value", function () {
	console.log("this is true now");
	please_reload = true;
});
database.ref().off();

// this hack job here shouldn't be running at all during any run unless it's the top of a minute or please_reload is set to true.
// WHICH IT NEVER IS BUT THE CODE FREAKING RUNS ANYWAY.
function update_clock()
{
	console.log(please_reload, moment().second());
	if(moment().second() === 0 || please_reload === true)
	{
		$("#train-schedules > tbody").empty();
		database.ref().on("child_added", render_trains);
		please_reload = false;
	}
}
setInterval(update_clock, 1000);
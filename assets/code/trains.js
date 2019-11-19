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
		var minutes_away = moment(get_time, "HH:mm").diff(moment(), "minutes");
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
database.ref().on("value", function () {
	please_reload = true;
});

// this hack job
// the original function was what is now on line 132 but I made sure to clear the train body so it can create from a blank slate
// it also for some reason still creates multiple entries visually on the train table a split second before all that is wiped away and replaced properly
// I don't know why this happens and it's mostly a visual bug now so I don't care too much about "fixing" it though I would love to know why it happens because I can't figure it out at all
// also I wasn't aware on "child_added" just ran if called like this because when the minute hits zero it shouldn't be updating the remote database at all but it runs anyway.
// I had to keep changing the line that the line 120 comment refers to because I kept pushing it down with comments and I'M DOING IT AGAIN BY EXPLAINING THIS
// I even had to update which line the line 124 comment refers to because line 119 and 120 used to be on the same line!
// I'M DOING IT AGAIN!
function update_clock()
{
	if(moment().second() === 0 || please_reload === true)
	{
		$("#train-schedules > tbody").empty();
		database.ref().on("child_added", render_trains);
		please_reload = false;
	}
}
setInterval(update_clock, 1000);
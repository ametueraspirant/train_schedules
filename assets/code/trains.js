var database = firebase.database();
var train_name = "";
var train_destination = "";
var train_time_first = 0;
var train_time_interval = 0;
var please_reload = true;

$("#register-train").on("click", function(event)
{
	event.preventDefault();

	train_name = $("#train-name").val().trim();
	train_destination = $("#train-destination").val().trim();
	train_time_first = $("#first-train").val().trim();
	train_time_interval = $("#frequency").val().trim();

	if ($("#train-name").val() !== '' && $("#train-destination").val() !== '' && $("#first-train").val() !== '' && $("#frequency").val() !== '')
	{
		$("#train-name").val('');
		$("#train-destination").val('');
		$("#first-train").val('');
		$("#frequency").val('');

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
		alert("Hey you gotta fill out all the boxes.");
	}
});

function render_trains(snapshot)
{

	var get_time = snapshot.val().first_time;
	var get_int = snapshot.val().interval;

	//check if the first train time is in the future.
	var minutes_away = get_int - (moment().diff(moment(get_time, "HH:mm"), "minutes")%get_int);
	var next_arrival = moment().add(minutes_away, "minutes").format("hh:mm");

	var new_tr = $("<tr>").append(
		$("<td>").text(snapshot.val().name),
		$("<td>").text(snapshot.val().destination),
		$("<td>").text(snapshot.val().interval),
		$("<td>").text(next_arrival),
		$("<td>").text(minutes_away + " minutes")
	);
	$("#train-schedules > tbody").append(new_tr);
}

database.ref().on("value", function () {
	please_reload = true;
});

function update_clock()
{
	console.log(moment().second());
	if(moment().second() === 0 || please_reload === true)
	{
		$("#train-schedules > tbody").empty();
		database.ref().on("child_added", render_trains);
		please_reload = false;
	}
}
setInterval(update_clock, 1000);
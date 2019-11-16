var database = firebase.database();
var train_name = "";
var train_destination = "";
var train_time_first = 0;
var train_time_interval = 0;

$("#register-train").on("click", function(event)
{
	event.preventDefault();

	train_name = $("#train-name").val().trim();
	train_destination = $("#train-destination").val().trim();
	train_time_first = $("#first-train").val().trim();
	train_time_interval = $("#frequency").val().trim();

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
});

database.ref().on("child_added", function(snapshot)
{
	console.log(snapshot);

	


	var new_tr = $("<tr>").append(
		$("<td>").text(),
		$("<td>").text(),
		$("<td>").text(),
		$("<td>").text()
	);
	$("#train-schedules > tbody").append(new_tr);
});

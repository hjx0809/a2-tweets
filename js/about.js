function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// 
	if (runkeeper_tweets.length === 0) {
    	document.getElementById("numberTweets").innerText = 0;
    	document.getElementById("firstDate").innerText = "N/A";
    	document.getElementById("lastDate").innerText = "N/A";

    	document.querySelectorAll(
        	".completedEvents, .liveEvents, .achievements, .miscellaneous, .written"
    	).forEach(function(element) {
        	element.innerText = 0;
    	});

    	document.querySelectorAll(
        	".completedEventsPct, .liveEventsPct, .achievementsPct, .miscellaneousPct, .writtenPct"
    	).forEach(function(element) {
        	element.innerText = "0.00%";
    	});

    	return;
	}

	// Create an array of Tweet objects from the raw tweet data
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	// Initialize both variables with the first Tweet object.
	// tweet_array[0].time means the time of the first tweet in the array. 
	// You can use this to get the date of the first tweet.
	var firstDate = tweet_array[0];
	var lastDate = tweet_array[0];

	// tweet_array.forEach(function(tweet) {
	// 	// Update firstDate if the current tweet is earlier than the firstDate
	// 	if(tweet.time < firstDate.time) {
	// 		firstDate = tweet;
	// 	}
	// 	// Update lastDate if the current tweet is later than the lastDate
	// 	if(tweet.time > lastDate.time) {
	// 		lastDate = tweet;
	// 	}
	// }

	for(var i = 0; i < tweet_array.length; i++) {
		// Update firstDate if the current tweet is earlier than the firstDate
		if(tweet_array[i].time < firstDate.time) {
			firstDate = tweet_array[i];
		}
		// Update lastDate if the current tweet is later than the lastDate
		if(tweet_array[i].time > lastDate.time) {
			lastDate = tweet_array[i];
		}
	}

	// The JavaScript function toLocaleDateString() may be helpful for formatting the dates.
	var dateFormat = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

	// Update the DOM with the first and last tweet dates.
	// Use getElementById to find and update the HTML elements.
	// The IDs "firstDate" and "lastDate" are defined in index.html.
	document.getElementById('firstDate').innerText = firstDate.time.toLocaleDateString('en-US', dateFormat);
	document.getElementById('lastDate').innerText = lastDate.time.toLocaleDateString('en-US', dateFormat);

	// Filter the tweet_array to get only the completed tweets
	var completedTweets = tweet_array.filter(function(tweet) {
		return tweet.source == "completed_event";
	});
	// Update the DOM with the number of completed tweets
	document.querySelectorAll(".completedEvents").forEach(function(element) {
		element.innerText = completedTweets.length;
	});

	// Calculate the percentage of completed tweets = (number of completed tweets / total number of tweets) * 100
	var completedPercentage = completedTweets.length / tweet_array.length * 100;
	// Update the DOM with the percentage of completed tweets
	// By using .toFixed(2), we can limit the number of decimal places to 2.
	document.querySelectorAll(".completedEventsPct").forEach(function(element) {
    	element.innerText = completedPercentage.toFixed(2) + "%";
	});

	// Filter the tweet_array to get only the live tweets
	var liveTweets = tweet_array.filter(function(tweet) {
		return tweet.source == "live_event";
	});
	// Update the DOM with the number of live tweets
	document.querySelectorAll(".liveEvents").forEach(function(element) {
		element.innerText = liveTweets.length;
	});
	// Calculate the percentage of live tweets = (number of live tweets / total number of tweets) * 100
	var livePercentage = liveTweets.length / tweet_array.length * 100;
	// Update the DOM with the percentage of live tweets
	document.querySelectorAll(".liveEventsPct").forEach(function(element) {
		element.innerText = livePercentage.toFixed(2) + "%";
	});

	var achievementTweets = tweet_array.filter(function(tweet) {
		return tweet.source == "achievement";
	});
	// Update the DOM with the number of achievement tweets
	document.querySelectorAll(".achievements").forEach(function(element) {
		element.innerText = achievementTweets.length;
	});
	// Calculate the percentage of achievement tweets = (number of achievement tweets / total number of tweets) * 100
	var achievementPercentage = achievementTweets.length / tweet_array.length * 100;
	// Update the DOM with the percentage of achievement tweets
	document.querySelectorAll(".achievementsPct").forEach(function(element) {
		element.innerText = achievementPercentage.toFixed(2) + "%";
	});

	
	var miscellaneousTweets = tweet_array.filter(function(tweet) {
		return tweet.source == "miscellaneous";
	});
	// Update the DOM with the number of miscellaneous tweets
	document.querySelectorAll(".miscellaneous").forEach(function(element) {
		element.innerText = miscellaneousTweets.length;
	});
	// Calculate the percentage of miscellaneous tweets = (number of miscellaneous tweets / total number of tweets) * 100
	var miscellaneousPercentage = miscellaneousTweets.length / tweet_array.length * 100;
	// Update the DOM with the percentage of miscellaneous tweets
	document.querySelectorAll(".miscellaneousPct").forEach(function(element) {
		element.innerText = miscellaneousPercentage.toFixed(2) + "%";
	});


	var tweetsWithComments = completedTweets.filter(function(tweet) {
		return tweet.written;
	});
	// Update the DOM with the number of tweets with comments
	document.querySelectorAll(".written").forEach(function(element) {
		element.innerText = tweetsWithComments.length;
	});
	// Calculate the percentage of tweets with comments = (number of tweets with comments / total number of tweets) * 100
	var commentsPercentage = 0;
	if (completedTweets.length > 0) {
    	commentsPercentage = tweetsWithComments.length / completedTweets.length * 100;
	}
	// Update the DOM with the percentage of tweets with comments
	document.querySelectorAll(".writtenPct").forEach(function(element) {
		element.innerText = commentsPercentage.toFixed(2) + "%";
	});

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});

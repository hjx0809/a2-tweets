function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
	
	// Filter the tweet_array to get only the completed tweets
	var completedTweets = tweet_array.filter(function(tweet) {
		return tweet.source == "completed_event";
	});
	// Create an array to hold the unique activity names
	var activityNames = [];
	completedTweets.forEach(function(tweet) {
		var activity = tweet.activityType;
		if(activity !== "unknown" && activityNames.indexOf(activity) === -1) {
			activityNames.push(activity);
		}
	});

	document.getElementById('numberActivities').innerText = activityNames.length;

	// create an array of objects that contains the activity name and the count of completed tweets for that activity
	var activityCounts = activityNames.map(function(activity) {
		var count = completedTweets.filter(function(tweet) {
			return tweet.activityType === activity;
		});

		return {activity: activity, count: count.length};
	});

	// sort the activityCounts array in descending order based on the count
	activityCounts.sort(function(a, b) {
		return b.count - a.count;
	});

	// update the DOM with the three most-tweeted activities
	document.getElementById('firstMost').innerText =
		activityCounts.length > 0 ? activityCounts[0].activity : "N/A";
	document.getElementById('secondMost').innerText =
		activityCounts.length > 1 ? activityCounts[1].activity : "N/A";
	document.getElementById('thirdMost').innerText =
		activityCounts.length > 2 ? activityCounts[2].activity : "N/A";

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityCounts
	  },
	  //TODO: Add mark and encoding
	  "mark": "bar",
      "encoding": {
	  	"x": {
    		"field": "activity",
            "type": "nominal"
        },
        "y": {
            "field": "count",
            "type": "quantitative"
        }
    }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.

	// Filter the completed tweets to get only the tweets for the top three activities
	var topActivityNames = activityCounts.slice(0, 3).map(function(activity) {
		return activity.activity;
	});
	var topActivityTweets = completedTweets.filter(function(tweet) {
		return topActivityNames.indexOf(tweet.activityType) !== -1 &&
			tweet.distance > 0;
	});

	// Create an array of objects that contains the activity name, distance, 
	// and time for each of the top three activities
	var distanceData = topActivityTweets.map(function(tweet) {
    	return {
        	activity: tweet.activityType,
        	distance: tweet.distance,
        	time: tweet.time
		};
	});

	var distance_vis_spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
        "values": distanceData
    },
    "mark": "point",
    "encoding": {
        "x": {
            "field": "time",
            "timeUnit": "day",
            "type": "ordinal",
            "title": "Day of the week"
        },
        "y": {
            "field": "distance",
            "type": "quantitative",
            "title": "Distance (miles)"
        },
        "color": {
            "field": "activity",
            "type": "nominal"
        }
    }
};

var meanDistanceSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
        "values": distanceData
    },
    "mark": "point",
    "encoding": {
        "x": {
            "field": "time",
            "timeUnit": "day",
            "type": "ordinal",
            "title": "Day of the week"
        },
        "y": {
            "field": "distance",
            "aggregate": "mean",
            "type": "quantitative",
            "title": "Mean distance (miles)"
        },
        "color": {
            "field": "activity",
            "type": "nominal"
        }
    }
};

vegaEmbed("#distanceVisAggregated", meanDistanceSpec, {actions: false});

vegaEmbed("#distanceVis", distance_vis_spec, {actions: false});

	// Start with individual distances; switch to means when clicked.
	var individualChart = document.getElementById("distanceVis");
	var meanChart = document.getElementById("distanceVisAggregated");
	var aggregateButton = document.getElementById("aggregate");
	var showMeans = false;
	meanChart.style.display = "none";
	aggregateButton.innerText = "Show means";

	aggregateButton.addEventListener("click", function() {
		showMeans = !showMeans;
		if (showMeans) {
			individualChart.style.display = "none";
			meanChart.style.display = "block";
			aggregateButton.innerText = "Show individual distances";
		} else {
			individualChart.style.display = "block";
			meanChart.style.display = "none";
			aggregateButton.innerText = "Show means";
		}
	});

	// Compare mean distances for the same three activities used in the charts.
	var activityMeans = activityCounts.slice(0, 3).map(function(activity) {
		var records = distanceData.filter(function(record) {
			return record.activity === activity.activity;
		});
		var totalDistance = 0;
		records.forEach(function(record) {
			totalDistance += record.distance;
		});
		return {
			activity: activity.activity,
			mean: records.length > 0 ? totalDistance / records.length : 0
		};
	});
	activityMeans.sort(function(a, b) {
		return b.mean - a.mean;
	});
	document.getElementById("longestActivityType").innerText =
		activityMeans.length > 0 ? activityMeans[0].activity : "N/A";
	document.getElementById("shortestActivityType").innerText =
		activityMeans.length > 0
			? activityMeans[activityMeans.length - 1].activity
			: "N/A";

	var weekendTotal = 0;
	var weekendCount = 0;
	var weekdayTotal = 0;
	var weekdayCount = 0;
	distanceData.forEach(function(record) {
		var day = record.time.getDay();
		if (day === 0 || day === 6) {
			weekendTotal += record.distance;
			weekendCount++;
		} else {
			weekdayTotal += record.distance;
			weekdayCount++;
		}
	});
	var weekendMean = weekendCount > 0 ? weekendTotal / weekendCount : 0;
	var weekdayMean = weekdayCount > 0 ? weekdayTotal / weekdayCount : 0;
	if (distanceData.length === 0) {
		document.getElementById("weekdayOrWeekendLonger").innerText = "N/A";
	} else {
		document.getElementById("weekdayOrWeekendLonger").innerText =
			weekendMean > weekdayMean ? "weekends" : "weekdays";
	}
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});

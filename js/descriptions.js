var tweetsWithComments = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	var tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	tweetsWithComments = tweet_array.filter(function(tweet) {
		return tweet.written;
	});
	updateSearchResults();
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	document.getElementById("textFilter").addEventListener("input", function() {
		updateSearchResults();
	});
	updateSearchResults();
}

function updateSearchResults() {
	var searchText = document.getElementById("textFilter").value;
	document.getElementById("searchText").textContent = searchText;
	var matchingTweets = [];

	// An empty query should clear the table rather than match every tweet.
	if (searchText !== "") {
		matchingTweets = tweetsWithComments.filter(function(tweet) {
			return tweet.fullText.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
		});
	}

	document.getElementById("searchCount").textContent = matchingTweets.length;
	var tableHTML = "";
	matchingTweets.forEach(function(tweet, index) {
		tableHTML += tweet.getHTMLTableRow(index + 1);
	});
	document.getElementById("tweetTable").innerHTML = tableHTML;
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});

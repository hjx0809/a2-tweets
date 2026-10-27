class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

    get fullText():string {
        return this.text;
    }
	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        if(this.text.startsWith("Just completed ") || this.text.startsWith("Just posted ")) {
            return "completed_event";
        } else if(this.text.startsWith("Watch my ")) {
            return "live_event";
        } else if(this.text.startsWith("Achieved a new personal record ") || this.text.startsWith("I just set a goal ")) {
            return "achievement";
        } else {
            return "miscellaneous";
        }
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        if (this.source !== "completed_event") {
            return false;
        }
        
        // Check if the text contains a separator " - " which indicates written content
        var separatorIndex = this.text.indexOf(" - ");
    
        if (separatorIndex === -1) {
            return false;
        }
    
        // Extract the text after the separator
        var writtenText = this.text.substring(separatorIndex + 3);
        // Check if the written text contains a link (starts with "http")
        var linkIndex = writtenText.indexOf("http");
    
        if (linkIndex !== -1) {
            writtenText = writtenText.substring(0, linkIndex);
        }
        
        // Remove any hashtags like #Runkeeper or #RunKeeper from the written text
        writtenText = writtenText.replace("#Runkeeper", "");
        writtenText = writtenText.replace("#RunKeeper", "");
        writtenText = writtenText.trim();
    
        if (writtenText === "" || writtenText === "TomTom MySports Watch") {
            return false;
        }
        
        return true;
    }

    // returns the text written by the person tweeting, 
    // or an empty string if there is no written text.
    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        
        // Check if the text contains a separator " - " which indicates written content
        var separatorIndex = this.text.indexOf(" - ");
        var writtenText = this.text.substring(separatorIndex + 3);

        // Check if the written text contains a link (starts with "http")
        var linkIndex = writtenText.indexOf("http");

        if (linkIndex !== -1) {
            writtenText = writtenText.substring(0, linkIndex);
        }
        
        // Remove any hashtags like #Runkeeper or #RunKeeper from the written text
        writtenText = writtenText.replace("#Runkeeper", "");
        writtenText = writtenText.replace("#RunKeeper", "");
        writtenText = writtenText.trim();
        return writtenText;
    }

    // returns the activity type, or "unknown" if the tweet is not a completed event.
    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet

        var activityType = "";

        // remove the the prefix "Just completed " or "Just posted "
        if(this.text.startsWith("Just completed ")) {
            activityType = this.text.substring("Just completed ".length);
        }else if(this.text.startsWith("Just posted ")) {
            activityType = this.text.substring("Just posted ".length);
        }

        // remove the prefix "a " or "an " from the activity type
        if(activityType.startsWith("a ")) {
            activityType = activityType.substring(2);
        }else if(activityType.startsWith("an ")) {
            activityType = activityType.substring(3);
        }

        // remove units from the end of the activity type, e.g. "miles", "kilometers", "mi", "km"
        var IndexOfKm = activityType.indexOf(" km ");
        var IndexOfmi = activityType.indexOf(" mi ");
        if(IndexOfKm !== -1) {
            activityType = activityType.substring(IndexOfKm + 4);
        } else if(IndexOfmi !== -1) {
            activityType = activityType.substring(IndexOfmi + 4);
        }

        var endingwords = [" with ", " - ", " in ", " http", " #"];
        endingwords.forEach(function(endingword) {
            var index = activityType.indexOf(endingword);
            if(index !== -1) {
                activityType = activityType.substring(0, index);
            }
        });
        
        activityType = activityType.trim();

        if(activityType === "") {
            return "unknown";
        }

        return activityType;

    }

    // returns the distance of the activity in miles, or 0 if the tweet is not a completed event.
    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
            var activityType = "";

        // remove the the prefix "Just completed " or "Just posted "
        if(this.text.startsWith("Just completed ")) {
            activityType = this.text.substring("Just completed ".length);
        }else if(this.text.startsWith("Just posted ")) {
            activityType = this.text.substring("Just posted ".length);
        }

        // remove the prefix "a " or "an " from the activity type
        if(activityType.startsWith("a ")) {
            activityType = activityType.substring(2);
        }else if(activityType.startsWith("an ")) {
            activityType = activityType.substring(3);
        }

        // check the unit of the distance
        var spaceLocation = activityType.indexOf(" ");
        if(spaceLocation === -1) {
            return 0;
        }

        // get the unit of the distance
        var unit = activityType.substring(spaceLocation);
        if(!unit.startsWith(" mi") && !unit.startsWith(" km")) {
            return 0;
        }

        // get the distance and convert it to number
        var distance = activityType.substring(0, spaceLocation);
        var distanceNumber = parseFloat(distance);

        // isNaN function is used to check if the distanceNumber is a valid number or not. 
        // If it is not a valid number, return 0.
        if(isNaN(distanceNumber)) {
            return 0;
        }

        // convert the distance to miles if the unit is kilometers
        // 1 mile = 1.60934 kilometers
        if(unit.startsWith(" km")) {
            distanceNumber = distanceNumber/1.60934;
        }

        return distanceNumber;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        
        var row = document.createElement("tr");

        var numberCell = document.createElement("td");
        numberCell.textContent = rowNumber.toString();
        row.appendChild(numberCell);

        var activityCell = document.createElement("td");
        activityCell.textContent = this.activityType;
        row.appendChild(activityCell);

        var tweetCell = document.createElement("td");
        var position = 0;

        while (position < this.text.length) {
            var linkStart = -1;

            // 从当前位置寻找下一个网址
            for (var i = position; i < this.text.length; i++) {
                if (this.text.substring(i, i + 8) === "https://" ||
                    this.text.substring(i, i + 7) === "http://") {
                    linkStart = i;
                    break;
                }
            }

            if (linkStart === -1) {
                tweetCell.appendChild(
                    document.createTextNode(this.text.substring(position))
                );
                break;
            }

            tweetCell.appendChild(
                document.createTextNode(
                    this.text.substring(position, linkStart)
                )
            );

            var linkEnd = this.text.length;
            
            for (var i = linkStart; i < this.text.length; i++) {
                if (this.text[i] === " " ||
                    this.text[i] === "\n" ||
                    this.text[i] === "\r" ||
                    this.text[i] === "\t") {
                    linkEnd = i;
                    break;
                }
            }

            var link = this.text.substring(linkStart, linkEnd);
            var linkElement = document.createElement("a");
            linkElement.href = link;
            linkElement.textContent = link;
            tweetCell.appendChild(linkElement);

            position = linkEnd;
        }

        row.appendChild(tweetCell);
        return row.outerHTML;
    }
}
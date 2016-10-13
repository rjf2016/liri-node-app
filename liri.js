
//-------------------------------------------------------------------------------------
// LIRI.js (RJF)
// Four (4) Command line parameters: 
//	  node liri.js movie-this "Frozen"
//	  node liri.js spotify-this-song "where the streets have no name"
//	  node liri.js my-tweets
//	  node liri.js do-what-it-says    (uses the command from random.txt)
//-------------------------------------------------------------------------------------
var fs = require('fs');

var param = process.argv[2];  //get the parameter passed in (like 'my-tweets')

if(!param){
	console.log("Error: missing parameter");
	return;
}

//------------------------------------------------------------------
// IMDB Lookup: Call the IMDB API using the passed in Movie title
//------------------------------------------------------------------
if (param == 'movie-this'){
	movieTitle = process.argv[3];
	
	if(!movieTitle){
		console.log("Error: missing name of movie title.");
		return;
		}
		
	movieThis(movieTitle);

}

//------------------------------------------------------------------
// SPOTIFY Lookup: Call Spotify API using the passed in Song title
//------------------------------------------------------------------
if (param == 'spotify-this-song')
{
	songTitle = process.argv[3];
	
	if(!songTitle){
			console.log("Error: missing name of song.");
			return;
		}
	
	 spotifyThisSong(songTitle);
}

//------------------------------------------------------------------
// TWITTER Lookup: Call Twitter API getting last 20 tweets
//------------------------------------------------------------------
if (param == 'my-tweets'){
	myTweets();

}

//------------------------------------------------------------------
// Do What it Says: Execute the instructions in Random.text
//------------------------------------------------------------------
if (param == 'do-what-it-says'){
	doWhatItSays();
}



//------------------------------------------------------------------
// writeToFile: appends text to the log.txt file
//------------------------------------------------------------------
function writeToFile(textToWrite){

	fs.appendFile("log.txt", textToWrite, function(err) {
    if(err) {
        console.log(err);
    } else {
        //console.log("file has been saved successfully");
    }
  });
}


//--------------------------------------
// Twitter Section
//--------------------------------------
function myTweets(){
	var keyfile = require("./keys.js");
	var Twitter = require('twitter');


	var consumer_key = keyfile.twitterKeys.consumer_key;
	var consumer_secret = keyfile.twitterKeys.consumer_secret;
	var access_token_key = keyfile.twitterKeys.access_token_key;
	var access_token_secret = keyfile.twitterKeys.access_token_secret;
   
   	var client = new Twitter({
		consumer_key: consumer_key,
		consumer_secret: consumer_secret,
		access_token_key: access_token_key,
		access_token_secret: access_token_secret
		});
		

		// Make call to Twitter API to get user's timeline 
		client.get('statuses/user_timeline', {screen_name:'@tjf081', count:'20'}, function(error, tweets, response){
		  if (!error) {
		  		for(i=0; i<tweets[0].user.statuses_count; i++){
		  			console.log(tweets[i].user.created_at + ":  " + tweets[i].text); 
		  			writeToFile(tweets[i].user.created_at + ":  " + tweets[i].text + "\r\n\r\n");	
		  		}
		  } else {
			   console.error('An error occurred!'); 
		  }
		});
		return;
	}

//--------------------------------------
// Spotify Section
//--------------------------------------
function spotifyThisSong(paramSong){
	var spotify = require('spotify');


	spotify.search({ type: 'track', query: paramSong }, function(err, data) {
    
    if ( err ) {
        console.log('Error occurred: ' + err);
        return;
    }
 	
    var countOfResults = data.tracks.items.length;  //count of how many tracks were returned for the given song (if 0, find default 'The Sign' by Ace of Base)

    if(!countOfResults){
    	spotify.search({ type: 'track', query: 'Ace of Base The Sign', artist: 'Ace of Base' }, function(err, data) {
    
    		if ( err ) {
        		console.log('Error occurred: ' + err);
        		return;
	    		}
    		var songInfo = data.tracks.items[0];
    		showSongDetail(songInfo.artists[0].name, songInfo.name, songInfo.preview_url, songInfo.album.name);
    	});
	}
    
	for(i=0; i<countOfResults; i++){
			var songInfo = data.tracks.items[i];
    		showSongDetail(songInfo.artists[0].name, songInfo.name, songInfo.preview_url, songInfo.album.name);
		}    	           
	});
}

function showSongDetail(artistName, songName, previewURL, albumName){

	console.log("Artist: " + artistName);
	console.log("Song:   " + songName);
	console.log("Preview URL: " + previewURL);
	console.log("Album: " + albumName);

	writeToFile("Artist: " + artistName + "\r\n" + "Song:   " + songName + "\r\n" + "Preview URL: " + previewURL + "\r\n" + "Album: " + albumName + "\r\n\r\n");
}


//--------------------------------------
// Movie Section
//--------------------------------------
function movieThis(paramMovie)
{

	var movieUrl = "http://www.omdbapi.com/?t=" + paramMovie + "&y=&plot=short&r=json&tomatoes=true";
	var request = require('request');

	request(movieUrl, function (error, response, body) {
		
	if (!error && response.statusCode == 200) {
   				 
   		 var movieInfo = JSON.parse(body);
   				 
   		 if(!movieInfo.Error)
		 	showMovieDetail(movieInfo.Title, movieInfo.Rated, movieInfo.imdbRating, movieInfo.Country, movieInfo.Language, movieInfo.Plot, movieInfo.Actors, movieInfo.tomatoRating, movieInfo.tomatoURL);
		  else{
		    //else "No Movie Found!" then default to Mr. Nobody
			request("http://www.omdbapi.com/?t=Mr. Nobody&y=&plot=short&r=json&tomatoes=true", function (error, response, body) {
			if (!error && response.statusCode == 200) {
   				 var movieInfo = JSON.parse(body);
   				 if(!movieInfo.Error){
	   				 	showMovieDetail(movieInfo.Title, movieInfo.Rated, movieInfo.imdbRating, movieInfo.Country, movieInfo.Language, movieInfo.Plot, movieInfo.Actors, movieInfo.tomatoRating, movieInfo.tomatoURL);
					 }
				}
			})

		   }
   	}
   	})
}

function showMovieDetail(Title, Rated, imdbRating, Country, Language, Plot, Actors, tomatoRating, tomatoURL){
			console.log("Title: " + Title);
			console.log("Rated: " + Rated);
			console.log("imdb Rating: " + imdbRating);
			console.log("Country: " + Country);
			console.log("Language: " + Language);
			console.log("Plot: " + Plot);
			console.log("Actors: " + Actors);
			console.log("Rotten Tomatoes Rating: " + tomatoRating);
			console.log("Rotten Tomatoes URL: " + tomatoURL);

			writeToFile("Title: " + Title + "\r\n" + "Rated: " + Rated + "\r\n" + "imdb Rating: " + imdbRating + "\r\n" + "Country: " + Country + "\r\n" + "Language: " + Language + "\r\n" + "Plot: " + Plot + "\r\n" + "Actors: " + Actors + "\r\n" + "Rotten Tomatoes Rating: " + tomatoRating + "\r\n" + "Rotten Tomatoes URL: " + tomatoURL + "\r\n\r\n");
}

//--------------------------------------
// Do-what-it-says Random Section
//--------------------------------------
function doWhatItSays(){
	
	var data = fs.readFileSync('random.txt');
	var d = data.toString();

	if(d == "do-what-it-says")  //prevent an infinite loop where this keeps getting called
	{
		console.log("Do-what-it-says cannot be used in random.txt");
		return;
	}
	
	var exec = require('child_process').exec;
	
	exec('node liri.js ' + d, function(error, stdout, stderr) {
    
    console.log('stdout: ' + stdout);
    
    if (error !== null) {
        console.log('exec error: ' + error);
    }
  });
 }

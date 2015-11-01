	var myFollowings = []
	var tracks = [];
	var trackDetails = {};
	var trackIds =[];

	var allComments = [];
	var filteredComments = [];

	var defaultImage = "/images/soundcloud-300x300.png";
	var commentsByTrack = [];


	var filteredCommentsByTrack = [];

	function constructBadge(follower)
	{
		var newBadgeElement = '<li class="list-group-item">' + 
							    '<span class="badge">' + follower.track_count + '</span>' + follower.username + '</li>'
		return newBadgeElement;

	}
	function constructThumbnail(commentInfo)
	{
		var artworkUrl = commentInfo.artwork_url ? commentInfo.artwork_url : defaultImage;
		var newThumbnail = '<div class="col-sm-6 col-md-4" style="height:450px;overflow-y: auto">' + 
						    '<div class="thumbnail">' + 
						    	'<a href="' + commentInfo.track_url + '" class="btn btn-primary" role="button">' +
						    		'<img src="' + artworkUrl + '" alt="Could not load image">' + 
						    	'</a>' + 
						      '<div class="caption">&ldquo;<span>' +  commentInfo.body + '</span>&rdquo;</div>' +
						    '</div>' +
						  '</div>';
		return newThumbnail;
	}



	// new way of showing comments by track 

	function constructNewThumbnail(currentTrack , comments)
	{
		var artworkUrl = currentTrack.artwork_url ? currentTrack.artwork_url.replace("large","t300x300") : defaultImage;
		var trackUrl = currentTrack.permalink_url;
		var commentSpans = '';
		$.each(comments, function(index , item){
			var commentBody = '<span class="commentBody"><b>"' + item.body + '"</b></span><br/>';
			commentSpans = commentSpans + commentBody;
		});

		var newThumbnail = '<div class="col-sm-6 col-md-4" style="height:350px;overflow-y: auto">' + 
						    '<div class="thumbnail">' + 
						    	'<a href="' + trackUrl + '" class="scLink" role="button">' +
						    		'<img src="' + artworkUrl + '" alt="Could not load image">' + 
						    		'<span class="text-content">' + commentSpans + '</span>' + 
						    	'</a>' + 
						    '</div>' +
						  '</div>';
		
		return newThumbnail;
	}


	//-----

	function appendResult(item){
		$('#commentsResults').append("<p>" + item.body + " - <a href='" + item.track_url + "'>" + item.track_title + "</a></p>");
	}

	function getFilteredComments(q) {
			
			
			$('#trackThumbnails').html('');
			filteredComments = [];
			for(var i = 0;i<allComments.length;i++){

				if(allComments[i].body.includes(q))
				{
					//appendResult(allComments[i]);
					var tn =  constructThumbnail(allComments[i]);
					$('#trackThumbnails').append(tn);
					filteredComments.push(allComments[i])
				}
				

			}

		}




	// to show all results trackwise, group matched comments by track.
	function getCommentsOfTrackByQuery(c , q){

		var result = [];
		$.each(c, function(index , item){

			if(item.body.includes(q))
			{
				result.push(item);
			}
		})
		return result;
	}

	function getFilteredCommentsByTrack(q)
	{
		
		// for each track ,  we need to match search query with its comments
		$.each(commentsByTrack , function(index , item){ // commentsByTrack -> list of {track : [] ,  comments : []}

			if(item.track.comment_count > 0)
			{
				var itemComments = getCommentsOfTrackByQuery(item.comments , q); // match query with track comments
				if(itemComments.length > 0)
				{
					filteredCommentsByTrack.push({ track : item.track , comments : itemComments}); // final result set for displaying
				}

			}
			

		});
	}

	function renderCommentsByTrack(){

		$.each(filteredCommentsByTrack , function ( index , item){

			var currentTrack = item.track;
			var newTrackThumbnail = constructNewThumbnail(currentTrack, item.comments);
			$("#trackThumbnails").append(newTrackThumbnail);

		})

	}

	$(document).ready(function(){

		$('.searchTemplate').on('click', function(e){

			var q = e.srcElement.innerHTML;
			q = q.replace("&lt;","<");
			$("#trackThumbnails").html('');
			filteredCommentsByTrack = [];
			//getFilteredComments(q)
			getFilteredCommentsByTrack(q);
			renderCommentsByTrack();


		});
		$('#btnSearchByText').on('click' , function(e){
			var text = $('#searchText').val()
			$("#trackThumbnails").html('');
			filteredCommentsByTrack = [];
			if(text != "")
			{
				//getFilteredComments(text);
				getFilteredCommentsByTrack(text);
				renderCommentsByTrack();

			}	
				

		});

		$('.searchTemplate').hide();
		$('#searchByTextDiv').hide();
	})



	function getTrackComments(trackDetails)
	{
		SC.get('/tracks/' + trackDetails.id + '/comments' , {limit : 50} , function (trackComments){

				if(trackComments.length > 0)
				{
					
					commentsByTrack.push({ track : trackDetails , comments : trackComments});
				}


		})

	}

	function getAllComments(trackDetails){

	// Get comments on all the tracks of all my followings
		for(i = 0;i<trackDetails.length;i++)
		{
			if(trackDetails)
			{
				
			try{
				var comments = getTrackComments(trackDetails[i]);
			}
			catch(exception){

			}
			}
		}
	//groupCommentsByTrack
	$('#commentsResults').show();
	return allComments;
	

	}	

	function getAllTracks(myFollowings , callback)
	{
		// Get tracks of all my followings

		for(var i = 0; i < myFollowings.length;i++)
		{
			try{

			SC.get('/users/' + myFollowings[i].id + '/tracks', { limit : 10 }, function(trackList){
			if(trackList && trackList.length > 0)
			{
				for(var j = 0;j<trackList.length;j++)
				{
					tracks.push(trackList[j]);
					trackIds.push(trackList[j].id);
				}
				// get comments for tracks of this following.
				callback(trackList);


			}


			
			})

			}
			catch(exception)
			{
				console.log(exception.message);
			}

		}
		return tracks;
	}

	function setup(){
			$('#cog-spinnerTracks').hide();
	}

	function getAllMyFollowings(callback)
	{
		$('#followingsList').html('');
		$('#cog-spinnerTracks').show();
		SC.get('/me/followings', { limit : 200 }, function(followings){

		for(var i =0;i <followings.length; i++){

			myFollowings.push(followings[i])
			var thisFollowing = constructBadge(followings[i]);

			$('#followingsList').append(thisFollowing)
		}
		console.log("Got all followers");
		if(myFollowings.length > 0){
		$('#myFollowingsResults').show();
		$('#myFollowingsResults').show();

		}

		var allTracks = getAllTracks(myFollowings, getAllComments);
		
		$('.searchTemplate').show();
		$('#searchByTextDiv').show();
		$("#authenticate").hide();
		
		})
		callback();

	}
	function authenticate()
	{
		SC.initialize({
		client_id: clientId,
		redirect_uri: 'morning-woodland-9292.heroku.com/callback'
		});

		
		SC.connect(function(){
			getAllMyFollowings(setup);
		});
	}
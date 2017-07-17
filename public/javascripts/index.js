var totalMessages =0 , totalTime=0, msgsPerSec = 0;
function onSignIn(googleUser) {
  localStorage.setItem('user', JSON.stringify(googleUser));
  $('.g-signin2').hide();
  $('#username').text("Welcome "+ googleUser.getBasicProfile().getName());
  $("#user-name-sign-out").show();
  getVideos();
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
      $("#user-name-sign-out").hide();
      location.reload();
    });
}
function getData(path,params) {
  var baseUrl="https://www.googleapis.com/youtube/v3";
  return $.get(baseUrl+path,params)
}

function getVideos() {
  var access_token=JSON.parse(localStorage.getItem('user')).Zi.access_token;
  getData( '/search',
          {'eventType': 'live',
            'maxResults': '25',
            'part': 'snippet',
            'q': 'games',
            'type': 'video',
            'access_token':access_token
          }
          )
  .done( results => {
      generateList(results);
      
  })
}

function generateList(results){
  var ul=$("#video-list");
      results.items.forEach(function(video) {
        var videoId= video.id.videoId
        if(videoId!==undefined) {
            var li= "<li>"+
                        "<a href=\"/videos/"+videoId+"\">" +
                        "<span> <img src="+video.snippet.thumbnails.default.url+" alt="+video.snippet.title+"> </span>" +
                        "<span> "+video.snippet.title+"</span>"+
                        "</a>"+
                    "</li>";
            ul.append(li);
        }

      });
}

function getVideoDetails(videoId) {
  var access_token=JSON.parse(localStorage.getItem('user')).Zi.access_token;
  return getData('/videos',
                {'id': videoId,
                 'part': 'liveStreamingDetails',
                 'access_token':access_token
                }
              )
}

function getChatMessages(videoId) {
  var access_token=JSON.parse(localStorage.getItem('user')).Zi.access_token;
  getVideoDetails(videoId)
  .done( results => {
    var liveChatId= results.items[0].liveStreamingDetails.activeLiveChatId;
    console.log(liveChatId);
    getMessages(liveChatId,null,videoId);
  });
}

function generateChat(results) {
  var ul=$("#chat-list");
      results.items.forEach(function(item) {
        var message= item.snippet.displayMessage;
        var authorName= item.authorDetails.displayName;
            var li= "<li>"+
                        "<span> <a href=\"/messages/"+item.authorDetails.channelId+"\">"+authorName+"</a>:"+message+"</span>"+
                    "</li>";
            ul.append(li);
      });
}

function getMessages(liveChatId,nextPageToken,videoId) {
  var access_token=JSON.parse(localStorage.getItem('user')).Zi.access_token;
  getData('/liveChat/messages',
                {'liveChatId': liveChatId,
                 'part': 'snippet,authorDetails',
                 'access_token':access_token,
                 'pageToken':nextPageToken
                }
            )
    .done(results => {
      if(nextPageToken !== null) {
        totalMessages += results.items.length;
        msgsPerSec = totalMessages/(totalTime/1000);
        $('#msgs-per-sec').text(msgsPerSec.toFixed(2)+" msgs/sec");
      }
      totalTime += results.pollingIntervalMillis;
      $.post("/messages",{data:JSON.stringify(results),videoId:videoId});
      setTimeout(function() { getMessages(liveChatId,results.nextPageToken,videoId);},results.pollingIntervalMillis);
      generateChat(results);
    })
}


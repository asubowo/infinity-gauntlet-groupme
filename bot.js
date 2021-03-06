/**
 * This is Banos, the GroupMe bot that removes half of a group message for balance.
 * You know, for balance.
 *
 * I want to make it very clear that to whomever is reading this code that I am not proud of this work.
 * It's pretty crap for my first attempt at a GroupMe bot and with my limited exposure to Node JS.
 * But I'll take whatever.
 */

var HTTPS = require('https');
var botID = process.env.BOT_ID;
var token = process.env.ACCESS_TOKEN;
var group = process.env.GROUP;

/**
 * Begins the snap sequence.
 */
function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /^\/snap$/;
  //console.log(request);
  if (request.text && botRegex.test(request.text)) {
    this.res.writeHead(200);
    balance();
    this.res.end();
  } else {
    this.res.writeHead(200);
    // To do - get user who called it and ensure that it's the appropriate user to begin snapping
    this.res.end();
  }
}

/**
 * SNAPS THE MEMBERID 
 * IF YOU'RE SEEING THIS, FLEX ON THE SNAPPED USERS
 * @param string memberID - A string that represents the memberID to snap
 */
function snap(memberID) {
  pathurl = '/v3/groups/' + group + '/members/' + memberID + '/remove?token=' + token;

  options = {
    hostname: 'api.groupme.com',
    path: pathurl,
    method: 'POST'
  };

  console.log('Snapping ' + memberID + '...');

  // Build request and submit it
  botReq = HTTPS.request(options, function(res) {
    if (res.statusCode == 200) {
      // Do nothing
    } else {
      console.log('rejecting error code ' + res.statusCode);
    }
  });

  botReq.end();
}

/**
 * Begins balancing the universe
 * Doesn't return anything, just hits up the GroupMe API.
 */
function balance() {
  var pathurl = '/v3/groups/' + group + '?token=' + token;

  options = {
    hostname: 'api.groupme.com',
    path: pathurl,
    method: 'GET'

  };

  console.log('Snapping...');
  callback = function(responseBuffer) {
    let responseData;
    var buffer = '';
    responseBuffer.on('data', function(chunk) {
      buffer += chunk;
    });

    responseBuffer.on('end', function(chunk) {
      responseData = JSON.parse(buffer);
      var user;
      var bannedIDs = [];
      var bannedNames = [];
      var groupTotal = 0;
      var half = 0;
      var banned = 0;
      var memberID = 0;
      var thanosID = 'Andrew Subowo';

        for (var i = 0; i < responseData.response.members.length; i++) {
          groupTotal++;
        }
        console.log("Total people in group: " + groupTotal);

        // Calculate half of the group total for balance.
        half = groupTotal / 2;

        while (banned < half) {
        user = Math.floor(Math.random() * (groupTotal - 1));
        console.log("Selecting this position in member array: ",user);
          // Get a new user ID to ensure we don't snap ourselves like an idiot.
          while (responseData.response.members[user].name === thanosID) {
            console.log("CANNOT SNAP BOT CREATOR");
            user = Math.floor(Math.random() * (groupTotal - 1));
          }

          // Initialize the array with the first banned user
          // I have no clue why this is required.
          // It makes sense and also doesn't make sense.
          // Without this, the if statement below (if it wasn't in the else/if part) would break
          // and throw an Unexpected End of Input exception. Weird. Oh well.
          if (bannedIDs.length == 0) {
            memberID = responseData.response.members[user].id;
            bannedName = responseData.response.members[user].name;
            bannedIDs.push(memberID);
            bannedNames.push(bannedName);
            console.log('Added ' + bannedName + ' to snap list first');
            banned++;
          }
            // If the user we're targeting does not exist in the array, add him or her to the snap list
          else if (bannedIDs.indexOf((responseData.response.members[user].id)) == -1) {
            console.log("Found user that is not in snap list");
            memberID = responseData.response.members[user].id;
            bannedName = responseData.response.members[user].name;
            bannedIDs.push(memberID);
            bannedNames.push(bannedName);
            console.log('Added ' + bannedName + ' to snap list');
            banned++;
          }
          else {
            console.log('Thanos did nothing wrong (user already exists in banned list)');
          }
        } // end ban list generation loop

        console.log('Snapped IDs:');
        for (var i = 0; i < bannedIDs.length; i++) {
          console.log(bannedIDs[i] + " " + bannedNames[i]);
        }
        console.log("Snapped " + bannedIDs.length + " total people.");


//        // promote shoddy coding to get this bot done fast
        for (var i = 0; i < bannedIDs.length; i++) {
          snap(bannedIDs[i]);
        }

      });
  }
  var req = HTTPS.request(options, callback).end();
}

exports.respond = respond;

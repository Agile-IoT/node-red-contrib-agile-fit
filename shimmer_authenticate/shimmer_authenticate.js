
module.exports = function(RED) {
    //use this module to make requests
    var d = require('debug')('shimmer');
    var request=require('request');

    function shimmerAuthenticate(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.status();

        node.server = RED.nodes.getNode(config.server);
        node.on('input', function(msg) {

            function show_error(msg) {
                node.status({fill:"red",shape:"ring",text:"Missing parameters"});
                RED.log.error(msg);
            }

			var msgIn = msg;
			
			var payload = {};
			try {
            	payload = JSON.parse(msg.payload);
			} catch (err) {
				console.log("Error parsing payload:" + err);			
			}

            node.status({fill:"blue",shape:"ring",text:"sending"});
            d("Testing debug");

			var username = payload.username || "";
			var service = payload.service || node.server.shimmer_service ||  "";

            var options = {
                url: node.server.shimmer_server_url + "/authorize/"+service+"?username="+username ,
                method: 'GET'            
			};
            
			d(`Sending Shimmer request: ${JSON.stringify(options)}`)
            request(options, function(err, res, body) {
                if (err) {
                    node.status({fill:"red",shape:"ring",text:"disconnected"});
                }
                else {
                  console.log(res.statusCode +' ' + res.body);

                  if (res.statusCode===200) {
                    node.status({fill:"green",shape:"dot",text:"response received"});

					var resp = JSON.parse(body);

					console.log (msgIn +" : authorized "+ resp.isAuthorized );
					if (msgIn.res !== undefined && resp.isAuthorized != undefined &&  resp.isAuthorized === false){				
						msgIn.res.redirect(resp.authorizationUrl);		
					}
					var msg = {};
					if (msgIn != undefined){
						msg.req = msgIn.req;
						msg.res = msgIn.res;	
					}		
					
					console.log ("metric="+payload.metric);
					if (payload.metric != undefined) {
						resp.metric = payload.metric;  
					}
					console.log ("metricOut:"+resp.metric);
					
					msg.payload =  JSON.stringify(resp);
					node.send(msg);	
                  } else {
                      var msg = JSON.parse(res.body)["message"] || "<unknown error>";
                      node.status({fill:"red", shape:"ring", text:res.statusCode});
                      RED.log.error(`Error getting shimmer data: ${msg}`);
                  }
                }
            })

        });

    }

    RED.nodes.registerType("shimmer_authenticate",shimmerAuthenticate);
}

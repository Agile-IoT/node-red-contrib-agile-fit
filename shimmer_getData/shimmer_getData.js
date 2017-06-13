
module.exports = function(RED) {
    //use this module to make requests
    var d = require('debug')('shimmer')
    var request=require('request');

    function shimmerGetData(config) {
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
			console.log(payload);	
			if ( (payload.isAuthorized == undefined) ||  (payload.isAuthorized == false) ) {
				msg.payload = "unauthorized";
				this.send(msg);
			}

            node.status({fill:"blue",shape:"ring",text:"retrieving"});
            d("Testing debug");

			var service = payload.service || node.server.shimmer_service ||  "";
			var metric = payload.metric ||  "";	
			var username = payload.username || "";
			var curTime = new Date();
			var startTime = payload.startTime ||  new Date( curTime.getTime()- 30*24*60*60*1000).toISOString().substring(0, 10); 
			var stopTime = payload.stopTime || (new Date().toISOString().substring(0, 10)) ;	
			console.log ("Start time: "+startTime + " StopTime: "+stopTime );
		            
			var options = {
                url: node.server.shimmer_server_url + "/data/"+service+"/"+metric+"?username="+username+"&normalized=true&dateStart="+startTime +"&dateEnd="+stopTime,
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
					var msg = {};
					if (msgIn != undefined){
						msg.req = msgIn.req;
						msg.res = msgIn.res;	
					}		
					
					msg.payload =  res.body; 
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

    RED.nodes.registerType("shimmer_getData",shimmerGetData);
}

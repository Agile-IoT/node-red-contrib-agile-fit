module.exports = function(RED) {
    function ShimmerConfigNode(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.shimmer_server_url = config.shimmer_server_url;
		this.shimmer_service  = config.shimmer_service;
    }
    RED.nodes.registerType("shimmer-config",ShimmerConfigNode);
}

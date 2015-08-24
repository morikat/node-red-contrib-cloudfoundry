module.exports = function(RED) {
    function CloudFoundryAppsNode(config) {
        RED.nodes.createNode(this, config);

        this.api = config.api;
        this.username = config.username;
        this.password = config.password;

        var node = this;

        this.on('input', function(msg) {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 

          var conf = {
            "endpoint": msg.api || this.api,
            "username": msg.username || this.username,
            "password": msg.password || this.password
          };

          //console.log(conf);

          var cloudFoundry = require("cf-nodejs-client").CloudFoundry;
          cloudFoundry = new cloudFoundry(conf.endpoint);
          
          cloudFoundry.getInfo().then(function (result) {
            return cloudFoundry.login(result.authorization_endpoint, conf.username,conf.password);
          }).then(function (result){
            var cloudFoundryApps = require("cf-nodejs-client").Apps;
            cloudFoundryApps = new cloudFoundryApps(conf.endpoint);
            cloudFoundryApps.getApps(result.token_type, result.access_token).then(function (result){
              //console.log(result);
              msg.payload = result;
              node.send(msg);
            }).catch(function (reason) {
              console.error("Error: " + reason);
            });
          });
       });
    }
    RED.nodes.registerType("cloudfoundry-apps",CloudFoundryAppsNode);
}

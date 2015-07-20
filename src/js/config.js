angular.module('SNAP.configs', [])
 .factory('SNAPConfig', [], function() {
   return {
     "accounts":true,
     "chat":true,
     "locale":"en_US",
     "location":"847429c4-bb61-40b5-b3fa-a4a50151030c",
     "location_name":"DevTestLocation",
     "offline":false,
     "oms":true,
     "surveys":true,
     "theme":{
       "layout":"galaxies",
       "tiles_style":"default"
     }
   };
 })
 .factory('SNAPEnvironment', [], function() {
   return {
    customer_application: {"client_id":"91381a86b3b444fd876df80b22d7fa6e","callback_url":"https://web.managesnap.com/oauth2/customer/callback"},
    facebook_application: {"client_id":"349729518545313","redirect_url":"https://web.managesnap.com/callback/facebook"},
    googleplus_application: {"client_id":"678998250941-1dmebp4ksni9tsjth45tsht8l7cl1mrn.apps.googleusercontent.com","redirect_url":"https://web.managesnap.com/callback/googleplus"},
    twitter_application: {"consumer_key":"yQ8XJ15PmaPOi4L5DJPikGCI0","redirect_url":"https://web.managesnap.com/callback/twitter"}
  };
 })
 .factory('SNAPHosts', [], function() {
  return {
    api: {"host":"api2.managesnap.com","secure":"true"},
    content: {"host":"content.managesnap.com"},
    media: {"host":"content.managesnap.com"}
  };
 });

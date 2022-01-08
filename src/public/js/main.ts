import bonjour = require("bonjour");
$(document).ready(function() {
  console.log("--- main.ts");

  const bonjourInstance = bonjour({});
  let browser: bonjour.Browser;
  const browserOptions = { protocol: "tcp", type: "http" };
  browser = bonjourInstance.find(this.browserOptions, (srv: bonjour.RemoteService) => {

    // You can test here if the found server (srv) name is 'My Website'

    console.log("--- bonjourInstance.find:", JSON.stringify(srv));

});
});
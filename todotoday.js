
if (Meteor.isClient) {

  Handlebars.registerHelper("dump", function(optionalValue) {
    console.log("Current Context");
    console.log("====================");
    console.log(this);

    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  });

  Template.flashMessage.flashMessage = function() {
    return Session.get('flashMessage');
  }

}

'use strict';

function startProfPage() {
  sendRequest(`../json/profile.json`)
  .then(result => {
    var data = JSON.parse(result);
    console.log(data);
    loader.hide();
    var profileData = {
      area: "profile-card",
      items: data
    };
    fillTemplate(profileData);
    initForm2('edit-profile-modal', testEditProfile);
  })
  .catch(err => {
    console.log(err);
    loader.hide();
  });
}
startProfPage();


function testEditProfile() {
  console.log('testEditProfile');
  clearForm('edit-profile-modal');
}

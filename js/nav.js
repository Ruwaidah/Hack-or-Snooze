"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  showMyStoriesBtns = false;
  $(".new-password").remove();
  $(".psw-input").show();
  hidePageComponents();
  getAndShowStoriesOnStart();
  $("#signup-form p").text("");
  $("#login-form p").text("");
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** show create new story form on click on "add Story" */
function navNewStoryClick() {
  showMyStoriesBtns = false;
  hidePageComponents();
  console.log("clickeds");
  $("#new-story-form .error-msg").text("");
  $(".new-password").remove();
  $(".psw-input").show();
  $newStoryForm.show();
}

$addStory.on("click", navNewStoryClick);

/** Show favorites stories on click favorites */
function showFavoritesStoriesList() {
  $(".new-password").remove();
  showMyStoriesBtns = false;
  $(".psw-input").show();
  $userProfileForm.hide();
  $editStoryForm.hide();
  $newStoryForm.hide();
  storyList = { stories: currentUser.favorites };
  putStoriesOnPage();
}

$navFavStory.on("click", showFavoritesStoriesList);

/** my stories nav  */
function showMyStories() {
  $(".new-password").remove();
  $(".psw-input").show();
  $editStoryForm.hide();
  $newStoryForm.hide();
  $userProfileForm.hide();
  storyList = { stories: currentUser.ownStories };
  showMyStoriesBtns = true;
  putStoriesOnPage();
}

$navMyStories.on("click", showMyStories);

/** User Profile Nav Click */
function userProfileClicked() {
  showMyStoriesBtns = false;
  $userProfileForm.show();
  $newStoryForm.hide();
  $editStoryForm.hide();
  $allStoriesList.empty();
  editUserProfile();
}
$navUserProfile.on("click", userProfileClicked);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $addStory.show();
  $navFavStory.show();
  $navMyStories.show();
  $navLogin.hide();
  $loginForm.hide();
  $signupForm.hide();
  $navLogOut.show();

  $navUserProfile.text(`${currentUser.username}`).show();
}

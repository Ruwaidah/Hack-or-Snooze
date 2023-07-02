"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  $newStoryForm.hide();
  console.debug("navAllStories", evt);
  hidePageComponents();
  // putStoriesOnPage();
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
  console.log("clickeds");
  $("#new-story-form .error-msg").text("")
  $("#story-title").val("");
  $("#story-author").val("");
  $("#story-url").val("");
  $allStoriesList.empty();
  $newStoryForm.show();
}

$addStory.on("click", navNewStoryClick);

/** Show favorites stories on click favorites */
function showFavoritesStoriesList() {
  $editStoryForm.hide();
  $newStoryForm.hide();
  storyList = { stories: currentUser.favorites };
  putStoriesOnPage();
}

$navFavStory.on("click", showFavoritesStoriesList);

/** my stories nav  */
function showMyStories() {
  $editStoryForm.hide();
  $newStoryForm.hide();
  storyList = { stories: currentUser.ownStories };
  putStoriesOnPage();
}

$navMyStories.on("click", showMyStories);

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

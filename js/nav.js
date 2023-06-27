"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
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
  console.log("clickeds")
  $newStoryForm.show()
}

$navStory.on("click", navNewStoryClick)


/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navStory.show()
  $navLogin.hide();
  $navLogOut.show();

  $navUserProfile.text(`${currentUser.username}`).show();
}

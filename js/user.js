"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();
  $("#signup-form p").text("");
  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);
  $loginForm.trigger("reset");
  if (currentUser) {
    saveUserCredentialsInLocalStorage();
    getAndShowStoriesOnStart();
    updateUIOnUserLogin();
  }
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();
  $("#login-form p").text("");
  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);
  if (currentUser) {
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();

    $signupForm.trigger("reset");
  }
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);

  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/** show User profile */
async function editUserProfile() {
  $("#username-profile").val(currentUser.username);
  $("#name-profile").val(currentUser.name);
}

function addChangePswInput() {
  $(".psw-input").hide();
  const $newPasswordInputs = $(`<div class="new-password">
  <p class="new-psw-not-match-msg"></p>
    <label>New Password</label>
    <input id="new-psw" type="password" placeholder="new password" required/>
  </div>
  <div class="new-password">
    <label>Re Type New Password</label>
    <input id="re-new-psw" type="password" placeholder="re type new password" required/>
  </div>`);

  $(".user-profile-bts").prepend($newPasswordInputs);
}

$("#change-psw").on("click", addChangePswInput);

$("#userprofile-cancel").on("click", () => {
  $userProfileForm.hide();
  getAndShowStoriesOnStart();
  $(".new-password").remove();
  $(".psw-input").show();
  $(".new-psw-not-match-msg").text("");
});

async function updateUserSubmit(evt) {
  evt.preventDefault();
  let newPsw;
  let reNewPsw;
  const username = $("#username-profile").val();
  const name = $("#name-profile").val();
  if ($("#new-psw")) {
    newPsw = $("#new-psw").val();
    reNewPsw = $("#re-new-psw").val();
    if (newPsw !== reNewPsw) {
      $(".new-password input").addClass("new-password-error-msg");
      $(".new-psw-not-match-msg").text("Both Passwords Must Be Match");
      return
    } else {
      await User.updateUserProfile({ username, name, password: newPsw });
      await checkForRememberedUser();
      $userProfileForm.hide();
      getAndShowStoriesOnStart();
    }
  } else {
    await User.updateUserProfile({ username, name });
    await checkForRememberedUser();
    $userProfileForm.hide();
    getAndShowStoriesOnStart();
  }
  $(".new-password").remove();
  $(".psw-input").show();
  $(".new-psw-not-match-msg").text("");
}

$userProfileForm.on("submit", updateUserSubmit);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
}

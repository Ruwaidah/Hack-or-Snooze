"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let showMyStoriesBtns = false
/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  let myStory;
  let showFavStar;
  if (currentUser) {
    let favStory = find(currentUser.favorites, story);
    myStory = find(currentUser.ownStories, story);
    showFavStar = `<i class="${
      favStory ? "fa-solid" : "fa-regular"
    } star fa-star"></i>`;
  }
  return $(`
      <li id="${story.storyId}">
        <div>
          ${showFavStar ? showFavStar : ""}
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${story.getHostName()})</small>
        </div>
        <div class="auth-postby-trash">
          <div class="${showFavStar ? "author-username-div" : ""}">
            <small class="story-author">by ${story.author}</small>
            <small class="story-user">posted by ${story.username}</small>
          </div> ${
            showMyStoriesBtns
              ? '<div class="edit-delete-story-div"><button class="edit-story">Edit</button> <i class="fa-solid fa-trash trash" style="color: #de0d0d;"></i></div>'
              : ""
          } 
       </div>
      </li>
    `);
}

function find(array, story) {
  return array.find((mystory) => story.storyId === mystory.storyId);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
console.log(storyList.stories)
  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  if (storyList.stories.length === 0)
    $allStoriesList.append("<p>No Stories to Show</p>");
  else {
    for (let story of storyList.stories) {
      const $story = generateStoryMarkup(story);
      $allStoriesList.append($story);
    }
  }
  $allStoriesList.show();
}

/** add new story  */

async function addNewStory(evt) {
  evt.preventDefault();
  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();
  const story = {
    author,
    title,
    url,
  };
  const data = await StoryList.addStory(story);
console.log(data)
  if (data) {
    getAndShowStoriesOnStart();
    $newStoryForm.hide();
  }
  $newStoryForm.trigger("reset");
}

$newStoryForm.on("submit", addNewStory);
$("#new-story-cancel").on("click", () => {
  $newStoryForm.hide();
  putStoriesOnPage();
});

/** add remove favorite story */
async function favUnfavStory(evt) {
  const data = await User.favoritesStory(
    $(evt.target).closest("li").prop("id")
  );
  data
    ? $(evt.target).removeClass("fa-regular").addClass("fa-solid")
    : $(evt.target).removeClass("fa-solid").addClass("fa-regular");
}

$allStoriesList.on("click", "i.star", favUnfavStory);

/** delete story */
async function deleteStory(evt) {
  const storyId = $(evt.target).closest("li").prop("id");
  const deleted = await StoryList.deleteStory(storyId);
  if (deleted) {
    await checkForRememberedUser();
    storyList.stories = storyList.stories.filter(
      (story) => story.storyId !== storyId
    );
    putStoriesOnPage();
  }
}

$allStoriesList.on("click", "i.trash", deleteStory);

/** edit Story */
let theStoryValues;
async function editStory(evt) {
  console.log(storyList)
  const storyId = $(evt.target).closest("li").prop("id");
  console.log(storyId)
  theStoryValues = storyList.stories.find((story) => story.storyId === Number(storyId));
  console.log(theStoryValues)
  $allStoriesList.empty();
  $editStoryForm.show();
  $("#edit-story-title").val(theStoryValues.title);
  $("#edit-story-author").val(theStoryValues.author);
  $("#edit-story-url").val(theStoryValues.url);
}

$editStoryForm.on("submit", editMyStoryInfo);

$("#edit-story-cancel").on("click", () => {
  $editStoryForm.hide();
  putStoriesOnPage();
});

$allStoriesList.on("click", ".edit-delete-story-div button", editStory);

async function editMyStoryInfo() {
  const title = $("#edit-story-title").val();
  const author = $("#edit-story-author").val();
  const url = $("#edit-story-url").val();
  const editstory = {
    storyId: theStoryValues.storyId,
    author,
    title,
    url,
  };
  const data = await StoryList.editMyStory(
    localStorage.getItem("token"),
    editstory
  );

  if (data) {
    await checkForRememberedUser();
    getAndShowStoriesOnStart();
    $("#story-title").val("");
    $("#story-author").val("");
    $("#story-url").val("");
    $editStoryForm.hide();
  }
}

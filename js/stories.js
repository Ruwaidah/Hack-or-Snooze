"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

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
  const hostName = story.getHostName();
  let favStory;
  if (currentUser) {
    favStory = currentUser.favorites.find(
      (element) => element.storyId === story.storyId
    );
  }
  return $(`
      <li id="${story.storyId}">
      <i class="${favStory ? "fa-solid" : "fa-regular"} fa-star" ></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** add new story  */

async function addNewStory() {
  const token = localStorage.getItem("token");
  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();
  const story = {
    author,
    title,
    url,
  };
  const data = await StoryList.addStory(token, story);
  // getAndShowStoriesOnStart();
  if (data) {
    const story = generateStoryMarkup(data);
    $allStoriesList.prepend(story);
  }
  $("#story-title").val("");
  $("#story-author").val("");
  $("#story-url").val("");
  $newStoryForm.hide();
}
$newStoryForm.on("submit", addNewStory);
$("#new-story-cancel").on("click", () => $newStoryForm.hide());


async function favUnfavStory(evt) {
  const data = await User.favoritesStory($(evt.target).parent().prop("id"));
  data
    ? $(evt.target).removeClass("fa-regular").addClass("fa-solid")
    : $(evt.target).removeClass("fa-solid").addClass("fa-regular");
}


$allStoriesList.on("click", "i", favUnfavStory);

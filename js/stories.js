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
  let myStory;
  let showFavStar;
  if (currentUser) {
    favStory = currentUser.favorites.find(
      (element) => element.storyId === story.storyId
    );
    myStory = currentUser.ownStories.find(
      (mystory) => story.storyId === mystory.storyId
    );
  }
  if (localStorage.getItem("token"))
    showFavStar = `<i class="${
      favStory ? "fa-solid" : "fa-regular"
    } star fa-star"></i>`;
  return $(`
      <li id="${story.storyId}">
        <div>
          ${showFavStar? showFavStar : ""}
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
        </div>
        <div class="auth-postby-trash">
          <div class="${showFavStar? "author-username-div" : ""}">
            <small class="story-author">by ${story.author}</small>
            <small class="story-user">posted by ${story.username}</small>
          </div> ${
            myStory
              ? '<i class="fa-solid fa-trash trash" style="color: #de0d0d;"></i>'
              : ""
          } 
       </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

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
  if (data) {
    await checkForRememberedUser();
    $("#all-stories-list p").remove();
    getAndShowStoriesOnStart();
  }
  $("#story-title").val("");
  $("#story-author").val("");
  $("#story-url").val("");
  $newStoryForm.hide();
}
$newStoryForm.on("submit", addNewStory);
$("#new-story-cancel").on("click", () => {
  $newStoryForm.hide();
  getAndShowStoriesOnStart();
});

/** add remove favorite story */
async function favUnfavStory(evt) {
  console.log("click");
  const data = await User.favoritesStory(
    $(evt.target).parent().parent().prop("id")
  );
  await checkForRememberedUser();
  data
    ? $(evt.target).removeClass("fa-regular").addClass("fa-solid")
    : $(evt.target).removeClass("fa-solid").addClass("fa-regular");
}

$allStoriesList.on("click", "i.star", favUnfavStory);

/** delete story */
async function deleteStory(evt) {
  console.log("click");
  await User.deleteStory($(evt.target).parent().parent().prop("id"));
  await checkForRememberedUser();
  // getAndShowStoriesOnStart();
  storyList.stories = storyList.stories.filter(
    (story) => story.storyId !== $(evt.target).parent().parent().prop("id")
  );
  putStoriesOnPage();
}

$allStoriesList.on("click", "i.trash", deleteStory);

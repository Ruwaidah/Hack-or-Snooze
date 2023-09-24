"use strict";

// const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";
const BASE_URL = "http://localhost:5000/api";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */
  getHostName() {
    return new URL(this.url).hostname;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryLis*/

  static async getStories() {
    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    console.log(response)
    const stories = response.data.stories.map((story) => new Story(story));
    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  // Adds story data to API, makes a Story instance, adds it to story list
  static async addStory(newStory) {
    try {
      const { data } = await axios({
        url: `${BASE_URL}/stories`,
        method: "POST",
        headers: {
          authorization: currentUser.loginToken,
        },
        data: { token: currentUser.loginToken, story: newStory },
      });
      console.log(data)
      currentUser.ownStories.unshift(new Story({ ...data.story }));
      return new Story({ ...data.story });
    } catch (err) {
      console.log(err)
      $("#new-story-form .error-msg").text(err.response.data.message);
    }
  }

  /** deleteing Story */
  static async deleteStory(storyId) {
    try {
      const response = await axios({
        url: `${BASE_URL}/stories/${storyId}`,
        method: "DELETE",
        params: { token: currentUser.loginToken },
      });
      return response.data;
    } catch (error) {
      return false;
    }
  }

  /** edit my story */
  static async editMyStory(token, story) {
    try {
      const { data } = await axios({
        url: `${BASE_URL}/stories/${story.storyId}`,
        method: "PATCH",
        data: {
          token,
          story: { author: story.author, title: story.title, url: story.url },
        },
      });
      return data;
    } catch (err) {
      console.log(err.response.data.error.message);
    }
  }
}

/******************************************************************************
 * User: a user in the system
 */

class User {
  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API*/

  static async signup(username, password, name) {
    try {
      const response = await axios({
        url: `${BASE_URL}/signup`,
        method: "POST",
        data: { user: { username, password, name } },
      });

      let { user } = response.data;
      console.log(user)
      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        response.data.token
      );
    } catch (error) {
      console.log(error.response)
      $("#signup-form p").text(error.response.data.message);
    }
  }

  /** Login in user with API  */

  static async login(username, password) {
    console.log(username, password);
    try {
      const response = await axios({
        url: `${BASE_URL}/login`,
        method: "POST",
        data: { user: { username, password } },
      });
      console.log(response);
      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        response.data.token
      );
    } catch (error) {
      console.log(error.response.data.message);
      $("#login-form p").text(error.response.data.message);
    }
  }

  /** already have credentials (token & username) for a user,
   *   log them in automatically.
   */

  static async loginViaStoredCredentials(token, username) {
    console.log("login");
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        headers: {
          authorization: token,
        },
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  static async updateUserProfile(data) {
    const token = localStorage.getItem("token");
    await axios({
      url: `${BASE_URL}/users/${currentUser.username}`,
      method: "PATCH",
      headers: {
        authorization: token,
      },
      data: { token, user: data },
    });
  }

  /** favorite unfavorite story */
  static async favoritesStory(storyId) {
    const favStory = currentUser.favorites.find(
      (element) => element.storyId === storyId
    );
    const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
      method: favStory ? "DELETE" : "POST",
      params: { token: currentUser.loginToken },
    });
    if (favStory) {
      currentUser.favorites = currentUser.favorites.filter((story) => {
        if (story.storyId !== storyId) return new Story(story);
      });
      return false;
    } else {
      currentUser.favorites = response.data.user.favorites.map(
        (story) => new Story(story)
      );
      return true;
    }
  }
}

import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Controller
const controlRecipes = async function () {
  try {
    // get the id of recipe
    const id = window.location.hash.slice(1);

    // guard code even if no id the page will still render
    if (!id) return;

    // Render spinner
    recipeView.renderSpinner();

    // Update results view to mark selected search result - pagination
    resultsView.update(model.getSearchResultsPage());

    // Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // Loading recipe - from model.js
    await model.loadRecipe(id);

    // Rendering recipe - from recipeView.js
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.log(err);
    recipeView.renderError();
  }
};

// controller to display all result on the left side
const controlSearchResult = async function () {
  try {
    resultsView.renderSpinner();

    // To get search query
    const query = searchView.getQuery();
    if (!query) return;

    // Load search results - for the left side UI
    await model.loadSearchResults(query);

    // Render results on the UI
    resultsView.render(model.getSearchResultsPage());

    // render new results
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);
  console.log(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // model.addBookmark(model.state.recipe);
  // update recipeView
  recipeView.update(model.state.recipe);

  // render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddrecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload new Recipe data
    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // render bookmarkview
    bookmarksView.render(model.state.bookmarks);

    // change ID in URL - pushState has 3 parameter - 1st(state-can be null), 2nd(title-can be ''), 3rd(URL)
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.render(err.message);
  }
};

// function that will run every view controllers
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddrecipe);
};
init();

import { combineReducers } from "@reduxjs/toolkit";

// Create a simple initial reducer to ensure the store has at least one reducer
const initialReducer = (state = { initialized: true }, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

// Combine reducers - make sure this is an object with at least one valid reducer function
const rootReducer = combineReducers({
  initial: initialReducer,
  // Add your other reducers here as you create them
  // users: usersReducer,
  // posts: postsReducer,
});

export default rootReducer;

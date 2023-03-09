export const initialState = {
  likeCount: 0,
  dislikeCount: 0,
  likeActive: false,
  dislikeActive: false
};

export const reducer = function reducer(state, action) {
  switch (action.type) {
    case "like":
      if (!state.likeActive) {
        const reduceLastActive = state.dislikeActive ? 1 : 0;
        return {
          ...state,
          dislikeCount: state.dislikeCount - reduceLastActive,
          likeCount: state.likeCount + 1,
          dislikeActive: false,
          likeActive: true
        };
      } else {
        return {
          ...state,
          likeCount: state.likeCount - 1,
          likeActive: false
        };
      }
    case "dislike":
      if (!state.dislikeActive) {
        const reduceLastActive = state.likeActive ? 1 : 0;
        return {
          ...state,
          likeCount: state.likeCount - reduceLastActive,
          dislikeCount: state.dislikeCount + 1,
          likeActive: false,
          dislikeActive: true
        };
      } else {
        return {
          ...state,
          dislikeCount: state.dislikeCount - 1,
          dislikeActive: false
        };
      }
    default:
      return state;
  }
};

import { useReducer } from "react";
import { reducer, initialState } from "./state";

function LikeDislike() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const dispatchHandler = (type) => {
    dispatch({ type });
  };
  return (
    <div>
      <button
        onClick={dispatchHandler.bind(this, "like")}
        style={{ color: state.likeActive ? "blue" : "black" }}
      >
        Like
        {Boolean(state.likeCount) && ` (${state.likeCount})`}
      </button>
      <button
        onClick={dispatchHandler.bind(this, "dislike")}
        style={{ color: state.dislikeActive ? "red" : "black" }}
      >
        Dislike
        {Boolean(state.dislikeCount) && ` (${state.dislikeCount})`}
      </button>
    </div>
  );
}
export default LikeDislike;

let refreshFailed = false;

export const markRefreshFailed = () => {
  refreshFailed = true;
};

export const hasRefreshFailed = () => refreshFailed;

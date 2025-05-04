export const extractVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop();
    } catch {
      return "";
    }
  };
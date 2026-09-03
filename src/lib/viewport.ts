export const PHONE_LAYOUT_QUERY = "(max-width: 760px)";
export const PHONE_LAYOUT_MAX_WIDTH = 760;

export const viewsForViewport = <T>(views: readonly T[], phoneLayout: boolean) =>
  phoneLayout ? views.slice(0, 1) : [...views];

export const readPhoneLayout = (
  mediaMatches: boolean | undefined,
  innerWidth: number,
) => {
  if (mediaMatches === true) return true;
  if (innerWidth <= PHONE_LAYOUT_MAX_WIDTH) return true;
  if (mediaMatches === false) return false;
  return true;
};

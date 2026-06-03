/** Hide scrollbars while preserving scroll (Firefox, legacy Edge, WebKit). */
export const cohortAnalyzerHiddenScrollbarStyles = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
    width: 0,
    height: 0,
  },
};

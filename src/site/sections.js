// Plain data/helpers shared by site components (kept out of component files for Fast Refresh).

/** Section ids, in page order: anchors for the header nav and the scrollspy. */
export const SECTION_IDS = ['home', 'expertise', 'work', 'experience', 'contact'];

/** Projects shown for a filter ("all" shows every project). */
export const filterProjects = (list, category) =>
  category === 'all' ? list : list.filter((p) => p.category === category);

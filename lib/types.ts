export type PrintModel = {
  /** Stable, source-namespaced id, e.g. "thingiverse:12345" */
  id: string;
  source: "thingiverse" | "printables" | "thangs" | "seed";
  title: string;
  creator: string;
  /** Image shown on the swipe card. May be a remote URL or a data: URL. */
  thumbnail: string;
  /** Link to the original model page (always present so we credit the source). */
  sourceUrl: string;
  /**
   * Best-effort direct download URL for the model file (STL/3MF/etc).
   * May be undefined when the source requires auth or on-demand resolution;
   * in that case the UI links to `sourceUrl` instead.
   */
  downloadUrl?: string;
  license?: string;
  tags?: string[];
};

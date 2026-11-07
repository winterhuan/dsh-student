/** Example tags used when a profile has not saved its own list. */
export declare const DEFAULT_INTEREST_TAGS: readonly ["购物超市钱", "运动球类", "动物宠物", "故事角色动画", "积木拼搭手工", "美食做饭"];
/** One saved tag: 2–16 Han characters, letters or digits, with no spaces. */
export declare const INTEREST_TAG: RegExp;
/** Tags the tutor and the desk should use: the saved list, or the examples when none is saved. */
export declare function interestTagsOf(saved: readonly string[] | undefined): string[];
/**
 * The tag to wrap first today. The Shanghai calendar day rotates through the list so the same scene is not used every day.
 * @param tags - the effective tag list.
 * @param day - `YYYY-MM-DD` in the teaching timezone.
 */
export declare function interestFocus(tags: readonly string[], day: string): string;
//# sourceMappingURL=interests.d.ts.map
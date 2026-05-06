import type { LINK_SPACE_MESSAGE_IDS } from '../utils/rules/link'

/**
 * The allowed issue ids for link spacing rules.
 */
export type LinkSpaceIssue = typeof LINK_SPACE_MESSAGE_IDS[keyof typeof LINK_SPACE_MESSAGE_IDS]

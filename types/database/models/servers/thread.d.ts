// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Query, Relation} from '@nozbe/watermelondb';
import Model, {Associations} from '@nozbe/watermelondb/Model';

/**
 * The Thread model contains thread information of a post.
 */
export default class ThreadModel extends Model {
    /** table (name) : Post */
    static table: string;

    /** associations : Describes every relationship to this table. */
    static associations: Associations;

    /** last_reply_at : The timestamp of when user last replied to the thread. */
    lastReplyAt: number;

    /** last_viewed_at : The timestamp of when user last viewed the thread. */
    lastViewedAt: number;

    /** participants: All the participants of the thread */
    participants: Query<ThreadParticipantsModel>;

    /** post : Query returning the post data for the current thread */
    post: Relation<Post>;

    /** reply_count : The total replies to the thread by all the participants. */
    replyCount: number;

    /** unread_replies : The number of replies that are not read by the user. */
    unreadReplies: number;

    /** unread_mentions : The number of mentions that are not read by the user. */
    unreadMentions: number;
}

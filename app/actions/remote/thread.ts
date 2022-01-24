// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {processThreadsWithPostsFetched} from '@actions/local/thread';
import {General} from '@constants';
import DatabaseManager from '@database/manager';
import NetworkManager from '@init/network_manager';
import {queryCommonSystemValues} from '@queries/servers/system';
import {queryCurrentUser} from '@queries/servers/user';

import {forceLogoutIfNecessary} from './session';

export type MyPreferencesRequest = {
    preferences?: PreferenceType[];
    error?: unknown;
}

export const getThreads = async (serverUrl: string, teamId: string, before?: string, after?: string, perPage = General.CRT_CHUNK_SIZE, deleted = false, unread = false, since = 0): Promise<any> => {
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;

    if (!operator) {
        return {error: `${serverUrl} database not found`};
    }

    let client;
    try {
        client = NetworkManager.getClient(serverUrl);
    } catch (error) {
        return {error};
    }

    try {
        const {database} = operator;
        const currentUser = await queryCurrentUser(database);
        if (!currentUser) {
            return [];
        }
        const {config} = await queryCommonSystemValues(database);

        const data = await client.getThreads(config.Version, currentUser.id, teamId, before, after, perPage, deleted, unread, since);

        await processThreadsWithPostsFetched(serverUrl, teamId, data.threads);

        return data;
    } catch (error) {
        forceLogoutIfNecessary(serverUrl, error as ClientErrorProps);
        return {error};
    }
};

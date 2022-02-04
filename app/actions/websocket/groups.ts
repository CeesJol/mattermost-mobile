// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {inspect} from 'util';

import DatabaseManager from '@database/manager';

export async function handleGroupUpdatedEvent(serverUrl: string, msg: WebSocketMessage): Promise<void> {
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;
    if (!operator) {
        return;
    }

    console.log('msg = ', inspect(msg, false, null, true /* enable colors */));

    try {
        const group = JSON.parse(msg.data.group);
        operator.handleGroup({
            groups: [group],
            prepareRecordsOnly: false,
        });
    } catch {
        // do nothing
    }
}

export async function handleGroupAssociatedToTeam(serverUrl: string, msg: WebSocketMessage): Promise<void> {
    console.log('GAT');
    console.log('msg = ', inspect(msg, false, null, true /* enable colors */));
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;
    if (!operator) {

    }
}

export async function handleGroupNotAssociatedToTeam(serverUrl: string, msg: WebSocketMessage): Promise<void> {
    console.log('GNAT');
    console.log('msg = ', inspect(msg, false, null, true /* enable colors */));
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;
    if (!operator) {

    }
}

export async function handleGroupAssociatedToChannel(serverUrl: string, msg: WebSocketMessage): Promise<void> {
    console.log('GAC');
    console.log('msg = ', inspect(msg, false, null, true /* enable colors */));
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;
    if (!operator) {

    }
}

export async function handleGroupNotAssociatedToChannel(serverUrl: string, msg: WebSocketMessage): Promise<void> {
    console.log('GNAC');
    console.log('msg = ', inspect(msg, false, null, true /* enable colors */));
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;
    if (!operator) {

    }
}


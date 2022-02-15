// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Model} from '@nozbe/watermelondb';

import DatabaseManager from '@database/manager';
import {prepareCategories, prepareCategoryChannels, queryCategoryById} from '@queries/servers/categories';

export const deleteCategory = async (serverUrl: string, categoryId: string) => {
    const database = DatabaseManager.serverDatabases[serverUrl]?.database;
    if (!database) {
        return {error: `${serverUrl} database not found`};
    }

    try {
        const category = await queryCategoryById(database, categoryId);
        database.write(async () => {
            await category?.destroyPermanently();
        });

        return true;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log('FAILED TO DELETE CATEGORY', categoryId);
        return {error};
    }
};

export const storeCategories = async (serverUrl: string, categories: CategoryWithChannels[], prepareRecordsOnly = false) => {
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;
    if (!operator) {
        return {error: `${serverUrl} database not found`};
    }
    const modelPromises: Array<Promise<Model[]>> = [];
    const preparedCategories = prepareCategories(operator, categories);
    if (preparedCategories) {
        modelPromises.push(...preparedCategories);
    }

    const preparedCategoryChannels = prepareCategoryChannels(operator, categories);
    if (preparedCategoryChannels) {
        modelPromises.push(...preparedCategoryChannels);
    }

    const models = await Promise.all(modelPromises);
    const flattenedModels = models.flat() as Model[];

    if (prepareRecordsOnly) {
        return {models: flattenedModels};
    }

    if (flattenedModels?.length > 0) {
        try {
            await operator.batchRecords(flattenedModels);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('FAILED TO BATCH CATEGORIES', error);
            return {error};
        }
    }

    return {models: flattenedModels};
};

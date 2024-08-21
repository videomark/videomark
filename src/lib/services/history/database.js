import { IndexedDB } from '@sveltia/utils/storage';

export const historyRecordsDB = new IndexedDB('videomark', 'history-records');
export const historyStatsDB = new IndexedDB('videomark', 'history-stats');

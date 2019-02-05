//  import Config from './Config';

export default class ResourceTimingData {
    static get() {
        const list = [];
        // TODO: 現状ではResourceTimingAPIのデータは使用していないのでコメントアウト
        /* 
        performance.getEntriesByType('resource')
            .filter(e => e.name != Config.get_fluent_url())
            .forEach(e => list.push(JSON.parse(JSON.stringify(e))));
        */
        //  performance.clearResourceTimings();
        return list;
    }
}

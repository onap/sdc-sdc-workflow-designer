import RestfulAPIUtil from 'services/restAPIUtil';
import Configuration from 'config/Configuration.js';

function baseUrl() {
    const restPrefix = Configuration.get('restPrefix');
    return `${restPrefix}/v1.0/items`;
}

const Api = {
    fetchData: () => {
        return RestfulAPIUtil.fetch(`${baseUrl()}/test`);
    }
};

export default Api;

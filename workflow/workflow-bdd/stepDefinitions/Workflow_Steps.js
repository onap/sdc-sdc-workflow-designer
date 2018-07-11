/**
 * @module WORKFLOW
 * @description Creates a new WORKFLOW with a random name and saves the id and versionId on the context item object and the context vlm object<br>
 *     Input data  will be taken from the 'resources/json/createWorkflow.json' file.
 * @step I want to create a Workflow
 **/

const {Then, When, Given} = require('cucumber');
const assert = require('assert');
const util = require('./Utils.js');

When('I want to create a Workflow', function()  {
    let inputData = util.getJSONFromFile('resources/json/createWorkflow.json');
    inputData.name = util.random();
    let path = '/workflows';
    return util.request(this.context, 'POST', path, inputData).then(result => {
        this.context.item ={id : result.data.id};
});
});
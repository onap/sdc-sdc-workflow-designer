/*
 * Copyright © 2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @module WORKFLOW
 * @description Creates a new WORKFLOW with a random name and saves the id and versionId on the context item object<br>
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
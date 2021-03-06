# Copyright © 2018 European Support Limited
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

Feature: Workflow Versions

  Background: Init - Create workflow
    Given I want to create a Workflow

  Scenario: Create first empty version
    When I want to update the input property "description" with value "first empty version"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to copy to property "item.versionId" from response data path "id"

    Then I want to get path "/workflows/{item.id}/versions/{item.versionId}"
    And I want to check that property "id" in the response equals to value of saved property "item.versionId"
    And I want to get path "/workflows/{item.id}/versions"
    And I want to check in the list "items" property "id" with value of saved property "item.versionId" exists

  Scenario: Create first version with inputs/outputs
    When I want to set the input data to file "resources/json/versionWith2Inputs2Outputs1.json"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context

    Then I want to check in the list "inputs" property "name" with value "in1" exists
    And I want to check in the list "inputs" property "name" with value "in2" exists
    And I want to check in the list "outputs" property "name" with value "out1" exists
    And I want to check in the list "outputs" property "name" with value "out2" exists

  Scenario: Create second version
    And I want to update the input property "description" with value "first empty version"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to copy to property "item.firstVersionId" from response data path "id"
    And I want to update the input property "name" with value "CERTIFIED"
    And I want to create for path "/workflows/{item.id}/versions/{item.firstVersionId}/state" with the input data from the context

    When I want to create input data
    And I want to update the input property "description" with value "second empty version"
    And I want to create for path "/workflows/{item.id}/versions?baseVersionId={item.firstVersionId}" with the input data from the context
    And I want to copy to property "item.versionId" from response data path "id"

    Then I want to get path "/workflows/{item.id}/versions/{item.versionId}"
    And I want to check that property "id" in the response equals to value of saved property "item.versionId"
    And I want to get path "/workflows/{item.id}/versions"
    And I want to check in the list "items" property "id" with value of saved property "item.versionId" exists

  Scenario: Update version
    And I want to create input data
    And I want to update the input property "description" with value "workflow version description"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to copy to property "item.versionId" from response data path "id"

    When I want to update the input property "description" with value "workflow version description updated"
    And I want to update for path "/workflows/{item.id}/versions/{item.versionId}" with the input data from the context

    Then I want to get path "/workflows/{item.id}/versions/{item.versionId}"
    And I want to check property "description" for value "workflow version description updated"

  Scenario: Update version with duplicate input name - invalid
    And I want to update the input property "description" with value "version with with duplicate input name"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to copy to property "item.versionId" from response data path "id"

    And I want to set the input data to file "resources/json/versionWithDuplicateInputName.json"
    Then I want the following to fail with response status code 400
    When I want to update for path "/workflows/{item.id}/versions/{item.versionId}" with the input data from the context

  Scenario: Update version with duplicate output name - invalid
    And I want to update the input property "description" with value "version with with duplicate output name"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to copy to property "item.versionId" from response data path "id"

    And I want to set the input data to file "resources/json/versionWithDuplicateOutputName.json"
    Then I want the following to fail with response status code 400
    When I want to update for path "/workflows/{item.id}/versions/{item.versionId}" with the input data from the context

  Scenario: Update version with inputs/outputs (create/update/delete parameters)
    And I want to set the input data to file "resources/json/versionWith2Inputs2Outputs1.json"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to copy to property "item.versionId" from response data path "id"

    When I want to set the input data to file "resources/json/versionWith2Inputs2Outputs2.json"
    And I want to update for path "/workflows/{item.id}/versions/{item.versionId}" with the input data from the context

    Then I want to get path "/workflows/{item.id}/versions/{item.versionId}"
    And I want to check in the list "inputs" property "name" with value "in1" exists
    And I want to check in the list "inputs" property "name" with value "in2" does not exist
    And I want to check in the list "inputs" property "name" with value "in3" exists
    And I want to check in the list "outputs" property "name" with value "out1" exists
    And I want to check in the list "outputs" property "name" with value "out2" does not exist
    And I want to check in the list "outputs" property "name" with value "out3" exists


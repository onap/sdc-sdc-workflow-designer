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

Feature: Workflow Version State

  Background: Create workflow and first version
    Given I want to create a Workflow
    And I want to update the input property "description" with value "workflow version description"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to copy to property "item.versionId" from response data path "id"

  Scenario: Get state after creation
    When I want to get path "/workflows/{item.id}/versions/{item.versionId}/state"
    Then I want to check property "name" for value "DRAFT"
    And I want to check property "nextStates[0]" for value "CERTIFIED"

  Scenario: Update state to current state
    Then I want the following to fail with response status code 422
    When I want to update the input property "name" with value "DRAFT"
    And I want to create for path "/workflows/{item.id}/versions/{item.versionId}/state" with the input data from the context

  Scenario: Update state - DRAFT to CERTIFIED
    When I want to update the input property "name" with value "CERTIFIED"
    And I want to create for path "/workflows/{item.id}/versions/{item.versionId}/state" with the input data from the context
    Then I want to get path "/workflows/{item.id}/versions/{item.versionId}/state"
    And I want to check property "name" for value "CERTIFIED"
    And I want to check property "nextStates" to have length 0

  Scenario: Update state when CERTIFIED
    When I want to update the input property "name" with value "CERTIFIED"
    And I want to create for path "/workflows/{item.id}/versions/{item.versionId}/state" with the input data from the context
    When I want the following to fail with response status code 422
    Then I want to create for path "/workflows/{item.id}/versions/{item.versionId}/state" with the input data from the context
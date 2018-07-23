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

  Background: Init
    Given I want to create a Workflow

  Scenario: Create first empty version
    When I want to create input data
    And I want to update the input property "description" with value "first empty version"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to copy to property "item.versionId" from response data path "id"

    Then I want to get path "/workflows/{item.id}/versions/{item.versionId}"
    And I want to check that property "id" in the response equals to value of saved property "item.versionId"
    And I want to get path "/workflows/{item.id}/versions"
    And I want to check that element in the response list with "id" equals to value of saved property "item.versionId" exists

  Scenario: Update version
    And I want to create input data
    And I want to update the input property "description" with value "workflow version description"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to copy to property "item.versionId" from response data path "id"

    When I want to set property "updatedDesc" to value "workflow version description updated"
    And I want to update the input property "description" with value of property "updatedDesc"
    And I want to update for path "/workflows/{item.id}/versions/{item.versionId}" with the input data from the context

    Then I want to get path "/workflows/{item.id}/versions/{item.versionId}"
    And I want to check that property "description" in the response equals to value of saved property "updatedDesc"
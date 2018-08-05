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

Feature: Workflows list

  Background: Init - create various workflows in order to test list filter
    Given I want to create a Workflow
    And I want to copy to property "noVersionsWorkflowId" from response data path "id"

    Given I want to create a Workflow
    And I want to copy to property "draftVersionWorkflowId" from response data path "id"
    And I want to update the input property "description" with value "first version"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context

    Given I want to create a Workflow
    And I want to copy to property "certifiedVersionWorkflowId" from response data path "id"
    And I want to update the input property "description" with value "first version"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to update the input property "name" with value "CERTIFIED"
    And I want to create for path "/workflows/{item.id}/versions/{responseData.id}/state" with the input data from the context

    Given I want to create a Workflow
    And I want to copy to property "draftAndCertifiedVersionWorkflowId" from response data path "id"
    And I want to update the input property "description" with value "first version"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    And I want to copy to property "item.versionId" from response data path "id"
    And I want to update the input property "name" with value "CERTIFIED"
    And I want to create for path "/workflows/{item.id}/versions/{item.versionId}/state" with the input data from the context
    And I want to update the input property "description" with value "second version"
    And I want to create for path "/workflows/{item.id}/versions?baseVersionId={item.versionId}" with the input data from the context

  Scenario: List all
    When I want to get path "/workflows?limit=2000"
    Then I want to check in the list "items" property "id" with value of saved property "noVersionsWorkflowId" exists
    And I want to check in the list "items" property "id" with value of saved property "draftVersionWorkflowId" exists
    And I want to check in the list "items" property "id" with value of saved property "certifiedVersionWorkflowId" exists
    And I want to check in the list "items" property "id" with value of saved property "draftAndCertifiedVersionWorkflowId" exists

  Scenario: List ones with DRAFT version(s)
    When I want to get path "/workflows?versionState=DRAFT&limit=2000"
    Then I want to check in the list "items" property "id" with value of saved property "noVersionsWorkflowId" does not exist
    And I want to check in the list "items" property "id" with value of saved property "draftVersionWorkflowId" exists
    And I want to check in the list "items" property "id" with value of saved property "certifiedVersionWorkflowId" does not exist
    And I want to check in the list "items" property "id" with value of saved property "draftAndCertifiedVersionWorkflowId" exists

  Scenario: List ones with CERTIFIED version(s)
    When I want to get path "/workflows?versionState=CERTIFIED&limit=2000"
    Then I want to check in the list "items" property "id" with value of saved property "noVersionsWorkflowId" does not exist
    And I want to check in the list "items" property "id" with value of saved property "draftVersionWorkflowId" does not exist
    And I want to check in the list "items" property "id" with value of saved property "certifiedVersionWorkflowId" exists
    And I want to check in the list "items" property "id" with value of saved property "draftAndCertifiedVersionWorkflowId" exists

  Scenario: List ones with DRAFT/CERTIFIED version(s)
    When I want to get path "/workflows?versionState=DRAFT,CERTIFIED&limit=2000"
    Then I want to check in the list "items" property "id" with value of saved property "noVersionsWorkflowId" does not exist
    And I want to check in the list "items" property "id" with value of saved property "draftVersionWorkflowId" exists
    And I want to check in the list "items" property "id" with value of saved property "certifiedVersionWorkflowId" exists
    And I want to check in the list "items" property "id" with value of saved property "draftAndCertifiedVersionWorkflowId" exists

  Scenario: List ones with gibberish version(s) = none
    When I want to get path "/workflows?versionState=gibberish&limit=2000"
    Then I want to check in the list "items" property "id" with value of saved property "noVersionsWorkflowId" does not exist
    And I want to check in the list "items" property "id" with value of saved property "draftVersionWorkflowId" does not exist
    And I want to check in the list "items" property "id" with value of saved property "certifiedVersionWorkflowId" does not exist
    And I want to check in the list "items" property "id" with value of saved property "draftAndCertifiedVersionWorkflowId" does not exist
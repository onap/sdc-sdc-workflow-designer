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

Feature: Archive Workflow

  Scenario: Archive workflow
    Given I want to create a Workflow
    When I want to create input data
    And I want to update the input property "status" with value "ARCHIVED"
    And I want to create for path "/workflows/{item.id}/archiving" with the input data from the context
    Then I want to get path "/workflows/{item.id}"
    And I want to check property "status" for value "ARCHIVED"
    When I want to get path "/workflows?limit=2000&statusFilter=ARCHIVED"
    Then I want to check in the list "items" property "id" with value "{item.id}" exists
    When I want to get path "/workflows?limit=2000&"
    Then I want to check in the list "items" property "id" with value "{item.id}" does not exist


  Scenario: Archive and then Restore workflow
    Given I want to create a Workflow
    When I want to create input data
    And I want to update the input property "status" with value "ARCHIVED"
    And I want to create for path "/workflows/{item.id}/archiving" with the input data from the context
    Then I want to get path "/workflows/{item.id}"
    And I want to check property "status" for value "ARCHIVED"
    When I want to get path "/workflows?limit=2000&statusFilter=ARCHIVED"
    Then I want to check in the list "items" property "id" with value "{item.id}" exists
    When I want to get path "/workflows?limit=2000&"
    Then I want to check in the list "items" property "id" with value "{item.id}" does not exist
    And I want to update the input property "status" with value "ACTIVE"
    And I want to create for path "/workflows/{item.id}/archiving" with the input data from the context
    Then I want to get path "/workflows/{item.id}"
    And I want to check property "status" for value "ACTIVE"
    When I want to get path "/workflows?limit=2000&statusFilter=ARCHIVED"
    Then I want to check in the list "items" property "id" with value "{item.id}" does not exist
    When I want to get path "/workflows?limit=2000&"
    Then I want to check in the list "items" property "id" with value "{item.id}" exists

  Scenario: Archive already archived workflow
    Given I want to create a Workflow
    When I want to create input data
    And I want to update the input property "status" with value "ARCHIVED"
    And I want to create for path "/workflows/{item.id}/archiving" with the input data from the context
    When I want to create input data
    And I want to update the input property "status" with value "ARCHIVED"
    Then I want the following to fail with response status code 422
    And I want to create for path "/workflows/{item.id}/archiving" with the input data from the context

  Scenario: Restore already active workflow
    Given I want to create a Workflow
    When I want to create input data
    And I want to update the input property "status" with value "ACTIVE"
    Then I want the following to fail with response status code 422
    And I want to create for path "/workflows/{item.id}/archiving" with the input data from the context




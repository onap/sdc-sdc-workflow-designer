Feature: Activity Spec

   #SDC-6350
  Scenario: Create
    When I want to set the input data to file "resources/json/createActivitySpec.json"
    Then I want to update the input property "name" with a random value
    When I want to create an ActivitySpec

    Then I want to check property "id" exists
    And I want to check property "versionId" exists

    And I want to list ActivitySpecs with status "Draft"
    And I want to check property "total" exists

    And I want to get the ActivitySpec for the current item
    And I want to check property "status" for value "Draft"

    And I want to call action "CERTIFY" on this ActivitySpec item
    And I want to get the ActivitySpec for the current item
    And I want to check property "status" for value "Certified"

    And I want to call action "DEPRECATE" on this ActivitySpec item
    And I want to get the ActivitySpec for the current item
    And I want to check property "status" for value "Deprecated"

    And I want to call action "DELETE" on this ActivitySpec item
    And I want to get the ActivitySpec for the current item
    And I want to check property "status" for value "Deleted"

  Scenario: Get with invalid Id
    Then I want to set property "item.id" to value "invalidId"
    Then I want the following to fail with error message "No Activity Spec found for the given identifiers"
    And I want to get the ActivitySpec for the current item

   #SDC-6353
  Scenario: Create with duplicate name - invalid
    Given I want to set property "duplicateName" with a random value
    And I want to set the input data to file "resources/json/createActivitySpec.json"
    And I want to update the input property "name" with value of property "duplicateName"
    And I want to create an ActivitySpec
    And I want to check property "id" exists
    And I want to check property "versionId" exists

    When I want to set the input data to file "resources/json/createActivitySpec.json"
    And I want to update the input property "name" with value of property "duplicateName"
    Then I want the following to fail with response status code 422
    And I want to create an ActivitySpec

   #SDC-6354
  Scenario: Create with invalid name - invalid
    Given I want to set the input data to file "resources/json/createActivitySpec.json"
    And I want to update the input property "name" with value "test!@"
    Then I want the following to fail with response status code 400
    When I want to create an ActivitySpec

   #SDC-6355
  Scenario: Create with null/blank name - invalid
    Given I want to set the input data to file "resources/json/createActivitySpec.json"
    And I want to update the input property "name" with value ""
    Then I want the following to fail with response status code 400
    When I want to create an ActivitySpec
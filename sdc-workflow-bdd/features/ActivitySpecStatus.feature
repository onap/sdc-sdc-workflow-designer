Feature: Activity Spec Status

  Scenario: Invalid Status Transition
    When I want to set the input data to file "resources/json/createActivitySpec.json"
    Then I want to update the input property "name" with a random value
    When I want to create an ActivitySpec
    Then I want to check property "id" exists
    And I want to check property "versionId" exists

    When I want to get the ActivitySpec for the current item
    Then I want to check property "status" for value "Draft"

    Then I want the following to fail with response status code 422
    When I want to call action "DEPRECATE" on this ActivitySpec item

    Then I want the following to fail with response status code 422
    When I want to call action "DELETE" on this ActivitySpec item

    When I want to call action "CERTIFY" on this ActivitySpec item
    Then I want the following to fail with response status code 422
    When I want to call action "CERTIFY" on this ActivitySpec item
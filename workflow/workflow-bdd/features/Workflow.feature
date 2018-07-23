Feature: Workflow

  Scenario: Create valid
    When I want to create a Workflow

  Scenario: Update and Get workflow
    When I want to create a Workflow
    Then I want to update the input property "description" with value "workflow desc updated"
    Then I want to update for path "/workflows/{item.id}" with the input data from the context
    Then I want to get path "/workflows/{item.id}"
    Then I want to check that property "description" in the response equals to value of saved property "inputData.description"

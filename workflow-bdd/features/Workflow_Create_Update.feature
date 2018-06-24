Feature: Workflow Example File

  Scenario: Create and get workflow
    When I want to create input data
    Then I want to update the input property "name" with a random value
    Then I want to update the input property "description" with value "workflow desc"
    Then I want to update the input property "category" with value "workflow category"

    Then I want to create for path "/workflows" with the input data from the context
    Then I want to copy to property "workflowId" from response data path "id"
    When I want to get path "/workflows"
    Then I want to check that element in the response list with "id" equals to value of saved property "workflowId" exists


  Scenario: Update workflow
    When I want to create input data
    Then I want to update the input property "name" with a random value
    Then I want to update the input property "description" with value "workflow desc"
    Then I want to update the input property "category" with value "workflow category"
    Then I want to create for path "/workflows" with the input data from the context
    Then I want to copy to property "workflowId" from response data path "id"

    Then I want to update the input property "description" with value "workflow desc updated"
    Then I want to set property "desc" to value "workflow desc updated"
    Then I want to update for path "/workflows/{workflowId}" with the input data from the context
    Then I want to get path "/workflows/{workflowId}"
    Then I want to check that property "description" in the response equals to value of saved property "desc"

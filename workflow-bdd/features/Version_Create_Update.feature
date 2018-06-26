Feature: Workflow Versions

  Background: Init
    Given I want to create a Workflow

  Scenario: Create and get version
    When I want to create input data
    Then I want to update the input property "description" with value "workflow version description"
    Then I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    Then I want to copy to property "versionId" from response data path "id"
    Then I want to get path "/workflows/{item.id}/versions/{versionId}"
    Then I want to check that property "id" in the response equals to value of saved property "versionId"

    When I want to get path "/workflows/{item.id}/versions"
    Then I want to check that element in the response list with "id" equals to value of saved property "versionId" exists


  Scenario: Update version
    When I want to create input data
    Then I want to update the input property "description" with value "workflow version description"
    Then I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    Then I want to copy to property "versionId" from response data path "id"

    Then I want to update the input property "description" with value "workflow version description updated"
    Then I want to set property "desc" to value "workflow version description updated"
    Then I want to update for path "/workflows/{item.id}/versions/{versionId}" with the input data from the context
    Then I want to get path "/workflows/{item.id}/versions/{versionId}"
    Then I want to check that property "description" in the response equals to value of saved property "desc"
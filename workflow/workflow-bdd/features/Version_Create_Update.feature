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
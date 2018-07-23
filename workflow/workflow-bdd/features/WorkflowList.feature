Feature: List Workflows

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
    And I want to update the input property "baseVersionId" with value of property "item.versionId"
    And I want to create for path "/workflows/{item.id}/versions" with the input data from the context
    #And I want to print the context data

  Scenario: List all
    When I want to get path "/workflows"
    Then I want to check that element in the response list with "id" equals to value of saved property "noVersionsWorkflowId" exists
    And I want to check that element in the response list with "id" equals to value of saved property "draftVersionWorkflowId" exists
    And I want to check that element in the response list with "id" equals to value of saved property "certifiedVersionWorkflowId" exists
    And I want to check that element in the response list with "id" equals to value of saved property "draftAndCertifiedVersionWorkflowId" exists

  Scenario: List ones with DRAFT version(s)
    When I want to get path "/workflows?versionState=DRAFT"
    Then I want to check that element in the response list with "id" equals to value of saved property "noVersionsWorkflowId" does not exist
    Then I want to check that element in the response list with "id" equals to value of saved property "draftVersionWorkflowId" exists
    Then I want to check that element in the response list with "id" equals to value of saved property "certifiedVersionWorkflowId" does not exist
    Then I want to check that element in the response list with "id" equals to value of saved property "draftAndCertifiedVersionWorkflowId" exists

  Scenario: List ones with CERTIFIED version(s)
    When I want to get path "/workflows?versionState=CERTIFIED"
    Then I want to check that element in the response list with "id" equals to value of saved property "noVersionsWorkflowId" does not exist
    Then I want to check that element in the response list with "id" equals to value of saved property "draftVersionWorkflowId" does not exist
    Then I want to check that element in the response list with "id" equals to value of saved property "certifiedVersionWorkflowId" exists
    Then I want to check that element in the response list with "id" equals to value of saved property "draftAndCertifiedVersionWorkflowId" exists

  Scenario: List ones with DRAFT/CERTIFIED version(s)
    When I want to get path "/workflows?versionState=DRAFT,CERTIFIED"
    Then I want to check that element in the response list with "id" equals to value of saved property "noVersionsWorkflowId" does not exist
    Then I want to check that element in the response list with "id" equals to value of saved property "draftVersionWorkflowId" exists
    Then I want to check that element in the response list with "id" equals to value of saved property "certifiedVersionWorkflowId" exists
    Then I want to check that element in the response list with "id" equals to value of saved property "draftAndCertifiedVersionWorkflowId" exists

  Scenario: List ones with gibberish version(s) = none
    When I want to get path "/workflows?versionState=gibberish"
    Then I want to check that element in the response list with "id" equals to value of saved property "noVersionsWorkflowId" does not exist
    Then I want to check that element in the response list with "id" equals to value of saved property "draftVersionWorkflowId" does not exist
    Then I want to check that element in the response list with "id" equals to value of saved property "certifiedVersionWorkflowId" does not exist
    Then I want to check that element in the response list with "id" equals to value of saved property "draftAndCertifiedVersionWorkflowId" does not exist
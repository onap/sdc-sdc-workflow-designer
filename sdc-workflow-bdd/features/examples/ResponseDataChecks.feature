Feature: Example for checking response data
  Scenario: Example Checks
    # setting some data just for testing purposes
    Given Response Data:
    """
    {
      "field1" : "string field",
      "field2" : true,
      "field3": "5",
      "field4" : [{"entry1":"a"},{"entry2":"b"},{"entry3":"c"}],
      "inputs": [
        {
          "mandatory": true,
          "name": "in1",
          "type": "STRING"
        },
        {
          "mandatory": true,
          "name": "in2",
          "type": "INTEGER"
        }
      ],
      "outputs": [
        {
          "mandatory": true,
          "name": "workflow",
          "type": "TIMESTAMP"
        },
        {
          "mandatory": true,
          "name": "out2",
          "type": "BOOLEAN"
        }
      ]
    }
    """
    # printing out for test purposes
    #Then I want to print the context data

    # running the different options of checking the respone data
    Then I want to check property "field1" for value "string field"
    Then I want to check property "field2" to be true
    Then I want to check property "field3" for value 5
    Then I want to check property "field4" to have length 3
    Then I want to check property "field4[0].entry1" exists
    Then I want to check property "field4[0].no_exist" does not exist
    Then I want to check property "outputs[0].name" exists
    Then I want to check property "outputs[0].name" for value "workflow"
    Then I want to check in the list "outputs" property "name" with value "out2" exists
    Then I want to check in the list "outputs" property "name" with value "out3" does not exist

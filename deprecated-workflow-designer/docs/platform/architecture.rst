.. This work is licensed under a Creative Commons Attribution 4.0 International License.


Architecture
------------
SDC Workflow Designer is a workflow design tool. It implements bpmn workflow standards. And it extends some elements for tosca specification. So in this designer the users can orchestrate services and interactive with tosca template more easily.

SDC Workflow Designer is a component of SDC. Right now it doesn't depend on other components. It can work alone. In the future, it will depend on MSB and SDC Catalog. 

SDC Workflow Designer contains two parts: UI, Backend.

.. image:: images/workflow-architecture.png

UI is the designer. It can access SDC Catalog to get tosca template info. Users can orchestrate ONAP services.

Backend is the storage of Workflow Designer. It will translate the workflow definition to standard bpmn workflow. And it can save workflow artifact to SDC catalog.
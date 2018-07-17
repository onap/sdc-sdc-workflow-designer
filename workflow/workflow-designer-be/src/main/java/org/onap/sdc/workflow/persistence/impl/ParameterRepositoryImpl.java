package org.onap.sdc.workflow.persistence.impl;

import static org.openecomp.core.zusammen.api.ZusammenUtil.buildElement;
import static org.openecomp.core.zusammen.api.ZusammenUtil.buildStructuralElement;
import static org.openecomp.core.zusammen.api.ZusammenUtil.createSessionContext;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.Id;
import com.amdocs.zusammen.datatypes.SessionContext;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import com.amdocs.zusammen.datatypes.item.Info;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.persistence.ParameterRepository;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterPropertyName;
import org.onap.sdc.workflow.persistence.types.ParameterRole;
import org.onap.sdc.workflow.persistence.types.ParameterType;
import org.onap.sdc.workflow.persistence.types.WorkflowElementType;
import org.openecomp.core.zusammen.api.ZusammenAdaptor;
import org.openecomp.core.zusammen.api.ZusammenAdaptorFactory;
import org.openecomp.types.ElementPropertyName;
import org.springframework.stereotype.Repository;

@Repository
public class ParameterRepositoryImpl implements ParameterRepository {

    private ZusammenAdaptor zusammenAdaptor = ZusammenAdaptorFactory.getInstance().createInterface();

    @Override
    public void createStructure(String id, String versionId) {

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement inputsElement = buildStructuralElement(WorkflowElementType.INPUTS.name(), Action.CREATE);
        ZusammenElement outputsElement = buildStructuralElement(WorkflowElementType.OUTPUTS.name(), Action.CREATE);

        zusammenAdaptor.saveElement(context, elementContext, inputsElement, "Create WorkflowVersion INPUTS Element");
        zusammenAdaptor.saveElement(context, elementContext, outputsElement, "Create WorkflowVersion OUTPUTS Element");
    }

    @Override
    public Collection<ParameterEntity> list(String id, String versionId, ParameterRole role) {

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        Optional<Element> parentElement = zusammenAdaptor.getElementByName(context, elementContext, null,
                getParentElementType(role));

        if (!parentElement.isPresent()) {
            return new ArrayList<>();
        } else {
            return zusammenAdaptor.listElements(context, elementContext, parentElement.get().getElementId()).stream()
                                  .map(elementInfo -> {
                                      ParameterEntity parameterEntity = new ParameterEntity();
                                      parameterEntity.setId(elementInfo.getId().getValue());
                                      parameterEntity.setName(elementInfo.getInfo().getName());
                                      parameterEntity.setType(ParameterType.valueOf(
                                              elementInfo.getInfo().getProperty(ParameterPropertyName.type.name())));
                                      parameterEntity.setMandatory(elementInfo.getInfo().getProperty(
                                              ParameterPropertyName.mandatory.name()));
                                      return parameterEntity;
                                  }).collect(Collectors.toList());
        }
    }

    @Override
    public void deleteAll(String id, String versionId, ParameterRole role) {

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        Optional<Element> optionalParentElement = zusammenAdaptor.getElementByName(context, elementContext, null,
                getParentElementType(role));

        if (!optionalParentElement.isPresent()) {
            return;
        }

        ZusammenElement parentElement = buildElement(optionalParentElement.get().getElementId(), Action.IGNORE);
        parentElement.setSubElements(optionalParentElement.get().getSubElements().stream()
                                                          .map(parameter -> buildElement(parameter.getElementId(),
                                                                  Action.DELETE)).collect(Collectors.toList()));

        zusammenAdaptor.saveElement(context, elementContext, parentElement, "Delete all " + role);
    }

    @Override
    public ParameterEntity get(String id, String versionId, String parameterId) {

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        Optional<Element> element = zusammenAdaptor.getElement(context, elementContext, parameterId);

        return element.map(this::elementToParameterEntity).orElse(null);
    }

    @Override
    public void delete(String id, String versionId, String parameterId){
        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement parameterElement = buildElement(new Id(parameterId),Action.DELETE);

        zusammenAdaptor.saveElement(context, elementContext, parameterElement,
                String.format("Delete Parameter with id %s", parameterId));

    }

    @Override
    public ParameterEntity create(String id, String versionId, ParameterRole role, ParameterEntity parameter) {

        ZusammenElement parameterElement =
                parameterToZusammenElement(parameter, WorkflowElementType.valueOf(role.name()), Action.CREATE);
        ZusammenElement parentElement =
                buildStructuralElement(getParentElementType(role), Action.IGNORE);
        parentElement.addSubElement(parameterElement);

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        Element savedElement = zusammenAdaptor.saveElement(context, elementContext, parentElement,
                "Create WorkflowVersion Parameter Element");

        parameter.setId(savedElement.getSubElements().iterator().next().getElementId().getValue());
        return parameter;
    }

    @Override
    public void update(String id, String versionId, ParameterRole role, ParameterEntity parameter) {

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement parameterElement =
                parameterToZusammenElement(parameter, WorkflowElementType.valueOf(role.name()), Action.UPDATE);

        zusammenAdaptor.saveElement(context, elementContext, parameterElement, "Update WorkflowVersion Parameter");
    }

    private ZusammenElement parameterToZusammenElement(ParameterEntity parameter, WorkflowElementType type,
            Action action) {
        ZusammenElement parameterElement =
                buildElement(parameter.getId() == null ? null : new Id(parameter.getId()), action);
        Info info = new Info();
        info.setName(parameter.getName());
        info.addProperty(ElementPropertyName.elementType.name(), type);
        info.addProperty(ParameterPropertyName.type.name(), parameter.getType());
        info.addProperty(ParameterPropertyName.mandatory.name(), parameter.isMandatory());
        parameterElement.setInfo(info);

        return parameterElement;
    }

     ParameterEntity elementToParameterEntity(Element element) {
        ParameterEntity parameterEntity = new ParameterEntity();
        parameterEntity.setId(element.getElementId().getValue());
        parameterEntity.setName(element.getInfo().getName());
        parameterEntity.setType(ParameterType.valueOf(
                (String) element.getInfo().getProperties().get(ParameterPropertyName.type.name())));
        parameterEntity
                .setMandatory((Boolean) element.getInfo().getProperties().get(ParameterPropertyName.mandatory.name()));

        return parameterEntity;
    }

    private String getParentElementType(ParameterRole role) {
        if (ParameterRole.INPUT.equals(role)) {
            return WorkflowElementType.INPUTS.name();
        } else if (ParameterRole.OUTPUT.equals(role)) {
            return WorkflowElementType.OUTPUTS.name();
        } else {
            throw new RuntimeException("Wrong Element Type");
        }
    }
}

/*
 * Copyright © 2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflow.persistence.impl;

import static org.onap.sdc.common.zusammen.services.ZusammenElementUtil.buildStructuralElement;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ElementInfo;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Optional;
import org.apache.commons.io.IOUtils;
import org.onap.sdc.common.versioning.persistence.zusammen.ZusammenSessionContextCreator;
import org.onap.sdc.common.zusammen.services.ZusammenAdaptor;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.persistence.impl.types.WorkflowElementType;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.springframework.stereotype.Repository;

@Repository
public class ArtifactRepositoryImpl implements ArtifactRepository {

    private static final String FILE_NAME_PROPERTY = "fileName";
    private static final String EMPTY_DATA = "{}";

    private final ZusammenAdaptor zusammenAdaptor;
    private final ZusammenSessionContextCreator contextCreator;

    public ArtifactRepositoryImpl(ZusammenAdaptor zusammenAdaptor, ZusammenSessionContextCreator contextCreator) {
        this.zusammenAdaptor = zusammenAdaptor;
        this.contextCreator = contextCreator;
    }

    @Override
    public void update(String workflowId, String versionId, ArtifactEntity artifactEntity) {

        ZusammenElement artifactElement = buildStructuralElement(WorkflowElementType.ARTIFACT.name(), Action.UPDATE);
        artifactElement.setData(artifactEntity.getArtifactData());
        artifactElement.getInfo().addProperty(FILE_NAME_PROPERTY, artifactEntity.getFileName());


        ElementContext elementContext = new ElementContext(workflowId, versionId);

        zusammenAdaptor
                .saveElement(contextCreator.create(), elementContext, artifactElement, "Update WorkflowVersion Artifact Element");
    }

    @Override
    public Optional<ArtifactEntity> get(String workflowId, String versionId) {

        ElementContext elementContext = new ElementContext(workflowId, versionId);

        Optional<Element> elementOptional =
                zusammenAdaptor.getElementByName(contextCreator.create(), elementContext, null, WorkflowElementType.ARTIFACT.name());

        if (!elementOptional.isPresent() || hasEmptyData(elementOptional.get().getData())) {
            return Optional.empty();
        }

        Element artifactElement = elementOptional.get();

        ArtifactEntity artifact = new ArtifactEntity(artifactElement.getInfo().getProperty(FILE_NAME_PROPERTY),
                artifactElement.getData());

        return Optional.of(artifact);
    }

    @Override
    public boolean isExist(String workflowId, String versionId) {

        ElementContext elementContext = new ElementContext(workflowId, versionId);

        Optional<ElementInfo> optionalElementInfo = zusammenAdaptor.getElementInfoByName(contextCreator.create(), elementContext, null,
                WorkflowElementType.ARTIFACT.name());
        return optionalElementInfo.isPresent() && optionalElementInfo.get().getInfo().getProperties()
                                                                     .containsKey(FILE_NAME_PROPERTY);
    }

    @Override
    public void createStructure(String workflowId, String versionId) {

        ElementContext elementContext = new ElementContext(workflowId, versionId);

        ZusammenElement artifactElement = buildStructuralElement(WorkflowElementType.ARTIFACT.name(), Action.CREATE);
        artifactElement.setData(new ByteArrayInputStream(EMPTY_DATA.getBytes()));

        zusammenAdaptor
                .saveElement(contextCreator.create(), elementContext, artifactElement, "Create WorkflowVersion Artifact Element");

    }

    @Override
    public void delete(String workflowId, String versionId) {

        ElementContext elementContext = new ElementContext(workflowId, versionId);

        ZusammenElement artifactElement = buildStructuralElement(WorkflowElementType.ARTIFACT.name(), Action.UPDATE);
        artifactElement.setData(new ByteArrayInputStream(EMPTY_DATA.getBytes()));
        artifactElement.getInfo().getProperties().remove(FILE_NAME_PROPERTY);

        zusammenAdaptor.saveElement(contextCreator.create(), elementContext, artifactElement, "Delete WorkflowVersion Artifact Data");

    }

    private boolean hasEmptyData(InputStream elementData) {

        byte[] byteElementData;
        try {
            byteElementData = IOUtils.toByteArray(elementData);
        } catch (IOException ex) {
            return false;
        }
        return Arrays.equals(EMPTY_DATA.getBytes(), byteElementData);
    }
}

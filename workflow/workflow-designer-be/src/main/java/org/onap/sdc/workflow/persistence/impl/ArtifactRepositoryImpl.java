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

import static org.openecomp.core.zusammen.api.ZusammenUtil.buildStructuralElement;
import static org.openecomp.core.zusammen.api.ZusammenUtil.createSessionContext;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.SessionContext;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Optional;
import org.apache.commons.io.IOUtils;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowElementType;
import org.openecomp.core.zusammen.api.ZusammenAdaptor;
import org.openecomp.core.zusammen.api.ZusammenAdaptorFactory;
import org.springframework.stereotype.Repository;

@Repository
public class ArtifactRepositoryImpl implements ArtifactRepository {

    private static final String FILE_NAME_PROPERTY = "fileName";
    private static final String EMPTY_DATA = "{}";
    private ZusammenAdaptor zusammenAdaptor = ZusammenAdaptorFactory.getInstance().createInterface();


    @Override
    public void update(String id, String versionId, ArtifactEntity artifactEntity) {

        ZusammenElement artifactElement = buildStructuralElement(WorkflowElementType.ARTIFACT.name(), Action.UPDATE);
        artifactElement.setData(artifactEntity.getArtifactData());
        artifactElement.getInfo().addProperty(FILE_NAME_PROPERTY, artifactEntity.getFileName());

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        zusammenAdaptor
                .saveElement(context, elementContext, artifactElement, "Update WorkflowVersion Artifact Element");
    }

    @Override
    public Optional<ArtifactEntity> get(String id, String versionId) {
        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        Optional<Element> elementOptional =
                zusammenAdaptor.getElementByName(context, elementContext, null, WorkflowElementType.ARTIFACT.name());

        if (!elementOptional.isPresent() || hasEmptyData(elementOptional.get().getData())) {
            return Optional.empty();
        }

        Element artifactElement = elementOptional.get();

        ArtifactEntity artifact = new ArtifactEntity(artifactElement.getInfo().getProperty(FILE_NAME_PROPERTY),
                artifactElement.getData());

        return Optional.of(artifact);
    }

    @Override
    public void createStructure(String id, String versionId) {
        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement artifactElement = buildStructuralElement(WorkflowElementType.ARTIFACT.name(), Action.CREATE);
        artifactElement.setData(new ByteArrayInputStream(EMPTY_DATA.getBytes()));

        zusammenAdaptor
                .saveElement(context, elementContext, artifactElement, "Create WorkflowVersion Artifact Element");

    }

    @Override
    public void delete(String id, String versionId) {
        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement artifactElement = buildStructuralElement(WorkflowElementType.ARTIFACT.name(), Action.UPDATE);
        artifactElement.setData(new ByteArrayInputStream(EMPTY_DATA.getBytes()));
        artifactElement.getInfo().getProperties().remove(FILE_NAME_PROPERTY);

        zusammenAdaptor
                .saveElement(context, elementContext, artifactElement, "Delete WorkflowVersion Artifact Data");

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

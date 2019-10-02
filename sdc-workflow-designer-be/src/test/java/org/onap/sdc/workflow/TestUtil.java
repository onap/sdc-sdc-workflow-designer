/*
 * Copyright © 2016-2018 European Support Limited
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

package org.onap.sdc.workflow;

import static org.onap.sdc.workflow.services.impl.ItemType.WORKFLOW;

import org.onap.sdc.common.versioning.persistence.types.InternalItem;
import org.onap.sdc.common.versioning.persistence.types.InternalVersion;
import org.onap.sdc.common.versioning.services.types.VersionStatus;
import org.onap.sdc.workflow.services.types.Workflow;
import org.onap.sdc.workflow.services.types.ArchivingStatus;
import org.onap.sdc.common.versioning.services.types.Item;
import org.onap.sdc.common.versioning.services.types.ItemStatus;

public class TestUtil {

    public static Workflow createWorkflow(int workflowNum, boolean createId, ArchivingStatus archivingStatus) {
        Workflow workflow = new Workflow();
        if (createId) {
            workflow.setId(String.valueOf(workflowNum));
        }
        workflow.setName("Workflow_" + workflowNum);
        workflow.setDescription("Description_" + workflowNum);
        workflow.setArchiving(archivingStatus);

        return workflow;
    }

    public static Item createItem(int itemNum, boolean setType, boolean setId, ItemStatus archivingStatus) {
        InternalItem item = new InternalItem();
        if (setId) {
            item.setId(String.valueOf(itemNum));
        }
        item.setName("Workflow_" + itemNum);
        item.setDescription("Description_" + itemNum);
        if (setType) {
            item.setType(WORKFLOW.name());
        }
        item.setStatus(archivingStatus);
        return item;
    }

    public static InternalVersion createRetrievedVersion(String id, VersionStatus status) {
        InternalVersion version = new InternalVersion();
        version.setId(id);
        version.setStatus(status);
        return version;
    }


}

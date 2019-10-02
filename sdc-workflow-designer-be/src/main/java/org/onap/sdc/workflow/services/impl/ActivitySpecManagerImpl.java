/*
 * Copyright © 2016-2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflow.services.impl;

import static org.onap.sdc.common.versioning.services.types.VersionStatus.Certified;
import static org.onap.sdc.common.versioning.services.types.VersionStatus.Deleted;
import static org.onap.sdc.common.versioning.services.types.VersionStatus.Deprecated;
import static org.onap.sdc.common.versioning.services.types.VersionStatus.Draft;
import static org.onap.sdc.workflow.services.ActivitySpecConstant.ACTIVITY_SPEC_NOT_FOUND;
import static org.onap.sdc.workflow.services.ActivitySpecConstant.VERSION_ID_DEFAULT_VALUE;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.onap.sdc.common.versioning.services.ItemManager;
import org.onap.sdc.common.versioning.services.VersioningManager;
import org.onap.sdc.common.versioning.services.types.Item;
import org.onap.sdc.common.versioning.services.types.Version;
import org.onap.sdc.common.versioning.services.types.VersionCreationMethod;
import org.onap.sdc.common.versioning.services.types.VersionStatus;
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecAction;
import org.onap.sdc.workflow.persistence.ActivitySpecRepository;
import org.onap.sdc.workflow.persistence.types.ActivitySpecEntity;
import org.onap.sdc.workflow.services.ActivitySpecManager;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.VersionStatusModificationException;
import org.onap.sdc.workflow.services.impl.mappers.ActivitySpecMapper;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service("activitySpecManager")
public class ActivitySpecManagerImpl implements ActivitySpecManager {

    private static final String ACTIVITY_SPEC_NAME = "ActivitySpec.Name";
    private static final Logger LOGGER = LoggerFactory.getLogger(ActivitySpecManagerImpl.class);
    private static final Map<VersionStatus, VersionStatus> EXPECTED_PREV_STATUS;

    static {
        EXPECTED_PREV_STATUS = new EnumMap<>(VersionStatus.class);
        EXPECTED_PREV_STATUS.put(Certified, Draft);
        EXPECTED_PREV_STATUS.put(Deprecated, Certified);
        EXPECTED_PREV_STATUS.put(Deleted, Deprecated);
    }

    private final ItemManager itemManager;
    private final VersioningManager versioningManager;
    private final ActivitySpecRepository activitySpecDao;
    private final UniqueValueService uniqueValueService;
    private final ActivitySpecMapper activitySpecMapper;


    @Autowired
    public ActivitySpecManagerImpl(ItemManager itemManager, VersioningManager versioningManager,
            ActivitySpecRepository activitySpecDao,
            @Qualifier("uniqueValueService") UniqueValueService uniqueValueService,
            ActivitySpecMapper activitySpecMapper) {
        this.itemManager = itemManager;
        this.versioningManager = versioningManager;
        this.activitySpecDao = activitySpecDao;
        this.uniqueValueService = uniqueValueService;
        this.activitySpecMapper = activitySpecMapper;
    }

    @Override
    public ActivitySpecEntity createActivitySpec(ActivitySpecEntity activitySpec) {

        uniqueValueService.validateUniqueValue(ACTIVITY_SPEC_NAME, activitySpec.getName());

        Item item = new Item();
        activitySpecMapper.toItem(activitySpec, item);
        Item createdItem = itemManager.create(item);

        Version createdVersion =
                versioningManager.create(createdItem.getId(), null, new Version(), VersionCreationMethod.major);

        activitySpec.setId(createdItem.getId());
        activitySpec.setVersionId(createdVersion.getId());
        activitySpecDao.create(activitySpec);

        uniqueValueService.createUniqueValue(ACTIVITY_SPEC_NAME, activitySpec.getName());
        return activitySpec;
    }

    @Override
    public ActivitySpecEntity get(ActivitySpecEntity activitySpec) {
        activitySpec.setVersionId(calculateLatestVersion(activitySpec));
        ActivitySpecEntity retrieved;
        try {

            retrieved = activitySpecDao.get(activitySpec);
        } catch (RuntimeException e) {
            LOGGER.error("Failed to retrieve activity spec for activitySpecId: {} and version: {}",
                    activitySpec.getId(), activitySpec.getVersionId(), e);
            throw new EntityNotFoundException(ACTIVITY_SPEC_NOT_FOUND);
        }
        if (retrieved != null) {
            final Version retrievedVersion = versioningManager.get(activitySpec.getId(), activitySpec.getVersionId());
            retrieved.setStatus(Objects.nonNull(retrievedVersion) ? retrievedVersion.getStatus().name() : null);
        }
        return retrieved;
    }

    @Override
    public void update(ActivitySpecEntity activitySpec) {
        Item item = itemManager.get(activitySpec.getId());
        if (item == null) {
            LOGGER.error("Activity Spec with id {} was not found", activitySpec.getId());
            throw new EntityNotFoundException(ACTIVITY_SPEC_NOT_FOUND);
        }
        uniqueValueService.updateUniqueValue(ACTIVITY_SPEC_NAME, item.getName(), activitySpec.getName());

        activitySpecMapper.toItem(activitySpec, item);
        itemManager.update(activitySpec.getId(), item);

        activitySpec.setVersionId(calculateLatestVersion(activitySpec));
        activitySpecDao.update(activitySpec);
    }

    @Override
    public void actOnAction(ActivitySpecEntity activitySpec, ActivitySpecAction action) {
        VersionStatus newStatus = getVersionStatusByAction(action);

        String versionId = calculateLatestVersion(activitySpec);
        Version retrievedVersion;
        try {
            retrievedVersion = versioningManager.get(activitySpec.getId(), versionId);
        } catch (RuntimeException e) {
            LOGGER.error("failed to get activity {}, version {}", activitySpec.getId(), versionId, e);
            throw new EntityNotFoundException(ACTIVITY_SPEC_NOT_FOUND);
        }
        if (retrievedVersion == null) {
            throw new EntityNotFoundException(ACTIVITY_SPEC_NOT_FOUND);
        }

        VersionStatus retrievedStatus = retrievedVersion.getStatus();
        VersionStatus expectedPrevStatus = EXPECTED_PREV_STATUS.get(newStatus);
        if (expectedPrevStatus != null && retrievedStatus != expectedPrevStatus) {
            LOGGER.debug("Failed to {} since activity spec is in status {}", action.name(), retrievedStatus);
            throw new VersionStatusModificationException(activitySpec.getId(), versionId, retrievedStatus,
                    newStatus);
        }

        versioningManager.updateStatus(activitySpec.getId(), retrievedVersion.getId(), newStatus,
                "actionOnActivitySpec :" + action.name());

        if (action == ActivitySpecAction.DELETE) {
            final String activitySpecName = get(new ActivitySpecEntity(activitySpec.getId(), versionId)).getName();
            uniqueValueService.deleteUniqueValue(ACTIVITY_SPEC_NAME, activitySpecName);
        }
    }

    private VersionStatus getVersionStatusByAction(ActivitySpecAction action) {
        switch (action) {
            case DELETE:
                return Deleted;
            case DEPRECATE:
                return Deprecated;
            case CERTIFY:
                return Certified;
            default:
                throw new UnsupportedOperationException(
                        String.format("Activity Spec action %s is not supported", action.name()));
        }

    }

    @Override
    public Collection<ActivitySpecEntity> list(String versionStatus) {
        Predicate<Item> itemPredicate;
        if (Objects.nonNull(versionStatus)) {
            VersionStatus statusEnumValue;

            try {
                statusEnumValue = VersionStatus.valueOf(versionStatus);
            } catch (IllegalArgumentException e) {
                LOGGER.debug("Unexpected value of VersionStatus {}", versionStatus);
                return Collections.emptyList();
            }
            itemPredicate =
                    item -> ItemType.ACTIVITYSPEC.name().equals(item.getType()) && item.getVersionStatusCounters()
                                                                                           .containsKey(
                                                                                                   statusEnumValue);
        } else {
            itemPredicate = item -> ItemType.ACTIVITYSPEC.name().equals(item.getType());
        }

        return itemManager.list(itemPredicate).stream()
                       .sorted(Comparator.comparing(Item::getModificationTime).reversed())
                       .map(activitySpecMapper::itemToActivitySpec).collect(Collectors.toList());
    }

    private String calculateLatestVersion(ActivitySpecEntity activitySpec) {
        if (VERSION_ID_DEFAULT_VALUE.equalsIgnoreCase(activitySpec.getVersionId())) {
            List<Version> versions;
            try {
                versions = versioningManager.list(activitySpec.getId());
            } catch (RuntimeException e) {
                LOGGER.error("Failed to list versions for activitySpecId {}", activitySpec.getId(), e);
                throw new EntityNotFoundException(ACTIVITY_SPEC_NOT_FOUND);
            }
            if (Objects.nonNull(versions) && !versions.isEmpty()) {
                return versions.get(0).getId();
            }
        }
        return activitySpec.getVersionId();
    }
}

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

import static org.onap.sdc.workflow.services.ActivitySpecConstant.ACTIVITY_SPEC_NOT_FOUND;
import static org.onap.sdc.workflow.services.ActivitySpecConstant.VERSION_ID_DEFAULT_VALUE;
import static org.openecomp.sdc.versioning.dao.types.VersionStatus.Certified;
import static org.openecomp.sdc.versioning.dao.types.VersionStatus.Deleted;
import static org.openecomp.sdc.versioning.dao.types.VersionStatus.Deprecated;
import static org.openecomp.sdc.versioning.dao.types.VersionStatus.Draft;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecAction;
import org.onap.sdc.workflow.persistence.ActivitySpecRepository;
import org.onap.sdc.workflow.persistence.types.ActivitySpecEntity;
import org.onap.sdc.workflow.services.ActivitySpecManager;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.VersionStatusModificationException;
import org.onap.sdc.workflow.services.impl.mappers.ActivitySpecMapper;
import org.openecomp.sdc.common.errors.SdcRuntimeException;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.VersionCreationMethod;
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

        Item item = activitySpecMapper.activitySpecToItem(activitySpec);
        item = itemManager.create(item);

        Version version = getActivitySpecVersion(activitySpec);
        versioningManager.create(item.getId(), version, VersionCreationMethod.major);

        enrichActivitySpec(item, version, activitySpec);
        activitySpecDao.create(activitySpec);

        uniqueValueService.createUniqueValue(ACTIVITY_SPEC_NAME, activitySpec.getName());
        return activitySpec;
    }

    @Override
    public ActivitySpecEntity get(ActivitySpecEntity activitySpec) {
        activitySpec.setVersion(calculateLatestVersion(activitySpec));
        ActivitySpecEntity retrieved;
        try {
            retrieved = activitySpecDao.get(activitySpec);
        } catch (SdcRuntimeException runtimeException) {
            LOGGER.debug(
                    "Failed to retrieve activity spec for activitySpecId: " + activitySpec.getId() + " and version: "
                            + activitySpec.getVersion().getId(), runtimeException);
            throw new EntityNotFoundException(ACTIVITY_SPEC_NOT_FOUND);
        }
        if (retrieved != null) {
            final Version retrievedVersion = versioningManager.get(activitySpec.getId(), activitySpec.getVersion());
            retrieved.setStatus(Objects.nonNull(retrievedVersion) ? retrievedVersion.getStatus().name() : null);
        }
        return retrieved;
    }

    @Override
    public void update(ActivitySpecEntity activitySpec) {
        Item retrievedItem = itemManager.get(activitySpec.getId());
        if (retrievedItem == null) {
            LOGGER.error(String.format("Activity Spec with id %s was not found", activitySpec.getId()));
            throw new EntityNotFoundException(ACTIVITY_SPEC_NOT_FOUND);
        }
        uniqueValueService.updateUniqueValue(ACTIVITY_SPEC_NAME, retrievedItem.getName(), activitySpec.getName());

        Item item = activitySpecMapper.activitySpecToItem(activitySpec);
        item.setId(activitySpec.getId());
        item.setStatus(retrievedItem.getStatus());
        item.setVersionStatusCounters(retrievedItem.getVersionStatusCounters());
        itemManager.update(item);

        activitySpec.setVersion(calculateLatestVersion(activitySpec));
        activitySpecDao.update(activitySpec);
    }

    @Override
    public void actOnAction(ActivitySpecEntity activitySpec, ActivitySpecAction action) {
        Version version = calculateLatestVersion(activitySpec);
        if (action == ActivitySpecAction.CERTIFY) {
            version.setStatus(Certified);
        }
        if (action == ActivitySpecAction.DEPRECATE) {
            version.setStatus(Deprecated);
        }
        if (action == ActivitySpecAction.DELETE) {
            version.setStatus(Deleted);
        }

        updateVersionStatus(activitySpec.getId(), action, version);
        if (action == ActivitySpecAction.DELETE) {
            final String activitySpecName = get(new ActivitySpecEntity(activitySpec.getId(), version)).getName();
            uniqueValueService.deleteUniqueValue(ACTIVITY_SPEC_NAME, activitySpecName);
        }
    }

    private void updateVersionStatus(String activitySpecId, ActivitySpecAction action, Version version) {
        VersionStatus prevVersionStatus = null;
        Version retrievedVersion;
        try {
            retrievedVersion = versioningManager.get(activitySpecId, version);
        } catch (SdcRuntimeException exception) {
            LOGGER.debug(
                    "Failed to get version for activitySpecId: " + activitySpecId + " and version: " + version.getId(),
                    exception);
            throw new EntityNotFoundException(ACTIVITY_SPEC_NOT_FOUND);

        }

        VersionStatus status = version.getStatus();
        VersionStatus expectedPrevStatus = EXPECTED_PREV_STATUS.get(status);
        if (expectedPrevStatus != null) {

            VersionStatus retrievedStatus = Objects.nonNull(retrievedVersion) ? retrievedVersion.getStatus() : null;
            if (retrievedStatus != expectedPrevStatus) {
                LOGGER.debug("Failed to " + version.getStatus() + " since activity spec is in " + retrievedStatus);
                throw new VersionStatusModificationException(activitySpecId, version.getId(), retrievedStatus, status);
            }
            prevVersionStatus = expectedPrevStatus;
        }

        if (Objects.nonNull(retrievedVersion)) {
            retrievedVersion.setStatus(status);
            versioningManager.updateVersion(activitySpecId, retrievedVersion);
            itemManager.updateVersionStatus(activitySpecId, status, prevVersionStatus);
            versioningManager.publish(activitySpecId, retrievedVersion, "actionOnActivitySpec :" + action.name());
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

    private Version calculateLatestVersion(ActivitySpecEntity activitySpec) {
        if (VERSION_ID_DEFAULT_VALUE.equalsIgnoreCase(activitySpec.getVersion().getId())) {
            List<Version> list;
            try {
                list = versioningManager.list(activitySpec.getId());
            } catch (SdcRuntimeException runtimeException) {
                LOGGER.debug("Failed to list versions for activitySpecId " + activitySpec.getId(), runtimeException);
                throw new EntityNotFoundException(ACTIVITY_SPEC_NOT_FOUND);
            }
            if (Objects.nonNull(list) && !list.isEmpty()) {
                return list.get(0);
            }
        }
        return activitySpec.getVersion();
    }

    private Version getActivitySpecVersion(ActivitySpecEntity activitySpecEntity) {
        return activitySpecEntity.getVersion() == null ? new Version() : activitySpecEntity.getVersion();

    }

    private void enrichActivitySpec(Item item, Version version, ActivitySpecEntity activitySpecEntity) {
        activitySpecEntity.setId(item.getId());
        activitySpecEntity.setVersion(version);
    }
}

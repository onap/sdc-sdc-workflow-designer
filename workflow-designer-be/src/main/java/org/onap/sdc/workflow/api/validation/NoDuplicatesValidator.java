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

package org.onap.sdc.workflow.api.validation;

import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;

public class NoDuplicatesValidator implements ConstraintValidator<NoDuplicates, Collection<ParameterEntity>> {

    @Override
    public boolean isValid(Collection<ParameterEntity> parameterEntities, ConstraintValidatorContext context) {
        if (Objects.isNull(parameterEntities) || parameterEntities.size() < 2) {
            return true;
        }
        Set<String> testSet = new HashSet<>();
        return !parameterEntities.stream().anyMatch(s -> !testSet.add(s.getName()));
    }
}

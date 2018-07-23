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

package org.onap.sdc.workflow.api.types;

import java.util.Collection;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CollectionWrapper<T> {

    private int total;
    private int size;
    private int page;
    private Collection<T> results;

    public CollectionWrapper(int size, int page, Collection<T> results) {
        this.results = results;
        this.size = size;
        this.page = page;
        this.total = results.size();
    }

    public CollectionWrapper(Collection<T> results) {
        this.results = results;
        this.total = results.size();
    }
}
